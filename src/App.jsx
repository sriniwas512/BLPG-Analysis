import { useState, useMemo } from 'react';
import { calculateAll, DEFAULT_INPUTS } from './utils/calculations.js';
import { exportToExcel } from './utils/excelExport.js';
import InputPanel from './components/InputPanel.jsx';
import ResultsTable from './components/ResultsTable.jsx';

const fmtUsd = (v) =>
  v == null ? '–' : v.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

export default function App() {
  const [inputs, setInputs] = useState(DEFAULT_INPUTS);
  const results = useMemo(() => calculateAll(inputs), [inputs]);

  function handleChange(key, value) {
    setInputs((prev) => ({ ...prev, [key]: value }));
  }

  function handleExport() {
    exportToExcel(inputs, results);
  }

  function handleReset() {
    setInputs(DEFAULT_INPUTS);
  }

  return (
    <div className="min-h-screen bg-tn-bg text-tn-fg">
      {/* Header */}
      <header className="bg-tn-bg-dark border-b border-tn-border px-6 py-4 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-tn-blue to-tn-purple flex items-center justify-center text-tn-bg-dark font-bold text-lg">
            ⚓
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-tn-fg">
              BLPG <span className="text-tn-cyan">Voyage Analysis</span>
            </h1>
            <p className="text-tn-muted text-xs mt-0.5 font-mono">
              AG – India Routes · Break-even Freight Calculator
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="bg-tn-bg-alt hover:bg-tn-bg-hi border border-tn-border text-tn-fg-dim hover:text-tn-fg
                       text-sm font-medium px-3 py-2 rounded-lg transition-colors"
            title="Reset all inputs to defaults"
          >
            Reset
          </button>
          <button
            onClick={handleExport}
            className="bg-tn-green hover:bg-tn-green/90 text-tn-bg-dark text-sm font-semibold
                       px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-lg shadow-tn-green/20"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export Excel
          </button>
        </div>
      </header>

      <div className="flex flex-col xl:flex-row gap-4 p-4">
        {/* Inputs */}
        <aside className="xl:w-80 flex-shrink-0">
          <InputPanel inputs={inputs} onChange={handleChange} />
        </aside>

        {/* Results */}
        <main className="flex-1 min-w-0 space-y-4">
          {/* TCE summary cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <SummaryCard
              label="Reference TCE"
              value={`$${fmtUsd(results[0]?.tce)}`}
              unit="/day"
              sub={`Ras Tanura → Chiba @ $${inputs.frtRate}/MT`}
              accent="cyan"
            />
            <SummaryCard
              label="TCE + Bunkers"
              value={`$${fmtUsd(results[0]?.tcePlusBunk)}`}
              unit="/day"
              sub="Cash-equivalent daily rate"
              accent="blue"
            />
            <SummaryCard
              label="Monthly TC Rate"
              value={`$${fmtUsd(results[0]?.tcMonthly)}`}
              unit="/month"
              sub="Time-charter equivalent"
              accent="purple"
            />
            <SummaryCard
              label="Total Voyage Days (B)"
              value={results[0]?.totalDays?.toFixed(1)}
              unit="days"
              sub={`Sea ${results[0]?.voyageDays?.toFixed(1)} + port ${results[0]?.portDaysSea?.toFixed(1)}`}
              accent="yellow"
            />
          </div>

          <ResultsTable results={results} />
        </main>
      </div>

      <footer className="text-center text-tn-muted text-xs py-4 border-t border-tn-border mt-4">
        <span className="font-mono">tokyo-night theme</span> · all calculations match{' '}
        <span className="text-tn-cyan">AG_INDIA_Sheet.xlsx</span> · export preserves Excel formulas
      </footer>
    </div>
  );
}

function SummaryCard({ label, value, unit, sub, accent }) {
  const accentClass = {
    cyan:   'text-tn-cyan border-tn-cyan/30',
    blue:   'text-tn-blue border-tn-blue/30',
    purple: 'text-tn-purple border-tn-purple/30',
    yellow: 'text-tn-yellow border-tn-yellow/30',
  }[accent];

  return (
    <div className={`bg-tn-bg-alt rounded-xl border ${accentClass} p-4 shadow-md`}>
      <div className="text-[10px] uppercase tracking-widest text-tn-muted font-semibold">{label}</div>
      <div className={`text-2xl font-bold font-mono mt-1 ${accentClass.split(' ')[0]}`}>
        {value}
        {unit && <span className="text-xs font-normal text-tn-muted ml-1">{unit}</span>}
      </div>
      <div className="text-[11px] text-tn-muted mt-1 truncate">{sub}</div>
    </div>
  );
}
