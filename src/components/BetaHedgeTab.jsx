import { useState, useMemo, useEffect } from 'react';
import { calculateRouteBetas } from '../utils/betaHedge.js';

// ── Formatters ────────────────────────────────────────────────────────────────
const fmt0  = (v) => v == null || isNaN(v) ? '–' : v.toLocaleString('en-US', { maximumFractionDigits: 0 });
const fmt2  = (v) => v == null || isNaN(v) ? '–' : v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmt4  = (v) => v == null || isNaN(v) ? '–' : Number(v).toFixed(4);
const fmtD2 = (v) => v == null || isNaN(v) ? '–' : Number(v).toFixed(2);
const signFmt = (v, dec = 2) => v == null ? '–' : `${v >= 0 ? '+' : ''}${Number(v).toFixed(dec)}`;

// ── Persistence ───────────────────────────────────────────────────────────────
function loadLS(key, fallback) {
  try { const s = localStorage.getItem(key); return s ? JSON.parse(s) : fallback; }
  catch { return fallback; }
}
function saveLS(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
}

// ── Business logic ────────────────────────────────────────────────────────────
function getHedgeDirection(basis, threshold, positionType) {
  if (basis == null || isNaN(basis)) return { text: '—', cls: 'text-tn-muted' };
  if (positionType === 'seller') {
    if (basis >  threshold) return { text: 'Sell BLPG1 FFA',                   cls: 'text-tn-green' };
    if (basis < -threshold) return { text: 'No hedge — avoid / buy back',       cls: 'text-tn-red'   };
    return                         { text: 'No clear hedge',                    cls: 'text-tn-muted'  };
  } else {
    if (basis < -threshold) return { text: 'Buy BLPG1 FFA',                     cls: 'text-tn-green' };
    if (basis >  threshold) return { text: 'No hedge — phys. expensive vs BLPG1', cls: 'text-tn-red' };
    return                         { text: 'No clear hedge',                    cls: 'text-tn-muted'  };
  }
}

function getBasisLabel(basis, threshold) {
  if (basis == null || isNaN(basis)) return null;
  if (basis >  threshold) return { text: 'Physical rich',  cls: 'bg-tn-green/15  text-tn-green  border border-tn-green/30'  };
  if (basis < -threshold) return { text: 'Physical cheap', cls: 'bg-tn-red/15    text-tn-red    border border-tn-red/30'    };
  return                         { text: 'Near parity',    cls: 'bg-tn-yellow/15 text-tn-yellow border border-tn-yellow/30' };
}

