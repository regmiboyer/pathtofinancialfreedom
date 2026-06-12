"""
Investment Planner — Multi-Agent Framework
============================================
4 agents running in sequence with a QA feedback loop and a computer-use release step.

  User Request
      │
  [Orchestrator]
      │
  ┌───▼──────────────┐
  │   PM Agent       │  Creates user story + acceptance criteria
  └───┬──────────────┘
      │
  ┌───▼──────────────┐
  │  Developer Agent │  Creates Jira ticket → implements feature
  └───┬──────────────┘
      │
  ┌───▼──────────────┐◄──── bug fixes ────┐
  │    QA Agent      │                     │
  └───┬──────────────┘──── bugs found ────►│ (up to 3 iterations)
      │ approved
  ┌───▼──────────────┐
  │  Release Agent   │  Applies patch → opens browser → screenshots → release notes
  └──────────────────┘

Usage:
    pip install anthropic
    export ANTHROPIC_API_KEY=sk-...
    python multiagent_framework.py "Add a dark mode toggle to Strategy I"
"""

import os
import sys
import json
import time
import shutil
import subprocess
from datetime import datetime
from pathlib import Path
from typing import Optional

# ── Requires: pip install anthropic ───────────────────────────────────────────
try:
    import anthropic
except ImportError:
    print("Run: pip install anthropic")
    sys.exit(1)

# ─────────────────────────────────────────────────────────────────────────────
# PATHS & CONFIG
# ─────────────────────────────────────────────────────────────────────────────
ROOT          = Path(__file__).parent
APP_FILE      = ROOT / "index.html"             # The investment planner HTML
RELEASES_DIR  = ROOT / "releases"               # Release artifacts
SCREENSHOTS_DIR = ROOT / "screenshots"          # Computer-use screenshots
STATE_FILE    = ROOT / "workflow_state.json"     # Current workflow state

MODEL             = "claude-opus-4-6"           # Swap to claude-sonnet-4-6 for speed
MAX_QA_ITERATIONS = 3                           # Max QA↔Developer loops before forcing release
MAX_TOKENS        = 4096


# ─────────────────────────────────────────────────────────────────────────────
# WORKFLOW STATE
# ─────────────────────────────────────────────────────────────────────────────
class WorkflowState:
    """Single source of truth for the entire pipeline run."""

    def __init__(self, feature_request: str):
        self.workflow_id      = f"WF-{datetime.now().strftime('%Y%m%d-%H%M%S')}"
        self.feature_request  = feature_request
        self.status           = "initiated"
        self.pm_story         : Optional[dict] = None
        self.jira_ticket      : Optional[dict] = None
        self.code_changes     : list[dict]     = []   # one entry per dev iteration
        self.qa_iterations    : list[dict]     = []   # one entry per QA review
        self.release          : Optional[dict] = None
        self.created_at       = datetime.now().isoformat()

    def to_dict(self) -> dict:
        return {k: v for k, v in self.__dict__.items()}

    def save(self):
        STATE_FILE.parent.mkdir(parents=True, exist_ok=True)
        with open(STATE_FILE, "w") as f:
            json.dump(self.to_dict(), f, indent=2)

    def banner(self, msg: str):
        print(f"\n{'─'*60}\n  {msg}\n{'─'*60}")


# ─────────────────────────────────────────────────────────────────────────────
# BASE AGENT
# ─────────────────────────────────────────────────────────────────────────────
class BaseAgent:
    """
    Wraps a single Anthropic API call with a fixed system prompt.
    Each agent is stateless — all context passed explicitly via `context`.
    """

    role_emoji = "🤖"

    def __init__(self, name: str, system_prompt: str):
        self.name          = name
        self.system_prompt = system_prompt
        self.client        = anthropic.Anthropic()  # reads ANTHROPIC_API_KEY

    def _call(self, task: str, context: Optional[dict] = None) -> str:
        user_content = task
        if context:
            ctx_block = f"## Workflow Context\n```json\n{json.dumps(context, indent=2)}\n```\n\n"
            user_content = ctx_block + f"## Your Task\n{task}"

        print(f"\n{self.role_emoji} [{self.name.upper()}] Working...")

        resp = self.client.messages.create(
            model=MODEL,
            max_tokens=MAX_TOKENS,
            system=self.system_prompt,
            messages=[{"role": "user", "content": user_content}],
        )
        return resp.content[0].text

    @staticmethod
    def _parse_json(raw: str) -> dict:
        """Extract the first JSON object from a freeform response."""
        start = raw.find("{")
        end   = raw.rfind("}") + 1
        if start >= 0 and end > start:
            try:
                return json.loads(raw[start:end])
            except json.JSONDecodeError:
                pass
        return {"raw": raw}


