import { useState, useMemo } from 'react';
import { calculateAll, DEFAULT_INPUTS } from './utils/calculations.js';
import { exportToExcel } from './utils/excelExport.js';
import InputPanel from './components/InputPanel.jsx';
import ResultsTable from './components/ResultsTable.jsx';

export default function App() {
  const [inputs, setInputs] = useState(DEFAULT_INPUTS);

  const results = useMemo(() => calculateAll(inputs), [inputs]);

  function handleChange(key, value) {
    setInputs((prev) => ({ ...prev, [key]: value }));
  }

  function handleExport() {
    exportToExcel(inputs, results);
  }

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Header */}
      <header className="bg-blue-900 text-white px-6 py-4 flex items-center justify-between shadow-lg">
        <div>
          <h1 className="text-xl font-bold tracking-tight">BLPG Voyage Analysis</h1>
          <p className="text-blue-300 text-xs mt-0.5">AG – India Routes · Break-even Freight Calculator</p>
        </div>
        <button
          onClick={handleExport}
          className="bg-green-500 hover:bg-green-400 active:bg-green-600 text-white text-sm font-semibold
                     px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Export Excel
        </button>
      </header>

      <div className="flex flex-col xl:flex-row gap-4 p-4">
        {/* Inputs */}
        <aside className="xl:w-72 flex-shrink-0">
          <InputPanel inputs={inputs} onChange={handleChange} />
        </aside>

        {/* Results */}
        <main className="flex-1 min-w-0">
          {/* TCE summary card */}
          <div className="bg-white rounded-xl shadow p-4 mb-4 flex flex-wrap gap-6">
            <div>
              <div className="text-xs text-slate-500 uppercase tracking-wide">Reference TCE</div>
              <div className="text-2xl font-bold text-blue-800">
                ${results[0]?.tce?.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                <span className="text-sm font-normal text-slate-500 ml-1">/day</span>
              </div>
              <div className="text-xs text-slate-400">Ras Tanura → Chiba @ ${inputs.frtRate}/MT</div>
            </div>
            <div>
              <div className="text-xs text-slate-500 uppercase tracking-wide">TCE + Bunkers</div>
              <div className="text-2xl font-bold text-blue-700">
                ${results[0]?.tcePlusBunk?.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                <span className="text-sm font-normal text-slate-500 ml-1">/day</span>
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-500 uppercase tracking-wide">Monthly TC Rate</div>
              <div className="text-2xl font-bold text-slate-700">
                ${results[0]?.tcMonthly?.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                <span className="text-sm font-normal text-slate-500 ml-1">/month</span>
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-500 uppercase tracking-wide">Total Voyage Days (B)</div>
              <div className="text-2xl font-bold text-slate-700">
                {results[0]?.totalDays?.toFixed(1)}
                <span className="text-sm font-normal text-slate-500 ml-1">days</span>
              </div>
            </div>
          </div>

          <ResultsTable results={results} />
        </main>
      </div>
    </div>
  );
}