// ── Main component ────────────────────────────────────────────────────────────
export default function BetaHedgeTab({ inputs, onChange, routeConfigs }) {
  // grossFreights stores the total voyage gross freight $ per route (not $/pmt)
  const [grossFreights,  setGrossFreights]  = useState(() => loadLS('blpg-hedge-gross-frt', {}));
  const [deselectedIds,  setDeselectedIds]  = useState(() => loadLS('blpg-hedge-deselected',  []));
  const [hedgeThreshold, setHedgeThreshold] = useState(() => loadLS('blpg-hedge-threshold',  2.0));
  const [positionType,   setPositionType]   = useState(() => loadLS('blpg-hedge-position', 'seller'));
  const [hedgeUnit,      setHedgeUnit]      = useState(() => loadLS('blpg-hedge-unit', 'mt'));
  const [expandedId,     setExpandedId]     = useState(null);

  useEffect(() => { saveLS('blpg-hedge-gross-frt', grossFreights); }, [grossFreights]);
  useEffect(() => { saveLS('blpg-hedge-deselected',  deselectedIds);  }, [deselectedIds]);
  useEffect(() => { saveLS('blpg-hedge-threshold',   hedgeThreshold); }, [hedgeThreshold]);
  useEffect(() => { saveLS('blpg-hedge-position',    positionType);   }, [positionType]);
  useEffect(() => { saveLS('blpg-hedge-unit',        hedgeUnit);      }, [hedgeUnit]);

  const betaData = useMemo(
    () => calculateRouteBetas(inputs, routeConfigs),
    [inputs, routeConfigs]
  );

  if (!betaData) {
    return (
      <div className="bg-tn-bg-alt rounded-xl border border-tn-border p-10 text-center text-tn-muted text-sm font-mono">
        Cannot compute beta — ensure benchmark freight rate, cargo MT, and commission are non-zero and commission &lt; 100%.
      </div>
    );
  }

  const { routes, benchmark, shockedBenchmark, netFactor } = betaData;

  // Enrich each route with per-route hedge fields
  // grossFrt is stored as total voyage $ — actualFrt ($/pmt) is derived
  const enriched = routes.map((r) => {
    if (r.error) return r;
    const raw        = grossFreights[r.id];
    const hasActual  = raw != null && raw !== '' && !isNaN(parseFloat(raw));
    const grossFrt   = hasActual ? parseFloat(raw) : null;
    const actualFrt  = grossFrt != null && r.intank > 0 ? grossFrt / r.intank : null;
    const basis      = actualFrt != null ? actualFrt - r.frtRatePerMT : null;
    const basisValue = basis != null ? basis * r.intank : null;
    return {
      ...r,
      grossFrt, actualFrt, hasActual, basis, basisValue,
      hedgeDir:   getHedgeDirection(basis, hedgeThreshold, positionType),
      basisLabel: getBasisLabel(basis, hedgeThreshold),
      isSelected: !deselectedIds.includes(r.id),
    };
  });

  const valid = enriched.filter((r) => !r.error);

  // Summary stats
  const highestBeta  = valid.reduce((a, b) => b.beta > (a?.beta ?? -Infinity) ? b : a, null);
  const lowestBeta   = valid.reduce((a, b) => b.beta < (a?.beta ??  Infinity) ? b : a, null);
  const withBasis    = enriched.filter((r) => r.basis != null);
  const largestPos   = withBasis.filter((r) => r.basis > 0).reduce((a, b) => b.basis > (a?.basis ?? -Infinity) ? b : a, null);
  const largestNeg   = withBasis.filter((r) => r.basis < 0).reduce((a, b) => b.basis < (a?.basis ??  Infinity) ? b : a, null);
  const largestHedge = valid.reduce((a, b) => Math.abs(b.hedgeMT) > Math.abs(a?.hedgeMT ?? 0) ? b : a, null);
  const totalHedge   = valid.filter((r) => r.isSelected).reduce((s, r) => s + (r.hedgeMT ?? 0), 0);

  function toggleSelect(id) {
    setDeselectedIds((p) => p.includes(id) ? p.filter((x) => x !== id) : [...p, id]);
  }
  function toggleAll() {
    setDeselectedIds(deselectedIds.length === 0 ? routes.map((r) => r.id) : []);
  }

  return (
    <div className="space-y-4">

      {/* ── Global Controls ─────────────────────────────────────────── */}
      <section className="bg-tn-bg-alt rounded-xl border border-tn-border p-4 shadow">
        <div className="text-[10px] uppercase tracking-widest text-tn-muted font-bold font-mono mb-3">
          Hedge Controls
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-3 items-end">
          <CtrlField label="Benchmark Freight" unit="$/pmt">
            <input
              type="number" step="0.01" min={0}
              value={inputs.frtRate}
              onChange={(e) => onChange('frtRate', parseFloat(e.target.value) || 0)}
              className="input-blue w-24 text-right"
            />
          </CtrlField>
          <CtrlField label="Commission" unit="%">
            <input
              type="number" step="0.001" min={0} max={99}
              value={inputs.commission}
              onChange={(e) => onChange('commission', parseFloat(e.target.value) || 0)}
              className="input-blue w-20 text-right"
            />
          </CtrlField>
          <CtrlField label="Hedge Threshold" unit="$/pmt">
            <input
              type="number" step="0.25" min={0}
              value={hedgeThreshold}
              onChange={(e) => setHedgeThreshold(parseFloat(e.target.value) || 0)}
              className="input-blue w-20 text-right"
            />
          </CtrlField>
          <CtrlField label="Position Type">
            <select
              value={positionType}
              onChange={(e) => setPositionType(e.target.value)}
              className="bg-tn-bg-dark border border-tn-blue/40 rounded px-2 py-1 text-sm text-tn-cyan font-mono
                         focus:outline-none focus:border-tn-cyan focus:ring-1 focus:ring-tn-cyan/30"
            >
              <option value="seller">Freight seller / Owner / Physical long</option>
              <option value="buyer">Freight buyer / Charterer / Physical short</option>
            </select>
          </CtrlField>
          <CtrlField label="Hedge Unit">
            <select
              value={hedgeUnit}
              onChange={(e) => setHedgeUnit(e.target.value)}
              className="bg-tn-bg-dark border border-tn-blue/40 rounded px-2 py-1 text-sm text-tn-cyan font-mono
                         focus:outline-none focus:border-tn-cyan focus:ring-1 focus:ring-tn-cyan/30"
            >
              <option value="mt">Metric tons (MT)</option>
              <option value="lot">BLPG1-FFA lots (44,000 MT/lot)</option>
            </select>
          </CtrlField>
        </div>
        <div className="mt-3 pt-3 border-t border-tn-border/50 grid grid-cols-1 md:grid-cols-2 gap-2 text-[10px] font-mono text-tn-muted leading-relaxed">
          <div>
            <span className="text-tn-purple font-bold">BLPG1-FFA contract: </span>
            $/mt basis · 44,000 MT/lot (5% option → 46,200 MT) · monthly settlement
            (CurMon–+5Mon, CurQ–+5Q, Cal+1/+2) · 1.25% commission total
          </div>
          <div>
            <span className="text-tn-yellow font-bold">Commission note: </span>
            Physical India routes use {inputs.commission ?? 3.975}% (address + brokerage).
            Baltic BLPG1-FFA clears at 1.25% — do not mix the two when sizing hedges.
          </div>
        </div>
        <p className="text-[10px] text-tn-muted font-mono mt-2 leading-relaxed">
          This is a rough model hedge based on parity engine beta, not a perfect arbitrage.
          Beta hedges only the BLPG1 benchmark component. Basis risk, bunker basis, and port risk remain.
        </p>
      </section>

      {/* ── Summary Cards ───────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        <SCard label="Highest Beta" color="cyan">
          {highestBeta ? (
            <>
              <div className="text-lg font-bold font-mono text-tn-cyan">{fmt4(highestBeta.beta)}</div>
              <div className="text-[10px] text-tn-muted truncate">{highestBeta.dest}</div>
            </>
          ) : <span className="text-tn-muted text-xs">–</span>}
        </SCard>
        <SCard label="Lowest Beta" color="blue">
          {lowestBeta ? (
            <>
              <div className="text-lg font-bold font-mono text-tn-blue">{fmt4(lowestBeta.beta)}</div>
              <div className="text-[10px] text-tn-muted truncate">{lowestBeta.dest}</div>
            </>
          ) : <span className="text-tn-muted text-xs">–</span>}
        </SCard>
        <SCard label="Largest Rich Basis" color="green">
          {largestPos ? (
            <>
              <div className="text-lg font-bold font-mono text-tn-green">{signFmt(largestPos.basis)}</div>
              <div className="text-[10px] text-tn-muted truncate">{largestPos.dest}</div>
            </>
          ) : <span className="text-[10px] text-tn-muted">Enter actual freights</span>}
        </SCard>
        <SCard label="Largest Cheap Basis" color="red">
          {largestNeg ? (
            <>
              <div className="text-lg font-bold font-mono text-tn-red">{signFmt(largestNeg.basis)}</div>
              <div className="text-[10px] text-tn-muted truncate">{largestNeg.dest}</div>
            </>
          ) : <span className="text-[10px] text-tn-muted">Enter actual freights</span>}
        </SCard>
        <SCard label="Largest Hedge" color="yellow">
          {largestHedge ? (
            <>
              <div className="text-lg font-bold font-mono text-tn-yellow">
                {hedgeUnit === 'lot'
                  ? `${Math.round(largestHedge.hedgeMT / 44000)} lots`
                  : `${fmt0(largestHedge.hedgeMT)} MT`}
              </div>
              <div className="text-[10px] text-tn-muted truncate">{largestHedge.dest}</div>
            </>
          ) : <span className="text-tn-muted text-xs">–</span>}
        </SCard>
        <SCard label={`Total Hedge (${valid.filter((r) => r.isSelected).length}/${routes.length} sel.)`} color="orange">
          <div className="text-lg font-bold font-mono text-tn-orange">
            {hedgeUnit === 'lot'
              ? `${Math.round(totalHedge / 44000)} lots`
              : `${fmt0(totalHedge)} MT`}
          </div>
          <div className="text-[10px] text-tn-muted">BLPG1 FFA equiv.</div>
        </SCard>
      </div>

      {/* ── Main Table ──────────────────────────────────────────────── */}
      <section className="bg-tn-bg-alt rounded-xl border border-tn-purple/40 overflow-hidden shadow-lg">
        <header className="px-4 py-3 border-b border-tn-border flex items-center justify-between">
          <div>
            <h2 className="font-bold text-tn-purple text-base uppercase tracking-wide">Route Beta & Hedge Detail</h2>
            <p className="text-xs text-tn-muted mt-0.5">
              Beta = Δparity $/pmt per $1 BLPG shock · enter actual gross freight $ per voyage to compute basis
            </p>
          </div>
        </header>

        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-tn-bg-dark">
                <th className="px-3 py-2 border-b border-tn-border w-8 text-center">
                  <input type="checkbox"
                    checked={deselectedIds.length === 0}
                    onChange={toggleAll}
                    className="accent-tn-purple"
                  />
                </th>
                <Th left>Route</Th>
                <Th sub="$/pmt">Parity Frt</Th>
                <Th sub="$ total · editable">Actual Gross Freight</Th>
                <Th sub="$/pmt · derived">Actual $/pmt</Th>
                <Th sub="$/pmt">Basis</Th>
                <Th sub="$">Basis Value</Th>
                <Th sub="d">Days</Th>
                <Th sub="MT">Cargo</Th>
                <Th sub="rough">Beta</Th>
                <Th>Hedge Direction</Th>
                <Th sub="MT">Hedge Qty</Th>
                <Th sub="basis exposure">Residual</Th>
                <th className="px-2 border-b border-tn-border w-16" />
              </tr>
            </thead>
            <tbody>
              {enriched.map((row) => (
                <RouteHedgeRow
                  key={row.id}
                  row={row}
                  onToggleSelect={() => toggleSelect(row.id)}
                  grossFrtRaw={grossFreights[row.id] ?? ''}
                  onGrossFrtChange={(v) => setGrossFreights((p) => ({ ...p, [row.id]: v }))}
                  isExpanded={expandedId === row.id}
                  onToggleExpand={() => setExpandedId(expandedId === row.id ? null : row.id)}
                  inputs={inputs}
                  benchmark={benchmark}
                  shockedBenchmark={shockedBenchmark}
                  hedgeUnit={hedgeUnit}
                />
              ))}

              {/* Totals row */}
              <tr className="bg-tn-bg-dark/60 border-t-2 border-tn-purple/30">
                <td colSpan={11} className="px-3 py-2 text-right text-xs font-mono text-tn-muted">
                  Total hedge — selected routes ({valid.filter((r) => r.isSelected).length} routes)
                </td>
                <td className="px-3 py-2 text-right font-mono font-bold text-tn-cyan">
                  {hedgeUnit === 'lot'
                    ? `~${Math.round(totalHedge / 44000)} lots`
                    : `${fmt0(totalHedge)} MT`}
                </td>
                <td colSpan={2} />
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <CommercialWarning />
    </div>
  );
}

