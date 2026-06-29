import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api } from './api.js';

// ─────────────────────────────────────────────────────────────────────────
// Mirrors the three pieces of state that used to be plain JS globals in
// index.html: window._taxSettings, getBase().inf, and the compare drawer.
// Any strategy page can read/update these without reaching into another
// strategy's component — they all go through the gateway via this context.
// ─────────────────────────────────────────────────────────────────────────
const SharedStateContext = createContext(null);

export function SharedStateProvider({ children }) {
  const [state, setState] = useState({
    taxSettings: { enabled: false, incomeTax: 32.5, cgt: 23.5 },
    inflation: { rate: 0.03 },
    compareDrawer: { open: false, scenarios: [] },
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.getSharedState();
      setState(data);
      setError(null);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const setTaxSettings = useCallback(async (patch) => {
    const updated = await api.updateTaxSettings(patch);
    setState((s) => ({ ...s, taxSettings: updated }));
  }, []);

  const setInflationRate = useCallback(async (rate) => {
    const updated = await api.updateInflation(rate);
    setState((s) => ({ ...s, inflation: updated }));
  }, []);

  const addCompareScenario = useCallback(async (scenario) => {
    const saved = await api.addCompareScenario(scenario);
    setState((s) => ({ ...s, compareDrawer: { ...s.compareDrawer, scenarios: [...s.compareDrawer.scenarios, saved] } }));
  }, []);

  const removeCompareScenario = useCallback(async (id) => {
    await api.removeCompareScenario(id);
    setState((s) => ({ ...s, compareDrawer: { ...s.compareDrawer, scenarios: s.compareDrawer.scenarios.filter((x) => x.id !== id) } }));
  }, []);

  return (
    <SharedStateContext.Provider value={{ ...state, loading, error, refresh, setTaxSettings, setInflationRate, addCompareScenario, removeCompareScenario }}>
      {children}
    </SharedStateContext.Provider>
  );
}

export function useSharedState() {
  const ctx = useContext(SharedStateContext);
  if (!ctx) throw new Error('useSharedState must be used inside <SharedStateProvider>');
  return ctx;
}
