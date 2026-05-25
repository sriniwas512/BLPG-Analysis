import { useState, useMemo } from 'react';
import { calculateAll, DEFAULT_INPUTS } from './utils/calculations.js';
import { exportToExcel } from './utils/excelExport.js';
import InputPanel from './components/InputPanel.jsx';
import RouteGroup from './components/RouteGroup.jsx';

const fmtUsd0 = (v) =>
  v == null ? '–' : v.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

export default function App() {
  const [inputs, setInputs] = useState(DEFAULT_INPUTS);
  const r = useMemo(() => calculateAll(inputs), [inputs]);
  const benchmark = r.benchmark;

  function handleChange(key, value) {
    setInputs((prev) => ({ ...prev, [key]: value }));
  }
  function handleReset() {
    setInputs(DEFAULT_INPUTS);
  }
  function handleExport() {
    exportToExcel(inputs, r.all);
  }

  return (
    <div className="min-h-screen bg-tn-bg text-tn-fg">
      {/* Header */}
      <header className="bg-tn-bg-dark border-b border-tn-border px-6 py-4 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-tn-blue to-tn-purple
                          flex items-center justify-center text-tn-bg-dark font-bold text-lg">⚓</div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-tn-fg">
              BLPG <span className="text-tn-cyan">Voyage Analysis</span>
            </h1>
            <p className="text-tn-muted text-xs mt-0.5 font-mono">
              AG – India · Charter rate ↔ freight rate solver
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleReset}
            className="bg-tn-bg-alt hover:bg-tn-bg-hi border border-tn-border text-tn-fg-dim
                       hover:text-tn-fg text-sm font-medium px-3 py-2 rounded-lg transition-colors">
            Reset
          </button>
          <button onClick={handleExport}
            className="bg-tn-green hover:bg-tn-green/90 text-tn-bg-dark text-sm font-semibold
                       px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-lg shadow-tn-green/20">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export Excel
          </button>
        </div>
      </header>

      <div className="flex flex-col xl:flex-row gap-4 p-4">
        {/* Sidebar inputs */}
        <aside className="xl:w-80 flex-shrink-0">
          <InputPanel inputs={inputs} onChange={handleChange} />
        </aside>

        <main className="flex-1 min-w-0 space-y-5">

          {/* ── BENCHMARK / TARGET HERO ───────────────────────────── */}
          <section className="bg-gradient-to-br from-tn-bg-alt to-tn-bg-dark rounded-xl
                              border border-tn-cyan/40 shadow-xl shadow-tn-cyan/5 p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-[10px] uppercase tracking-widest text-tn-cyan font-bold">
                  Benchmark Voyage
                </div>
                <div className="text-lg font-semibold text-tn-fg">
                  Ras Tanura → Chiba
                  <span className="ml-2 text-xs text-tn-muted font-mono">(col B)</span>
                </div>
              </div>
              <div className="text-right text-xs text-tn-muted">
                Reference voyage — benchmark hire<br/>used for route comparisons below
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Input */}
              <div className="bg-tn-bg-dark/60 rounded-lg border border-tn-blue/30 p-4">
                <label htmlFor="frtRateMain" className="text-[10px] uppercase tracking-widest text-tn-blue font-bold block mb-1">
                  ① Target Freight Rate
                </label>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl text-tn-blue font-mono">$</span>
                  <input
                    id="frtRateMain"
                    type="number"
                    step="0.01"
                    min={0}
                    value={inputs.frtRate}
                    onChange={(e) => handleChange('frtRate', parseFloat(e.target.value) || 0)}
                    className="bg-transparent border-b-2 border-tn-blue/60 focus:border-tn-cyan
                               text-4xl font-bold text-tn-cyan font-mono w-32 outline-none text-right"
                  />
                  <span className="text-sm text-tn-muted font-mono">/pmt</span>
                </div>
                <div className="text-[11px] text-tn-muted mt-2 font-mono">
                  Base case: $207/pmt · cargo {fmtUsd0(inputs.intankMT)} MT
                </div>
              </div>

              {/* Output */}
              <div className="bg-tn-bg-dark/60 rounded-lg border border-tn-yellow/30 p-4">
                <div className="text-[10px] uppercase tracking-widest text-tn-yellow font-bold mb-1">
                  ② Resulting Gross Charter Rate
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl text-tn-yellow font-mono">$</span>
                  <span className="text-4xl font-bold text-tn-yellow font-mono">
                    {fmtUsd0(benchmark.ratePerDay)}
                  </span>
                  <span className="text-sm text-tn-muted font-mono">/day</span>
                </div>
                <div className="text-[11px] text-tn-muted mt-2 font-mono">
                  TC monthly equiv: ${fmtUsd0(benchmark.tcMonthly)}/mo
                  · TCE+bunk ${fmtUsd0(benchmark.tcePlusBunk)}/day
                </div>
              </div>
            </div>

            {/* Benchmark detail strip */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-4">
              <DetailItem label="Total Days" value={benchmark.totalDays.toFixed(2)} unit="d" />
              <DetailItem label="Sea Days" value={benchmark.voyageDays.toFixed(2)} unit="d" />
              <DetailItem label="Bunker Cost" value={`$${fmtUsd0(benchmark.bunkerCost)}`} />
              <DetailItem label="Port Charges" value={`$${fmtUsd0(benchmark.portChg)}`} />
              <DetailItem label="Total Revenue" value={`$${fmtUsd0(benchmark.totalCost)}`} />
            </div>
          </section>

          {/* ── MAA ORIGIN ───────────────────────────────────────── */}
          <RouteGroup
            title="MAA Origin"
            description="Gross hire ($/day) per route — enter the freight rate you expect on each route to see what hire it supports. Break-even shown for reference."
            color="purple"
            routes={r.maaRoutes}
            benchmarkRate={benchmark.ratePerDay}
            onFreightChange={(id, val) => handleChange('frtRate_' + id, val)}
          />

          {/* ── RUWAIS ORIGIN ────────────────────────────────────── */}
          <RouteGroup
            title="Ruwais Origin"
            description="Gross hire ($/day) per route — enter the freight rate you expect on each route to see what hire it supports. Break-even shown for reference."
            color="orange"
            routes={r.ruwaisRoutes}
            benchmarkRate={benchmark.ratePerDay}
            onFreightChange={(id, val) => handleChange('frtRate_' + id, val)}
          />

        </main>
      </div>

      <footer className="text-center text-tn-muted text-xs py-4 border-t border-tn-border mt-4 font-mono">
        tokyo-night · formulas mirror AG_INDIA_Sheet.xlsx · export preserves Excel formulas
      </footer>
    </div>
  );
}

function DetailItem({ label, value, unit }) {
  return (
    <div className="bg-tn-bg/50 rounded border border-tn-border px-3 py-2">
      <div className="text-[10px] text-tn-muted uppercase tracking-wider">{label}</div>
      <div className="text-tn-fg text-sm font-mono">
        {value}
        {unit && <span className="text-tn-muted text-xs ml-1">{unit}</span>}
      </div>
    </div>
  );
}
