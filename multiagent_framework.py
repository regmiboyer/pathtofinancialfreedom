"""
Investment Planner — Multi-Agent Framework
============================================
4 agents running in sequence with a QA feedback loop.

  User Request → [Orchestrator]
      → PM Agent (user story + acceptance criteria)
      → Developer Agent (Jira ticket → implements feature)
      → QA Agent ⟺ Developer (up to 3 iterations)
      → Release Agent (applies patches → release notes)

Usage:
    pip install anthropic
    export ANTHROPIC_API_KEY=sk-...
    python multiagent_framework.py "Add a dark mode toggle to Strategy I"
"""

import os
import sys
import json
import shutil
from datetime import datetime
from pathlib import Path

try:
    import anthropic
except ImportError:
    print("Run: pip install anthropic")
    sys.exit(1)

ROOT          = Path(__file__).parent
APP_FILE      = ROOT / "index.html"
RELEASES_DIR  = ROOT / "releases"

MODEL             = "claude-opus-4-6"
MAX_QA_ITERATIONS = 3
MAX_TOKENS        = 4096

# ─────────────────────────────────────────────────────────────────────────────
# AGENT PROMPTS
# ─────────────────────────────────────────────────────────────────────────────
PROMPTS = {
    "pm": """
You are the Product Manager for the Investment Planner — a single-file HTML app
with 8 investment strategies.

Return ONLY a JSON object:
{
  "story_id": "US-<YYMMDD-NN>",
  "title": "Short imperative title",
  "user_story": "As a <user>, I want <feature> so that <value>.",
  "acceptance_criteria": ["AC1: Given … When … Then …"],
  "priority": "high|medium|low",
  "story_points": <fibonacci 1-13>,
  "technical_notes": "Implementation hints for the developer.",
  "out_of_scope": ["Anything explicitly excluded."]
}""",

    "dev": """
You are the Senior Front-End Developer for the Investment Planner.
Stack: single HTML file (~11 000 lines), vanilla JS, Chart.js 4.5, CSS-in-HTML.

Return ONLY JSON for either a Jira ticket:
{
  "ticket_id": "INVEST-<NNN>",
  "title": "…",
  "description": "…",
  "story_points": <N>,
  "component": "Strategy I|…|Global",
  "implementation_plan": ["1. …"],
  "files_to_change": ["index.html"]
}

Or code changes:
{
  "ticket_id": "INVEST-<NNN>",
  "iteration": <N>,
  "changes": [{"description": "…", "search": "exact string", "replace": "replacement"}],
  "summary": "Executive summary.",
  "testing_notes": "How QA should test."
}""",

    "qa": """
You are the QA Engineer for the Investment Planner.
Validate every acceptance criterion. Think adversarially. Approve only when ALL pass.

Return ONLY JSON:
{
  "review_id": "QA-<story_id>-iter<N>",
  "iteration": <N>,
  "status": "approved|rejected",
  "passed_criteria": ["AC1"],
  "failed_criteria": ["AC2"],
  "bugs": [{"id": "BUG-<N>", "severity": "critical|major|minor", "title": "…", "steps": "…", "expected": "…", "actual": "…"}],
  "approval_notes": "…"
}""",

    "release": """
You are the Release Manager for the Investment Planner.
Apply approved patches, write release notes.

Return ONLY JSON:
{
  "version": "1.0.<build>",
  "release_date": "<ISO date>",
  "ticket_id": "INVEST-<NNN>",
  "story_title": "…",
  "changes_applied": <N>,
  "release_notes": "Markdown changelog entry.",
  "status": "released|failed",
  "failure_reason": null
}""",
}

AGENT_EMOJI = {"pm": "📋", "dev": "💻", "qa": "🧪", "release": "🚢"}


# ─────────────────────────────────────────────────────────────────────────────
# AGENT
# ─────────────────────────────────────────────────────────────────────────────
class Agent:
    def __init__(self, role: str):
        self.role = role
        self.client = anthropic.Anthropic()

    def call(self, task: str, context: dict | None = None) -> dict:
        user_content = task
        if context:
            ctx_block = f"## Workflow Context\n```json\n{json.dumps(context, indent=2)}\n```\n\n"
            user_content = ctx_block + f"## Your Task\n{task}"

        emoji = AGENT_EMOJI[self.role]
        print(f"\n{emoji} [{self.role.upper()}] Working...")

        resp = self.client.messages.create(
            model=MODEL,
            max_tokens=MAX_TOKENS,
            system=PROMPTS[self.role],
            messages=[{"role": "user", "content": user_content}],
        )
        return self._parse_json(resp.content[0].text)

    @staticmethod
    def _parse_json(raw: str) -> dict:
        cleaned = raw.strip()
        if cleaned.startswith("```"):
            cleaned = cleaned.split("\n", 1)[1] if "\n" in cleaned else cleaned[3:]
            if cleaned.endswith("```"):
                cleaned = cleaned[:-3]
        start = cleaned.find("{")
        end = cleaned.rfind("}") + 1
        if start >= 0 and end > start:
            try:
                return json.loads(cleaned[start:end])
            except json.JSONDecodeError:
                pass
        return {"raw": raw}


