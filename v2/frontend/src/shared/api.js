// ─────────────────────────────────────────────────────────────────────────
// API client — every request goes to the gateway (port 4000), never directly
// to a strategy microservice. The gateway proxies strategy calls and owns
// shared cross-strategy state (tax settings, inflation, compare drawer).
// ─────────────────────────────────────────────────────────────────────────
const GATEWAY_BASE = import.meta.env.VITE_GATEWAY_URL || '/api';

async function request(path, options = {}) {
  const res = await fetch(`${GATEWAY_BASE}${path}`, {
    headers: { 'content-type': 'application/json' },
    ...options,
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(body.error || `Request to ${path} failed (${res.status})`);
    err.status = res.status;
    err.body = body;
    throw err;
  }
  return body;
}

export const api = {
  listStrategies: () => request('/strategies'),

  getSharedState: () => request('/shared-state'),
  updateTaxSettings: (patch) => request('/shared-state/tax-settings', { method: 'PATCH', body: JSON.stringify(patch) }),
  updateInflation: (rate) => request('/shared-state/inflation', { method: 'PATCH', body: JSON.stringify({ rate }) }),
  addCompareScenario: (scenario) => request('/shared-state/compare-drawer/scenarios', { method: 'POST', body: JSON.stringify(scenario) }),
  removeCompareScenario: (id) => request(`/shared-state/compare-drawer/scenarios/${id}`, { method: 'DELETE' }),

  // Strategy I — Invest in ETFs (fully ported)
  simulateEtf: (base, funds, lumpSums) =>
    request('/strategies/etf/simulate', { method: 'POST', body: JSON.stringify({ base, funds, lumpSums }) }),
};
