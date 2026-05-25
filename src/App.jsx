import { useState, useMemo, useEffect } from 'react';
import {
  calculateAll, DEFAULT_INPUTS, DEFAULT_ROUTE_CONFIGS,
  DEFAULT_DISTANCE_MATRIX, PORT_CHARGE_KEY,
} from './utils/calculations.js';
import { exportToExcel } from './utils/excelExport.js';
import InputPanel from './components/InputPanel.jsx';
import RouteGroup from './components/RouteGroup.jsx';

const fmtUsd0 = (v) =>
  v == null ? '–' : v.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

// Bump this whenever defaults change in a breaking way — forces cache clear on next load
const STORAGE_VERSION = 'v4';

function loadLS(key, fallback) {
  try { const s = localStorage.getItem(key); return s ? JSON.parse(s) : fallback; }
  catch { return fallback; }
}

function loadWithVersion(key, fallback) {
  if (localStorage.getItem('blpg-version') !== STORAGE_VERSION) return fallback;
  return loadLS(key, fallback);
}

export default function App() {
  const [inputs, setInputs] = useState(DEFAULT_INPUTS);

  const [routeConfigs, setRouteConfigs] = useState(
    () => loadWithVersion('blpg-route-configs', DEFAULT_ROUTE_CONFIGS)
  );
  const [distanceMatrix, setDistanceMatrix] = useState(
    () => loadWithVersion('blpg-distance-matrix', DEFAULT_DISTANCE_MATRIX)
  );

  useEffect(() => {
    localStorage.setItem('blpg-version', STORAGE_VERSION);
    localStorage.setItem('blpg-route-configs', JSON.stringify(routeConfigs));
  }, [routeConfigs]);
  useEffect(() => { localStorage.setItem('blpg-distance-matrix', JSON.stringify(distanceMatrix)); }, [distanceMatrix]);

  const r = useMemo(() => calculateAll(inputs, routeConfigs), [inputs, routeConfigs]);
  const benchmark = r.benchmark;

  function handleChange(key, value) {
    setInputs((prev) => ({ ...prev, [key]: value }));
  }
  function handleReset() {
    setInputs(DEFAULT_INPUTS);
    setRouteConfigs(DEFAULT_ROUTE_CONFIGS);
    setDistanceMatrix(DEFAULT_DISTANCE_MATRIX);
    localStorage.removeItem('blpg-route-configs');
    localStorage.removeItem('blpg-distance-matrix');
  }
  function handleExport() { exportToExcel(inputs, r.all); }

  function handleAddRoute(origin) {
    const id = 'custom_' + Date.now();
    const defaultPort = 'NMG';
    setRouteConfigs((prev) => [...prev, {
      id, origin,
      dest: `${origin} → ${defaultPort}`,
      miles_b: 0, miles_l: 0,
      loadPChg: 32000,
      namedDisPorts: [PORT_CHARGE_KEY[defaultPort]].filter(Boolean),
      fixedDisPChgExtra: 0, disPChgOverride: null,
      awrip: 40000, norPlus6: 0.75, daysLoading: 2, daysDisch: 10, daysBun: 0,
      intank: 45000, seaDaysFactor: 1.05, mdo_rate: 'idleMDO',
      isBuiltin: false, disPortSequence: [defaultPort],
    }]);
    return id;
  }
  function handleUpdateRoute(id, field, value) {
    setRouteConfigs((prev) => prev.map((cfg) => cfg.id === id ? { ...cfg, [field]: value } : cfg));
  }
  function handleDeleteRoute(id) {
    setRouteConfigs((prev) => prev.filter((cfg) => cfg.id !== id));
  }
  function handleResetRoute(id) {
    const def = DEFAULT_ROUTE_CONFIGS.find((c) => c.id === id);
    if (def) setRouteConfigs((prev) => prev.map((cfg) => cfg.id === id ? { ...def } : cfg));
  }
  function handleMatrixChange(from, to, value) {
    setDistanceMatrix((prev) => ({
      ...prev,
      [from]: { ...prev[from], [to]: value },
      [to]:   { ...prev[to],   [from]: value },
    }));
  }

  return (
    <div className="min-h-screen bg-tn-bg text-tn-fg">
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
            Reset All
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
        <aside className="xl:w-80 flex-shrink-0">
          <InputPanel
            inputs={inputs}
            onChange={handleChange}
            distanceMatrix={distanceMatrix}
            onMatrixChange={handleMatrixChange}
          />
        </aside>

        <main className="flex-1 min-w-0 space-y-5">
          {/* ── BENCHMARK HERO ───────────────────────────────────── */}
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
                Baltic $/pmt → TCE $/day<br/>scales every route's bid below
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="bg-tn-bg-dark/60 rounded-lg border border-tn-blue/30 p-4">
                <label htmlFor="frtRateMain" className="text-[10px] uppercase tracking-widest text-tn-blue font-bold block mb-1">
                  ① Target Freight Rate
                </label>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl text-tn-blue font-mono">$</span>
                  <input
                    id="frtRateMain"
                    type="number" step="0.01" min={0}
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

              <div className="bg-tn-bg-dark/60 rounded-lg border border-tn-yellow/30 p-4">
                <div className="text-[10px] uppercase tracking-widest text-tn-yellow font-bold mb-1">
                  ② TCE (locks every other route)
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

            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-4">
              <DetailItem label="Total Days" value={benchmark.totalDays.toFixed(2)} unit="d" />
              <DetailItem label="Sea Days" value={benchmark.voyageDays.toFixed(2)} unit="d" />
              <DetailItem label="Bunker Cost" value={`$${fmtUsd0(benchmark.bunkerCost)}`} />
              <DetailItem label="Port Charges" value={`$${fmtUsd0(benchmark.portChg)}`} />
              <DetailItem label="Total Revenue" value={`$${fmtUsd0(benchmark.totalCost)}`} />
            </div>
          </section>

          {/* ── RUWAIS ORIGIN ────────────────────────────────────── */}
          <RouteGroup
            title="Ruwais Origin"
            description="Total gross earnings (USD per voyage) bid on each route, scaled so TCE equals the benchmark $/day."
            color="orange"
            routes={r.ruwaisRoutes}
            benchmarkRate={benchmark.ratePerDay}
            inputs={inputs}
            distanceMatrix={distanceMatrix}
            onAdd={() => handleAddRoute('Ruwais')}
            onEdit={handleUpdateRoute}
            onDelete={handleDeleteRoute}
            onReset={handleResetRoute}
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