# ─────────────────────────────────────────────────────────────────────────────
# RELEASE — patch application
# ─────────────────────────────────────────────────────────────────────────────
def apply_patches(code_changes: dict) -> int:
    if not APP_FILE.exists():
        print(f"   ⚠  {APP_FILE} not found — skipping.")
        return 0

    html = APP_FILE.read_text(encoding="utf-8")
    applied = 0
    for change in code_changes.get("changes", []):
        search = change.get("search", "")
        replace = change.get("replace", "")
        if search and search in html:
            html = html.replace(search, replace, 1)
            applied += 1
            print(f"   ✓ Applied: {change.get('description', '')[:60]}")
        else:
            print(f"   ✗ Skipped (not found): {change.get('description', '')[:60]}")

    if applied:
        backup = APP_FILE.with_suffix(f".bak-{datetime.now().strftime('%H%M%S')}.html")
        shutil.copy2(APP_FILE, backup)
        APP_FILE.write_text(html, encoding="utf-8")
    return applied


# ─────────────────────────────────────────────────────────────────────────────
# ORCHESTRATOR
# ─────────────────────────────────────────────────────────────────────────────
def banner(msg: str):
    print(f"\n{'─'*60}\n  {msg}\n{'─'*60}")


def run(feature_request: str):
    pm = Agent("pm")
    dev = Agent("dev")
    qa = Agent("qa")
    rel = Agent("release")

    workflow_id = f"WF-{datetime.now().strftime('%Y%m%d-%H%M%S')}"
    banner(f"🚀 Workflow {workflow_id}")
    print(f"Feature: {feature_request}\n")

    # Step 1 — PM: User Story
    banner("STEP 1 — Product Manager: User Story")
    story = pm.call(f"Create a user story for:\n\n> {feature_request}\n\nReturn JSON only.")
    print(f"   Story: {story.get('story_id', '?')} — {story.get('title', '')}")

    # Step 2 — Dev: Jira Ticket
    banner("STEP 2 — Developer: Jira Ticket")
    ticket = dev.call("Create a Jira ticket for this user story. Return JSON only.", context={"story": story})
    print(f"   Ticket: {ticket.get('ticket_id', '?')} — {ticket.get('title', '')}")

    # Step 3 — Dev: Implementation
    banner("STEP 3 — Developer: Implementation")
    code_changes = dev.call(
        "Implement the feature (iteration 1). Return code-change JSON only.",
        context={"story": story, "ticket": ticket, "iteration": 1},
    )
    print(f"   {len(code_changes.get('changes', []))} patch(es) produced.")

    # Step 4 — QA ↔ Dev loop
    banner(f"STEP 4 — QA ↔ Developer (max {MAX_QA_ITERATIONS} iterations)")
    for i in range(1, MAX_QA_ITERATIONS + 1):
        print(f"\n  ── QA Iteration {i}/{MAX_QA_ITERATIONS} ──")
        qa_result = qa.call(f"Review iteration {i}. Return JSON only.", context={"story": story, "code_changes": code_changes, "iteration": i})

        status = qa_result.get("status", "rejected")
        bugs = qa_result.get("bugs", [])
        print(f"   {'✅ APPROVED' if status == 'approved' else f'❌ REJECTED — {len(bugs)} bug(s)'}")
        for b in bugs:
            print(f"      [{b.get('severity', '?').upper():8}] {b.get('title', '')}")

        if status == "approved":
            break

        if i < MAX_QA_ITERATIONS:
            print(f"\n  ── Developer Fix (iteration {i+1}) ──")
            code_changes = dev.call(
                f"Fix the QA bugs (iteration {i+1}). Return code-change JSON only.",
                context={"story": story, "ticket": ticket, "bug_report": qa_result, "iteration": i + 1},
            )
            print(f"   {len(code_changes.get('changes', []))} fix(es) produced.")
        else:
            print("  ⚠  Max QA iterations reached — proceeding with latest build.")

    # Step 5 — Release
    banner("STEP 5 — Release Manager: Deploy")
    RELEASES_DIR.mkdir(parents=True, exist_ok=True)
    applied = apply_patches(code_changes)
    version = f"1.0.{datetime.now().strftime('%j%H%M')}"

    manifest = rel.call(
        f"Generate release manifest for v{version}. Return JSON only.",
        context={"story": story, "ticket": ticket, "code_changes": code_changes, "version": version, "patches_applied": applied},
    )
    manifest.setdefault("version", version)
    manifest.setdefault("changes_applied", applied)
    manifest.setdefault("status", "released")

    release_file = RELEASES_DIR / f"release-{version}.json"
    release_file.write_text(json.dumps(manifest, indent=2))

    banner(f"✅ RELEASED  v{version}  |  workflow: {workflow_id}")
    print(f"  Manifest: {release_file}")


# ─────────────────────────────────────────────────────────────────────────────
# ENTRY POINT
# ─────────────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    if not os.getenv("ANTHROPIC_API_KEY"):
        print("Error: ANTHROPIC_API_KEY environment variable not set.")
        sys.exit(1)

    request = " ".join(sys.argv[1:]) if len(sys.argv) > 1 else None
    if not request:
        request = input("\nEnter feature request:\n> ").strip()
    if not request:
        print("No feature request provided.")
        sys.exit(1)

    run(request)