# ─────────────────────────────────────────────────────────────────────────────
# AGENT 1 — PRODUCT MANAGER
# ─────────────────────────────────────────────────────────────────────────────
PM_PROMPT = """
You are the Product Manager for the Investment Planner — a single-file HTML app
with 8 investment strategies (ETF/DCA/Coast, Mortgage, Super, Property,
Precious Metals, DCA Analyser, Meme Stocks, VOO vs V500).

Responsibilities:
• Convert raw feature requests into precise, scope-bounded user stories.
• Write every acceptance criterion as a testable pass/fail statement.
• Flag risks, edge cases, and explicit out-of-scope items.

Return ONLY a JSON object (no markdown fence, no prose):
{
  "story_id": "US-<YYMMDD-NN>",
  "title": "Short imperative title",
  "user_story": "As a <user>, I want <feature> so that <value>.",
  "acceptance_criteria": [
    "AC1: Given … When … Then …",
    "AC2: …"
  ],
  "priority": "high|medium|low",
  "story_points": <fibonacci 1-13>,
  "technical_notes": "Relevant implementation hints for the developer.",
  "out_of_scope": ["Anything explicitly excluded."]
}
"""

class PMAgent(BaseAgent):
    role_emoji = "📋"

    def __init__(self):
        super().__init__("Product Manager", PM_PROMPT)

    def create_story(self, feature_request: str) -> dict:
        raw = self._call(
            f"Create a user story for this feature request:\n\n> {feature_request}\n\nReturn JSON only."
        )
        story = self._parse_json(raw)
        print(f"   Story: {story.get('story_id','?')} — {story.get('title','')}")
        return story


# ─────────────────────────────────────────────────────────────────────────────
# AGENT 2 — DEVELOPER
# ─────────────────────────────────────────────────────────────────────────────
DEV_PROMPT = """
You are the Senior Front-End Developer for the Investment Planner.
Stack: single HTML file (~11 000 lines), vanilla JS, Chart.js 4.5, CSS-in-HTML.

Responsibilities:
• Create Jira tickets from user stories (ticket_id format: INVEST-<NNN>).
• Produce exact code patches — old_code/new_code string pairs or insertion points.
• Fix bugs reported by QA with minimal diff.

Jira ticket JSON:
{
  "ticket_id": "INVEST-<NNN>",
  "title": "…",
  "description": "…",
  "story_points": <N>,
  "component": "Strategy I|Strategy II|…|Global",
  "implementation_plan": ["1. …", "2. …"],
  "files_to_change": ["index.html"]
}

Code-change JSON (both for new features and bug fixes):
{
  "ticket_id": "INVEST-<NNN>",
  "iteration": <N>,
  "changes": [
    {
      "description": "What and why",
      "search":  "Exact string to find in index.html",
      "replace": "Exact replacement string"
    }
  ],
  "summary": "One paragraph executive summary of what was done.",
  "testing_notes": "How QA should test this change."
}
"""

class DeveloperAgent(BaseAgent):
    role_emoji = "💻"

    def __init__(self):
        super().__init__("Developer", DEV_PROMPT)

    def create_jira_ticket(self, story: dict) -> dict:
        raw    = self._call(
            "Create a Jira ticket for this user story. Return JSON only.",
            context={"story": story},
        )
        ticket = self._parse_json(raw)
        print(f"   Ticket: {ticket.get('ticket_id','?')} — {ticket.get('title','')}")
        return ticket

    def implement_feature(self, story: dict, ticket: dict, iteration: int = 1) -> dict:
        raw     = self._call(
            f"Implement the feature (dev iteration {iteration}). "
            "Read the story and ticket, then produce the code-change JSON. Return JSON only.",
            context={"story": story, "ticket": ticket, "iteration": iteration},
        )
        changes = self._parse_json(raw)
        changes["iteration"] = iteration
        print(f"   {len(changes.get('changes',[]))} patch(es) produced.")
        return changes

    def fix_bugs(self, story: dict, ticket: dict, bug_report: dict, iteration: int) -> dict:
        raw     = self._call(
            f"Fix the QA bugs (dev iteration {iteration}). Return updated code-change JSON only.",
            context={
                "story": story,
                "ticket": ticket,
                "bug_report": bug_report,
                "iteration": iteration,
            },
        )
        changes = self._parse_json(raw)
        changes["iteration"] = iteration
        print(f"   {len(changes.get('changes',[]))} fix(es) produced.")
        return changes