// ── Route row with collapsible calc panel ─────────────────────────────────────

function RouteHedgeRow({
  row, onToggleSelect, grossFrtRaw, onGrossFrtChange,
  isExpanded, onToggleExpand, inputs, benchmark, shockedBenchmark, hedgeUnit,
}) {
  if (row.error) {
    return (
      <tr className="border-b border-tn-border/40 bg-tn-bg-alt/50">
        <td className="px-3 py-2" />
        <td className="px-3 py-2 text-xs text-tn-muted font-mono" colSpan={13}>
          {row.origin} → {row.dest} — {row.error === 'zero_cargo' ? 'cargo MT is 0, skipped' : 'calculation error'}
        </td>
      </tr>
    );
  }

  const basisColor = row.basis == null ? 'text-tn-muted'
    : row.basis > 0 ? 'text-tn-green' : row.basis < 0 ? 'text-tn-red' : 'text-tn-yellow';

  const betaWarn    = row.warnings?.includes('beta_out_of_range');
  const betaMismatch = row.warnings?.includes('beta_mismatch');

  const COL_COUNT = 14;

  return (
    <>
      <tr className={`border-b border-tn-border/40 hover:bg-tn-bg-hi transition-colors
                      ${!row.isSelected ? 'opacity-50' : ''}`}>
        {/* Checkbox */}
        <td className="px-3 py-2 text-center">
          <input type="checkbox" checked={row.isSelected} onChange={onToggleSelect}
            className="accent-tn-purple" />
        </td>

        {/* Route label */}
        <td className="px-3 py-2">
          <div className="text-xs font-semibold text-tn-fg">{row.dest}</div>
          <div className="text-[10px] font-mono text-tn-muted mt-0.5">{row.origin}</div>
        </td>

        {/* Parity freight */}
        <Td>
          <span className="font-mono text-tn-fg">${fmt2(row.frtRatePerMT)}</span>
          <div className="text-[9px] text-tn-muted mt-0.5">
            ${fmt0(row.totalFreight)} gross
          </div>
        </Td>

        {/* Actual gross freight — editable total $ */}
        <td className="px-3 py-2 text-right">
          <input
            type="number" step="1000" min={0}
            value={grossFrtRaw}
            placeholder="enter $"
            onChange={(e) => onGrossFrtChange(e.target.value)}
            className="w-28 bg-tn-bg-dark border border-tn-blue/40 rounded px-2 py-0.5 text-right
                       text-sm font-mono text-tn-cyan focus:outline-none focus:border-tn-cyan
                       focus:ring-1 focus:ring-tn-cyan/30 transition-colors placeholder-tn-border"
          />
        </td>

        {/* Derived actual $/pmt */}
        <td className="px-3 py-2 text-right">
          {row.actualFrt == null ? (
            <span className="text-[10px] text-tn-muted italic">–</span>
          ) : (
            <span className="font-mono text-sm text-tn-cyan">${fmt2(row.actualFrt)}</span>
          )}
        </td>

        {/* Basis */}
        <td className="px-3 py-2 text-right">
          {row.basis == null ? (
            <span className="text-[10px] text-tn-muted font-mono italic">enter actual</span>
          ) : (
            <div className="flex flex-col items-end gap-0.5">
              <span className={`font-mono text-sm font-semibold ${basisColor}`}>
                {signFmt(row.basis)}
              </span>
              {row.basisLabel && (
                <span className={`text-[9px] font-mono px-1 py-0.5 rounded ${row.basisLabel.cls}`}>
                  {row.basisLabel.text}
                </span>
              )}
            </div>
          )}
        </td>

        {/* Basis value */}
        <Td>
          {row.basisValue == null ? '–' : (
            <span className={row.basisValue >= 0 ? 'text-tn-green' : 'text-tn-red'}>
              {row.basisValue >= 0 ? '+' : ''}${fmt0(row.basisValue)}
            </span>
          )}
        </Td>

        {/* Total days */}
        <Td>{fmtD2(row.totalDays)}</Td>

        {/* Cargo MT */}
        <Td>{fmt0(row.intank)}</Td>

        {/* Beta */}
        <td className="px-3 py-2 text-right">
          <span className={`font-mono text-sm ${betaWarn ? 'text-tn-red' : 'text-tn-fg'}`}>
            {fmt4(row.beta)}
          </span>
          {betaWarn && (
            <div className="text-[9px] text-tn-red font-mono">⚠ check</div>
          )}
          {betaMismatch && !betaWarn && (
            <div className="text-[9px] text-tn-yellow font-mono">Δ warn</div>
          )}
        </td>

        {/* Hedge direction */}
        <td className="px-3 py-2 text-right">
          <span className={`text-xs font-mono ${row.hedgeDir?.cls ?? 'text-tn-muted'}`}>
            {row.hedgeDir?.text ?? '—'}
          </span>
        </td>

        {/* Hedge quantity */}
        <td className="px-3 py-2 text-right">
          <div className="font-mono text-sm text-tn-yellow font-semibold">
            {hedgeUnit === 'lot'
              ? `~${Math.round(row.hedgeMT / 44000)} lots`
              : `${fmt0(row.hedgeMT)} MT`}
          </div>
          <div className="text-[9px] font-mono text-tn-muted">
            ±500: {fmt0(row.hedgeRounded500)} · ±1k: {fmt0(row.hedgeRounded1000)}
          </div>
        </td>

        {/* Residual — India basis exposure */}
        <td className="px-3 py-2 text-right"
          title={`Residual = cargo − hedge = ${fmt0(row.intank)} − ${fmt0(row.hedgeMT)} MT.\nThis is NOT unhedged cargo. It is the portion of freight movement not explained by the BLPG benchmark under the beta model — i.e. India route basis risk that cannot be hedged with BLPG1 FFA.`}>
          <div className="font-mono text-xs text-tn-fg-dim">{fmt0(row.residualMT)} MT</div>
          <div className="text-[9px] text-tn-muted">India basis</div>
        </td>

        {/* Expand button */}
        <td className="px-2 py-2 text-center">
          <button
            onClick={onToggleExpand}
            title={isExpanded ? 'Close details' : 'View calculation'}
            className={`text-[11px] px-1.5 py-0.5 rounded border transition-colors font-mono
                        ${isExpanded
                          ? 'bg-tn-purple/20 hover:bg-tn-purple/30 border-tn-purple/40 text-tn-purple'
                          : 'text-tn-muted border-tn-border hover:text-tn-fg hover:border-tn-fg'}`}
          >
            {isExpanded ? '✕' : 'calc'}
          </button>
        </td>
      </tr>

      {/* Expandable calc panel */}
      {isExpanded && (
        <tr className="bg-tn-bg border-b border-tn-border">
          <td colSpan={COL_COUNT} className="p-4">
            <CalcPanel row={row} inputs={inputs} benchmark={benchmark} shockedBenchmark={shockedBenchmark} />
          </td>
        </tr>
      )}
    </>
  );
}

