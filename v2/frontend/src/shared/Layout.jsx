import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useSharedState } from './SharedStateContext.jsx';

const STRATEGIES = [
  { path: '/strategies/etf', label: 'I. Invest in ETFs', live: true },
  { path: '/strategies/mortgage-etf', label: 'II. Mortgage & ETF', live: false },
  { path: '/strategies/super', label: 'III. Super Salary Sacrifice', live: false },
  { path: '/strategies/property', label: 'IV. High Touch Property', live: false },
  { path: '/strategies/precious-metals', label: 'V. Precious Metals', live: false },
  { path: '/strategies/dca', label: 'VI. DCA vs Timing', live: false },
  { path: '/strategies/meme', label: 'VII. Fastest Path to Billionaire', live: false },
  { path: '/strategies/voo500', label: 'VIII. VOO vs V500', live: false },
];

export default function Layout() {
  const { taxSettings, inflation, error } = useSharedState();

  return (
    <div style={{ fontFamily: 'system-ui', display: 'flex', minHeight: '100vh' }}>
      <nav style={{ width: 240, borderRight: '1px solid #e2e8f0', padding: 16, flexShrink: 0 }}>
        <h2 style={{ fontSize: 16, marginBottom: 16 }}>Investment Planner v2</h2>
        {STRATEGIES.map((s) => (
          <NavLink
            key={s.path}
            to={s.path}
            style={({ isActive }) => ({
              display: 'block', padding: '8px 10px', borderRadius: 6, marginBottom: 4,
              textDecoration: 'none', fontSize: 13,
              color: s.live ? '#0f172a' : '#94a3b8',
              background: isActive ? '#eef2ff' : 'transparent',
            })}
          >
            {s.label} {!s.live && '· stub'}
          </NavLink>
        ))}
        <hr style={{ margin: '16px 0', borderColor: '#e2e8f0' }} />
        <div style={{ fontSize: 11, color: '#64748b' }}>
          <div>Tax adj: {taxSettings.enabled ? 'on' : 'off'}</div>
          <div>Inflation: {(inflation.rate * 100).toFixed(1)}%</div>
          {error && <div style={{ color: '#dc2626', marginTop: 8 }}>Gateway error: {error}</div>}
        </div>
      </nav>
      <main style={{ flex: 1, padding: 24 }}>
        <Outlet />
      </main>
    </div>
  );
}