# ─────────────────────────────────────────────────────────────────────────────
# AGENT 3 — QA ENGINEER
# ─────────────────────────────────────────────────────────────────────────────
QA_PROMPT = """
You are the QA Engineer for the Investment Planner.

Responsibilities:
• Validate every acceptance criterion in the user story against the code diff.
• Think adversarially — test edge cases (zero inputs, max values, mobile layout).
• Report bugs with precise reproduction steps and actual vs expected behaviour.
• Approve only when ALL acceptance criteria pass and no critical/major bugs remain.

Return ONLY JSON:
{
  "review_id": "QA-<story_id>-iter<N>",
  "iteration": <N>,
  "status": "approved|rejected",
  "passed_criteria": ["AC1", …],
  "failed_criteria": ["AC2", …],
  "bugs": [
    {
      "id": "BUG-<N>",
      "severity": "critical|major|minor",
      "title": "…",
      "steps": "1. Open Strategy I  2. Set DCA=0  3. …",
      "expected": "…",
      "actual": "…"
    }
  ],
  "approval_notes": "Reason for approval or overall guidance for developer."
}
"""

class QAAgent(BaseAgent):
    role_emoji = "🧪"

    def __init__(self):
        super().__init__("QA", QA_PROMPT)

    def review(self, story: dict, code_changes: dict, iteration: int) -> dict:
        raw    = self._call(
            f"Review iteration {iteration}. Return JSON only.",
            context={"story": story, "code_changes": code_changes, "iteration": iteration},
        )
        result = self._parse_json(raw)
        result["iteration"] = iteration

        status = result.get("status", "rejected")
        bugs   = result.get("bugs", [])
        print(f"   {'✅ APPROVED' if status == 'approved' else f'❌ REJECTED — {len(bugs)} bug(s)'}")
        for b in bugs:
            print(f"      [{b.get('severity','?').upper():8}] {b.get('title','')}")
        return result


# ─────────────────────────────────────────────────────────────────────────────
# AGENT 4 — RELEASE MANAGER  (uses computer-use for screenshot + validation)
# ─────────────────────────────────────────────────────────────────────────────
RELEASE_PROMPT = """
You are the Release Manager for the Investment Planner.

Responsibilities:
• Apply all approved code patches to index.html using the search/replace pairs.
• Write human-readable release notes.
• Coordinate a visual smoke test — open the file in a browser, take a screenshot,
  verify the changed section is visible.
• Output a release manifest and a changelog entry.

Return ONLY JSON:
{
  "version": "1.0.<build>",
  "release_date": "<ISO date>",
  "ticket_id": "INVEST-<NNN>",
  "story_title": "…",
  "changes_applied": <N>,
  "release_notes": "Markdown paragraph suitable for a changelog.",
  "screenshot_path": "screenshots/<filename>.png",
  "status": "released|failed",
  "failure_reason": null
}
"""

class ReleaseAgent(BaseAgent):
    role_emoji = "🚢"

    def __init__(self):
        super().__init__("Release Manager", RELEASE_PROMPT)
        RELEASES_DIR.mkdir(parents=True, exist_ok=True)
        SCREENSHOTS_DIR.mkdir(parents=True, exist_ok=True)

    # ── Apply search/replace patches to index.html ────────────────────────
    def _apply_patches(self, code_changes: dict) -> int:
        if not APP_FILE.exists():
            print(f"   ⚠  {APP_FILE} not found — skipping patch application.")
            return 0

        html = APP_FILE.read_text(encoding="utf-8")
        applied = 0
        for change in code_changes.get("changes", []):
            search  = change.get("search",  "")
            replace = change.get("replace", "")
            if search and search in html:
                html = html.replace(search, replace, 1)
                applied += 1
                print(f"   ✓ Applied: {change.get('description','')[:60]}")
            else:
                print(f"   ✗ Skipped (not found): {change.get('description','')[:60]}")

        if applied:
            # Backup then write
            backup = APP_FILE.with_suffix(f".bak-{datetime.now().strftime('%H%M%S')}.html")
            shutil.copy2(APP_FILE, backup)
            APP_FILE.write_text(html, encoding="utf-8")
            # Mirror to artifact folder
            artifact = APP_FILE.parent.parent / "Artifacts" / "investment-planner" / "index.html"
            if artifact.parent.exists():
                shutil.copy2(APP_FILE, artifact)
        return applied

    # ── Open browser + take screenshot via macOS ──────────────────────────
    def _take_screenshot(self, version: str) -> str:
        ts          = datetime.now().strftime("%Y%m%d-%H%M%S")
        screenshot  = SCREENSHOTS_DIR / f"release-{version}-{ts}.png"
        try:
            # Open app in default browser
            subprocess.run(["open", str(APP_FILE)], check=True, timeout=5)
            time.sleep(3)   # wait for browser to render
            # macOS screencapture
            subprocess.run(
                ["screencapture", "-x", str(screenshot)],
                check=True, timeout=10
            )
            print(f"   📸 Screenshot saved: {screenshot.name}")
            return str(screenshot)
        except Exception as e:
            print(f"   ⚠  Screenshot skipped ({e})")
            return ""

    def make_release(
        self,
        story: dict,
        ticket: dict,
        code_changes: dict,
        qa_iterations: list,
    ) -> dict:
        build        = datetime.now().strftime("%j%H%M")   # DDD + HHMM for uniqueness
        version      = f"1.0.{build}"
        applied      = self._apply_patches(code_changes)
        screenshot   = self._take_screenshot(version)

        context = {
            "story": story, "ticket": ticket,
            "code_changes": code_changes, "qa_iterations": qa_iterations,
            "version": version, "patches_applied": applied,
            "screenshot_path": screenshot,
        }
        raw     = self._call(
            f"Generate the release manifest for v{version}. Return JSON only.",
            context=context,
        )
        manifest = self._parse_json(raw)
        manifest.setdefault("version",         version)
        manifest.setdefault("screenshot_path", screenshot)
        manifest.setdefault("changes_applied", applied)
        manifest.setdefault("status",          "released")

        # Persist release manifest
        release_file = RELEASES_DIR / f"release-{version}.json"
        release_file.write_text(json.dumps(manifest, indent=2))
        print(f"   📦 Manifest: {release_file.name}")
        return manifest