// ── Calculation detail panel ──────────────────────────────────────────────────

function CalcPanel({ row, inputs, benchmark, shockedBenchmark }) {
  const commPct    = (inputs.commission ?? 3.975);
  const netFactor  = 1 - commPct / 100;
  const deltaTce   = shockedBenchmark.ratePerDay - benchmark.ratePerDay;
  const bmCargo    = benchmark.totalFreight / inputs.frtRate;

  const analyticalExpanded = `(${fmt0(bmCargo)} ÷ ${fmtD2(benchmark.totalDays)}) × (${fmtD2(row.totalDays)} ÷ (${netFactor.toFixed(5)} × ${fmt0(row.intank)}))`;

  const diffOK    = row.betaDiff < 0.001;
  const diffWarn  = row.betaDiff >= 0.01;

  const plainEnglish = `BLPG benchmark freight was $${inputs.frtRate}/pmt on ${fmt0(bmCargo)} MT cargo (Route B). ` +
    `A +$1 shock (to $${inputs.frtRate + 1}/pmt) raised benchmark TCE from $${fmt0(benchmark.ratePerDay)}/day to ` +
    `$${fmt0(shockedBenchmark.ratePerDay)}/day (+$${fmt0(deltaTce)}/day). ` +
    `This route's model parity freight moved from $${fmt2(row.frtRatePerMT)}/pmt to $${fmt2(row.shockedFrtRatePerMT)}/pmt ` +
    `— a change of $${row.finiteBeta.toFixed(4)}/pmt. That is the rough beta. ` +
    `For ${fmt0(row.intank)} MT cargo, the model hedge is ${fmt0(row.intank)} × ${row.beta.toFixed(4)} = ` +
    `${fmt0(row.hedgeMT)} MT of BLPG1-FFA equivalent (${fmt0(row.hedgeRounded500)} MT rounded to nearest 500).`;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 text-[11px] font-mono">

      {/* Left column */}
      <div className="space-y-4">
        {/* Benchmark */}
        <CalcSection title="Benchmark Route B" color="cyan">
          <CalcRow label="Freight rate (base)"         value={`$${inputs.frtRate}/pmt`} />
          <CalcRow label="Freight rate (shocked)"      value={`$${inputs.frtRate + 1}/pmt`} />
          <CalcRow label="Benchmark cargo (intankMT)"  value={`${fmt0(bmCargo)} MT`} />
          <CalcRow label="Benchmark total days"        value={`${fmtD2(benchmark.totalDays)} d`} />
          <CalcRow label="Benchmark TCE (base)"        value={`$${fmt0(benchmark.ratePerDay)}/day`} highlight />
          <CalcRow label="Benchmark TCE (shocked)"     value={`$${fmt0(shockedBenchmark.ratePerDay)}/day`} />
          <CalcRow label="Δ Benchmark TCE"             value={`${signFmt(deltaTce, 2)}/day`} />
        </CalcSection>

        {/* Route */}
        <CalcSection title={`This Route — ${row.dest}`} color="orange">
          <CalcRow label="Route total days"    value={`${row.totalDays.toFixed(4)} d`} />
          <CalcRow label="Route cargo"         value={`${fmt0(row.intank)} MT`} />
          <CalcRow label="Commission"          value={`${commPct}%`} />
          <CalcRow label="Net commission factor" value={netFactor.toFixed(5)} />
          <CalcRow label="Parity freight (base)"    value={`$${fmt2(row.frtRatePerMT)}/pmt`} highlight />
          <CalcRow label="Parity freight (shocked)" value={`$${fmt2(row.shockedFrtRatePerMT)}/pmt`} />
        </CalcSection>
      </div>

      {/* Right column */}
      <div className="space-y-4">
        {/* Beta derivation */}
        <CalcSection title="Beta Derivation" color="purple">
          <CalcRow label="Finite diff beta"    value={row.finiteBeta.toFixed(6)}  highlight />
          <div className="mt-1 text-tn-muted leading-relaxed text-[10px] space-y-0.5">
            <div className="text-tn-purple/80 font-semibold">Analytical formula:</div>
            <div>(bmCargoMT ÷ bmDays) × (routeDays ÷ (netFactor × routeCargo))</div>
            <div className="text-tn-fg-dim">{analyticalExpanded}</div>
          </div>
          <CalcRow label="Analytical beta"     value={row.analyticalBeta.toFixed(6)} />
          <CalcRow
            label="Difference (|Δ|)"
            value={row.betaDiff.toFixed(6)}
            badge={diffWarn ? '⚠ mismatch — using finite diff' : diffOK ? '✓ OK' : '~OK'}
            badgeCls={diffWarn ? 'text-tn-red' : 'text-tn-green'}
          />
        </CalcSection>

        {/* Hedge */}
        <CalcSection title="Hedge Calculation" color="yellow">
          <CalcRow label="Route cargo (MT)"        value={fmt0(row.intank)} />
          <CalcRow label="× Finite diff beta"       value={row.beta.toFixed(4)} />
          <CalcRow label="= Hedge quantity"         value={`${fmt0(row.hedgeMT)} MT`} highlight />
          <CalcRow label="Rounded to ±500 MT"       value={`${fmt0(row.hedgeRounded500)} MT`} />
          <CalcRow label="Rounded to ±1,000 MT"     value={`${fmt0(row.hedgeRounded1000)} MT`} />
          <div className="border-t border-tn-border/50 pt-1 mt-1 space-y-0.5">
            <CalcRow label="Residual (cargo − hedge)" value={`${fmt0(row.residualMT)} MT`} />
            <div className="text-[10px] text-tn-muted leading-relaxed pt-0.5">
              The residual is <span className="text-tn-fg">not</span> unhedged cargo.
              It is the portion of this route's freight movement that does <span className="text-tn-fg">not</span> correlate
              with BLPG benchmark moves under this beta model.
              Beta = {row.beta.toFixed(4)} means only {(row.beta * 100).toFixed(1)}% of
              the route's freight sensitivity is explained by BLPG.
              The remaining {((1 - row.beta) * 100).toFixed(1)}% is India route basis risk —
              driven by local supply/demand, port congestion, charterer preferences — and
              cannot be hedged with BLPG1 FFA.
            </div>
          </div>
        </CalcSection>

        {/* Basis (if available) */}
        {row.hasActual && (
          <CalcSection title="Basis Analysis" color="green">
            <CalcRow label="Actual gross freight"     value={`$${fmt0(row.grossFrt)}`} />
            <CalcRow label="÷ Cargo (MT)"             value={fmt0(row.intank)} />
            <CalcRow label="= Actual $/pmt"           value={`$${fmt2(row.actualFrt)}/pmt`} highlight />
            <CalcRow label="Model parity $/pmt"       value={`$${fmt2(row.frtRatePerMT)}/pmt`} />
            <CalcRow label="Parity gross freight"     value={`$${fmt0(row.totalFreight)}`} />
            <CalcRow label="Basis (actual − parity)"  value={signFmt(row.basis) + '/pmt'} highlight />
            <CalcRow label="Basis value (× cargo)"    value={`${row.basisValue >= 0 ? '+' : ''}$${fmt0(row.basisValue)}`} />
            <CalcRow label="Signal"                   value={row.hedgeDir?.text ?? '—'} />
            {row.basisLabel && (
              <div className={`mt-1 px-2 py-0.5 rounded inline-block ${row.basisLabel.cls}`}>
                {row.basisLabel.text}
              </div>
            )}
          </CalcSection>
        )}
      </div>

      {/* Plain English — full width */}
      <div className="lg:col-span-2">
        <CalcSection title="Plain English" color="blue">
          <p className="text-tn-fg-dim leading-relaxed text-[11px]">{plainEnglish}</p>
          {row.warnings?.includes('beta_out_of_range') && (
            <div className="mt-2 text-tn-red">⚠ Beta is outside 0–2 range. Check vessel performance inputs and route distances.</div>
          )}
          {row.warnings?.includes('beta_mismatch') && (
            <div className="mt-1 text-tn-yellow">⚠ Formula mismatch (|Δ| &gt; 0.01). Finite difference beta is used as the official value.</div>
          )}
        </CalcSection>
      </div>
    </div>
  );
}

