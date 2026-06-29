import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { SharedStateProvider } from './shared/SharedStateContext.jsx';
import Layout from './shared/Layout.jsx';
import StubStrategyPage from './shared/StubStrategyPage.jsx';
import StrategyIPage from './strategies/StrategyI/StrategyIPage.jsx';

const STUBS = [
  ['mortgage-etf', 'II. Mortgage & ETF Investment'],
  ['super', 'III. Super Salary Sacrifice'],
  ['property', 'IV. High Touch Property'],
  ['precious-metals', 'V. Precious Metals Portfolio'],
  ['dca', 'VI. DCA vs Timing the Market'],
  ['meme', 'VII. Fastest Path to Billionaire'],
  ['voo500', 'VIII. VOO vs V500 on Stake'],
];

export default function App() {
  return (
    <SharedStateProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/strategies/etf" replace />} />
            <Route path="strategies/etf" element={<StrategyIPage />} />
            {STUBS.map(([path, name]) => (
              <Route key={path} path={`strategies/${path}`} element={<StubStrategyPage name={name} />} />
            ))}
          </Route>
        </Routes>
      </BrowserRouter>
    </SharedStateProvider>
  );
}