# ─────────────────────────────────────────────────────────────────────────────
# ORCHESTRATOR  — wires everything together
# ─────────────────────────────────────────────────────────────────────────────
class Orchestrator:
    """
    Workflow state machine:

        INITIATED → PM_STORY → JIRA_TICKET → DEV_ITERATION_1
           → QA_ITERATION_1 → (REJECTED → DEV_ITERATION_2 → …)
           → QA_APPROVED → RELEASING → RELEASED
    """

    def __init__(self):
        self.pm      = PMAgent()
        self.dev     = DeveloperAgent()
        self.qa      = QAAgent()
        self.release = ReleaseAgent()

    def run(self, feature_request: str) -> WorkflowState:
        state = WorkflowState(feature_request)

        state.banner(f"🚀 Workflow {state.workflow_id}")
        print(f"Feature: {feature_request}\n")

        # ── STEP 1 ─ PM: User Story ──────────────────────────────────────
        state.banner("STEP 1 — Product Manager: User Story")
        state.status   = "pm_in_progress"
        state.pm_story = self.pm.create_story(feature_request)
        state.save()

        # ── STEP 2 ─ Dev: Jira Ticket ────────────────────────────────────
        state.banner("STEP 2 — Developer: Jira Ticket")
        state.status      = "dev_planning"
        state.jira_ticket = self.dev.create_jira_ticket(state.pm_story)
        state.save()

        # ── STEP 3 ─ Dev: First Implementation ───────────────────────────
        state.banner("STEP 3 — Developer: Implementation")
        state.status  = "dev_in_progress"
        code_changes  = self.dev.implement_feature(state.pm_story, state.jira_ticket, iteration=1)
        state.code_changes.append(code_changes)
        state.save()

        # ── STEP 4 ─ QA ↔ Dev Feedback Loop ─────────────────────────────
        state.banner(f"STEP 4 — QA ↔ Developer (max {MAX_QA_ITERATIONS} iterations)")
        state.status = "qa_in_progress"

        for i in range(1, MAX_QA_ITERATIONS + 1):
            print(f"\n  ── QA Iteration {i}/{MAX_QA_ITERATIONS} ──")
            qa_result = self.qa.review(state.pm_story, code_changes, iteration=i)
            state.qa_iterations.append(qa_result)
            state.save()

            if qa_result.get("status") == "approved":
                break

            if i < MAX_QA_ITERATIONS:
                print(f"\n  ── Developer Fix (iteration {i+1}) ──")
                code_changes = self.dev.fix_bugs(
                    state.pm_story, state.jira_ticket, qa_result, iteration=i + 1
                )
                state.code_changes.append(code_changes)
                state.save()
            else:
                print(f"  ⚠  Max QA iterations reached — proceeding with latest build.")

        # ── STEP 5 ─ Release ─────────────────────────────────────────────
        state.banner("STEP 5 — Release Manager: Deploy + Screenshot")
        state.status  = "releasing"
        state.release = self.release.make_release(
            state.pm_story, state.jira_ticket, code_changes, state.qa_iterations
        )
        state.status = "released"
        state.save()

        v = state.release.get("version", "?")
        state.banner(f"✅ RELEASED  v{v}  |  workflow: {state.workflow_id}")
        print(f"  Manifest  : {RELEASES_DIR}/release-{v}.json")
        print(f"  Screenshot: {state.release.get('screenshot_path','—')}")
        print(f"  State     : {STATE_FILE}\n")
        return state


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

    orchestrator = Orchestrator()
    final_state  = orchestrator.run(request)

    # Print full workflow state as JSON
    print("\n── Full Workflow State ──")
    print(json.dumps(final_state.to_dict(), indent=2))