// ── Commercial warning ────────────────────────────────────────────────────────

function CommercialWarning() {
  return (
    <div className="bg-tn-bg-dark rounded-xl border border-tn-red/20 p-4 text-[10px] font-mono text-tn-muted leading-relaxed">
      <span className="text-tn-red font-bold">⚠ IMPORTANT — MODEL LIMITATIONS: </span>
      This hedge ratio is a rough model beta based on the app's parity engine.
      It hedges the BLPG1 benchmark component only.
      It does <strong className="text-tn-fg">not</strong> remove:
      India route basis risk · port delay risk · bunker basis risk ·
      vessel performance risk · liquidity risk · settlement mismatch.
      This is a decision-support tool only. Always consult a qualified risk advisor before executing hedges.
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function GlobalControls() { return null; } // inlined above in main component

function SCard({ label, color, children }) {
  const borderMap = {
    cyan: 'border-tn-cyan/30', blue: 'border-tn-blue/30', green: 'border-tn-green/30',
    red: 'border-tn-red/30', yellow: 'border-tn-yellow/30', orange: 'border-tn-orange/30',
  };
  const labelMap = {
    cyan: 'text-tn-cyan', blue: 'text-tn-blue', green: 'text-tn-green',
    red: 'text-tn-red', yellow: 'text-tn-yellow', orange: 'text-tn-orange',
  };
  return (
    <div className={`bg-tn-bg-alt rounded-lg border ${borderMap[color] ?? 'border-tn-border'} p-3 shadow`}>
      <div className={`text-[9px] uppercase tracking-widest font-bold font-mono mb-1 ${labelMap[color] ?? 'text-tn-muted'}`}>
        {label}
      </div>
      {children}
    </div>
  );
}

function CalcSection({ title, color, children }) {
  const cMap = {
    cyan: 'text-tn-cyan border-tn-cyan/30', blue: 'text-tn-blue border-tn-blue/30',
    orange: 'text-tn-orange border-tn-orange/30', purple: 'text-tn-purple border-tn-purple/30',
    yellow: 'text-tn-yellow border-tn-yellow/30', green: 'text-tn-green border-tn-green/30',
  };
  return (
    <div className={`rounded-lg border ${cMap[color]?.split(' ')[1] ?? 'border-tn-border'} overflow-hidden`}>
      <div className={`px-3 py-1.5 bg-tn-bg-dark text-[9px] font-bold uppercase tracking-widest
                       ${cMap[color]?.split(' ')[0] ?? 'text-tn-muted'}`}>
        {title}
      </div>
      <div className="px-3 py-2 space-y-0.5 bg-tn-bg/50">{children}</div>
    </div>
  );
}

function CalcRow({ label, value, highlight, badge, badgeCls }) {
  return (
    <div className="flex justify-between items-center gap-4">
      <span className="text-tn-muted">{label}</span>
      <div className="flex items-center gap-2">
        <span className={highlight ? 'text-tn-fg font-bold' : 'text-tn-fg-dim'}>{value}</span>
        {badge && <span className={`text-[9px] ${badgeCls ?? 'text-tn-muted'}`}>{badge}</span>}
      </div>
    </div>
  );
}

function CtrlField({ label, unit, children }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[10px] font-mono text-tn-muted uppercase tracking-wider">
        {label}{unit && <span className="ml-1 text-tn-border">({unit})</span>}
      </label>
      {children}
    </div>
  );
}

function Th({ children, sub, left }) {
  return (
    <th className={`px-3 py-2 text-[11px] font-semibold uppercase tracking-wider border-b border-tn-border
                    whitespace-nowrap text-tn-muted ${left ? 'text-left' : 'text-right'}`}>
      {children}
      {sub && <div className="font-normal normal-case tracking-normal text-[10px] mt-0.5">{sub}</div>}
    </th>
  );
}

function Td({ children }) {
  return (
    <td className="px-3 py-2 text-right font-mono text-xs whitespace-nowrap text-tn-fg-dim">
      {children}
    </td>
  );
}
