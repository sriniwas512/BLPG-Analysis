import { useState } from 'react';
import { DISTANCE_PORTS, PORT_SHORT, PORT_CHARGE_KEY, CHARGE_KEY_TO_PORT } from '../utils/calculations.js';

const fmt0 = (v) =>
  v == null ? '–' : v.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
const fmt2 = (v) =>
  v == null ? '–' : v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtD = (v) => (v == null ? '–' : v.toFixed(2));

const COLOR_MAP = {
  purple: { text: 'text-tn-purple', border: 'border-tn-purple/40', bg: 'bg-tn-purple/10', ring: 'shadow-tn-purple/5', btnBg: 'bg-tn-purple/20 hover:bg-tn-purple/30 border-tn-purple/40' },
  orange: { text: 'text-tn-orange', border: 'border-tn-orange/40', bg: 'bg-tn-orange/10', ring: 'shadow-tn-orange/5', btnBg: 'bg-tn-orange/20 hover:bg-tn-orange/30 border-tn-orange/40' },
  cyan:   { text: 'text-tn-cyan',   border: 'border-tn-cyan/40',   bg: 'bg-tn-cyan/10',   ring: 'shadow-tn-cyan/5',   btnBg: 'bg-tn-cyan/20 hover:bg-tn-cyan/30 border-tn-cyan/40'   },
};

export default function RouteGroup({
  title, description, color = 'purple', routes, benchmarkRate,
  inputs, distanceMatrix, onAdd, onEdit, onDelete, onReset,
}) {
  const [expandedId, setExpandedId] = useState(null);
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [tcePopoverId, setTcePopoverId] = useState(null);
  if (!routes || routes.length === 0) return null;
  const c = COLOR_MAP[color];

  // route + earnings + $/pmt + days + tce + [breakdown: awrip+bunker+port+comm] + totalCost + profit + edit
  const COL_COUNT = showBreakdown ? 12 : 8;

  return (
    <section className={`bg-tn-bg-alt rounded-xl border ${c.border} shadow-lg ${c.ring} overflow-hidden`}>
      <header className="px-4 py-3 border-b border-tn-border flex items-center justify-between flex-wrap gap-2">
        <div>
          <div className="flex items-center gap-2">
            <span className={`inline-block w-2 h-2 rounded-full ${c.bg.replace('/10', '')}`}></span>
            <h2 className={`font-bold ${c.text} text-base uppercase tracking-wide`}>{title}</h2>
            <span className="text-[10px] text-tn-muted font-mono px-2 py-0.5 rounded bg-tn-bg-dark border border-tn-border">
              {routes.length} route{routes.length > 1 ? 's' : ''}
            </span>
          </div>
          <p className="text-xs text-tn-muted mt-1">{description}</p>
        </div>
        {benchmarkRate != null && (
          <div className="text-right">
            <div className="text-[10px] text-tn-muted uppercase tracking-wider font-mono">TCE (all routes)</div>
            <div className="text-sm font-mono font-bold text-tn-yellow">
              ${fmt0(benchmarkRate)}<span className="text-tn-muted text-xs font-normal">/day</span>
            </div>
          </div>
        )}
      </header>

      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-tn-bg-dark">
              <th className="text-left px-3 py-2 text-[11px] text-tn-muted font-semibold uppercase tracking-wider
                             border-b border-tn-border sticky left-0 bg-tn-bg-dark z-10 min-w-[200px]">
                Route
              </th>
              <Th highlight sub="USD · per voyage">Gross Total Earnings</Th>
              <Th sub="$/pmt">Implied Freight</Th>
              <Th sub="days">Total Days</Th>
              <Th sub="$/day">Implied TCE/Day</Th>

              {/* Expandable cost breakdown */}
              {showBreakdown && (
                <>
                  <Th sub="$">AWRIP</Th>
                  <Th sub="$">Bunker</Th>
                  <Th sub="$">Port Chgs</Th>
                  <Th sub="$">Commission</Th>
                </>
              )}

              {/* Total Cost header with expand toggle */}
              <th className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wider border-b border-tn-border
                             whitespace-nowrap text-right text-tn-muted">
                <div className="flex items-center justify-end gap-1">
                  <button
                    onClick={() => setShowBreakdown((b) => !b)}
                    title={showBreakdown ? 'Hide breakdown' : 'Show cost breakdown'}
                    className="text-[10px] px-1 py-0.5 rounded border border-tn-border/60
                               text-tn-muted hover:text-tn-fg hover:border-tn-fg transition-colors font-mono leading-none"
                  >
                    {showBreakdown ? '◀' : '▶'}
                  </button>
                  Total Cost
                </div>
                <div className="font-normal normal-case tracking-normal text-[10px] text-tn-muted mt-0.5 text-right">$</div>
              </th>

              <Th highlight sub="$ · owner's net">Total Profit</Th>
              <th className="px-2 border-b border-tn-border w-8" />
            </tr>
          </thead>
          <tbody>
            {routes.map((row) => {
              const profit = row.totalFreight - row.totalCost;
              return (
                <>
                  <tr key={row.id} className="border-b border-tn-border/40 hover:bg-tn-bg-hi transition-colors">
                    <td className="px-3 py-2 sticky left-0 z-10 bg-tn-bg-alt">
                      <RouteLabel id={row.id} origin={row.origin} dest={row.dest} color={c} />
                    </td>

                    <td className="px-3 py-2 text-right whitespace-nowrap">
                      <span className={`${c.bg} ${c.text} px-2.5 py-1 rounded border ${c.border}
                                        font-mono font-bold text-sm`}>
                        ${fmt0(row.totalFreight)}
                      </span>
                    </td>

                    <td className="px-3 py-2 text-right whitespace-nowrap">
                      <span className="font-mono text-tn-fg text-xs">
                        ${fmt2(row.frtRatePerMT)}
                        <span className="text-[10px] text-tn-muted ml-1">/pmt</span>
                      </span>
                    </td>

                    <Td>{fmtD(row.totalDays)}</Td>
                    <td className="px-3 py-2 relative text-right font-mono text-xs whitespace-nowrap text-tn-fg-dim">
                      <button
                        onClick={() => setTcePopoverId(tcePopoverId === row.id ? null : row.id)}
                        className="underline decoration-dotted hover:text-tn-cyan transition-colors"
                        title="Click to see formula"
                      >
                        ${fmt0(row.impliedTce)}
                      </button>
                      {tcePopoverId === row.id && (
                        <TcePopover row={row} onClose={() => setTcePopoverId(null)} />
                      )}
                    </td>

                    {showBreakdown && (
                      <>
                        <Td>${fmt0(row.awrip)}</Td>
                        <Td>${fmt0(row.bunkerCost)}</Td>
                        <Td>${fmt0(row.portChg)}</Td>
                        <Td>{row.commission != null ? `$${fmt0(row.commission)}` : '–'}</Td>
                      </>
                    )}

                    <Td>${fmt0(row.totalCost)}</Td>

                    <td className="px-3 py-2 text-right whitespace-nowrap">
                      <span className="font-mono font-bold text-sm text-tn-green">
                        ${fmt0(profit)}
                      </span>
                    </td>

                    <td className="px-2 py-2 text-center">
                      <button
                        onClick={() => setExpandedId(expandedId === row.id ? null : row.id)}
                        title={expandedId === row.id ? 'Close editor' : 'Edit route'}
                        className={`text-[11px] px-1.5 py-0.5 rounded border transition-colors font-mono
                                    ${expandedId === row.id
                                      ? `${c.btnBg} ${c.text} border-current`
                                      : 'text-tn-muted border-tn-border hover:text-tn-fg hover:border-tn-fg'}`}
                      >
                        {expandedId === row.id ? '✕' : '✎'}
                      </button>
                    </td>
                  </tr>

                  {expandedId === row.id && (
                    <tr key={row.id + '_edit'} className="bg-tn-bg border-b border-tn-border">
                      <td colSpan={COL_COUNT} className="p-4">
                        <EditForm
                          row={row}
                          c={c}
                          inputs={inputs}
                          distanceMatrix={distanceMatrix}
                          onEdit={onEdit}
                          onDelete={onDelete}
                          onReset={onReset}
                          onDone={() => setExpandedId(null)}
                        />
                      </td>
                    </tr>
                  )}
                </>
              );
            })}

            {/* Add route row */}
            <tr className="border-t border-tn-border/40">
              <td colSpan={COL_COUNT} className="px-3 py-2">
                <button
                  onClick={onAdd}
                  className={`text-xs font-mono px-3 py-1.5 rounded border ${c.btnBg} ${c.text}
                              flex items-center gap-1.5 transition-colors`}
                >
                  <span className="text-base leading-none">+</span> Add Route
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
}

// ── Inline edit form ──────────────────────────────────────────────────────────

function EditForm({ row, c, inputs, distanceMatrix, onEdit, onDelete, onReset, onDone }) {
  const ef = (field, value) => onEdit(row.id, field, value);

  // Derive display sequence: use stored disPortSequence, or back-compute from namedDisPorts for builtins
  const displaySeq = (row.disPortSequence && row.disPortSequence.length > 0)
    ? row.disPortSequence
    : (row.namedDisPorts || []).map((k) => CHARGE_KEY_TO_PORT[k]).filter(Boolean);

  // Discharge ports available for selection (all matrix ports except origin)
  const availablePorts = DISTANCE_PORTS.filter((p) => p !== row.origin && PORT_CHARGE_KEY[p]);

  function updateSequence(newSeq) {
    const named = newSeq.map((p) => PORT_CHARGE_KEY[p]).filter(Boolean);
    ef('disPortSequence', newSeq);
    ef('namedDisPorts', named);
    ef('disPChgOverride', null); // let named ports drive the charge
    if (newSeq.length > 0) {
      ef('dest', `${row.origin} → ${newSeq.join(' + ')}`);
    }
    // auto-fill miles for custom routes: ballast = last port → origin (direct), laden = chain sum
    if (!row.isBuiltin && newSeq.length > 0 && distanceMatrix) {
      const chain = [row.origin, ...newSeq];
      let laden = 0;
      for (let i = 0; i < chain.length - 1; i++) {
        laden += distanceMatrix[chain[i]]?.[chain[i + 1]] || 0;
      }
      const ballast = distanceMatrix[newSeq[newSeq.length - 1]]?.[row.origin] || 0;
      ef('miles_l', Math.round(laden * 100) / 100);
      ef('miles_b', Math.round(ballast * 100) / 100);
    }
  }

  function addPort() {
    const next = availablePorts.find((p) => !displaySeq.includes(p)) || availablePorts[0];
    updateSequence([...displaySeq, next]);
  }

  function removePort(i) {
    updateSequence(displaySeq.filter((_, j) => j !== i));
  }

  function changePort(i, val) {
    const seq = [...displaySeq];
    seq[i] = val;
    updateSequence(seq);
  }

  function applyFromMatrix() {
    if (!displaySeq.length) return;
    const chain = [row.origin, ...displaySeq];
    let laden = 0;
    for (let i = 0; i < chain.length - 1; i++) {
      laden += distanceMatrix?.[chain[i]]?.[chain[i + 1]] || 0;
    }
    const ballast = distanceMatrix?.[displaySeq[displaySeq.length - 1]]?.[row.origin] || 0;
    ef('miles_l', Math.round(laden * 100) / 100);
    ef('miles_b', Math.round(ballast * 100) / 100);
  }

  // Per-port charge breakdown (only for named ports)
  const namedPorts = (row.namedDisPorts || []);
  const hasOverride = row.disPChgOverride != null;

  return (
    <div>
      <div className={`text-[10px] font-mono uppercase tracking-widest ${c.text} mb-3`}>
        {row.isBuiltin ? `Built-in route (col ${row.id}) — all fields editable` : 'Custom route'}
      </div>

      {/* ── Discharge port selector ─────────────────────────── */}
      <div className="mb-4 p-3 rounded-lg bg-tn-bg-dark border border-tn-border/60">
        <div className="text-[10px] text-tn-muted font-mono uppercase tracking-wider mb-2">
          Discharge ports
        </div>
        <div className="flex items-start gap-2 flex-wrap">
          <span className={`text-xs font-mono px-1.5 py-1 rounded bg-tn-bg border border-tn-border ${c.text} self-center`}>
            {row.origin}
          </span>

          {displaySeq.map((port, i) => (
            <div key={i} className="flex items-center gap-1">
              <span className="text-tn-muted text-sm self-center">→</span>
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-1">
                  <select
                    value={port}
                    onChange={(e) => changePort(i, e.target.value)}
                    className="bg-tn-bg border border-tn-blue/40 text-tn-fg text-xs rounded px-1.5 py-1
                               focus:outline-none focus:border-tn-cyan focus:ring-1 focus:ring-tn-cyan/30"
                  >
                    {availablePorts.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                  {displaySeq.length > 1 && (
                    <button
                      onClick={() => removePort(i)}
                      className="text-tn-muted hover:text-tn-red text-xs leading-none w-4"
                      title="Remove port"
                    >×</button>
                  )}
                </div>
                {PORT_CHARGE_KEY[port] && !hasOverride && (
                  <div className="text-[9px] font-mono text-tn-muted leading-none px-0.5">
                    ${fmt0(inputs?.[PORT_CHARGE_KEY[port]] ?? 0)} (sidebar)
                  </div>
                )}
              </div>
            </div>
          ))}

          <button
            onClick={addPort}
            className={`self-center text-[11px] font-mono px-2 py-1 rounded border ${c.btnBg} ${c.text}
                        flex items-center gap-1 transition-colors`}
            title="Add another discharge port"
          >
            <span className="text-sm leading-none">+</span> port
          </button>
        </div>

        {/* Dis port charge summary */}
        <div className="mt-2 flex items-center gap-2 flex-wrap">
          {!hasOverride && namedPorts.length > 0 ? (
            <div className="text-[10px] font-mono text-tn-muted">
              Dis port total: {namedPorts.map((k) => (
                <span key={k} className="text-tn-fg-dim">${fmt0(inputs?.[k] ?? 0)}</span>
              )).reduce((acc, el, i) => i === 0 ? [el] : [...acc, <span key={`s${i}`} className="mx-0.5">+</span>, el], [])}
              <span className="text-tn-cyan ml-1 font-bold">= ${fmt0(row.disPChg)}</span>
              <span className="text-tn-muted ml-1">(changes with sidebar)</span>
            </div>
          ) : hasOverride ? (
            <div className="text-[10px] font-mono text-tn-muted">
              Dis port total: <span className="text-tn-yellow font-bold">${fmt0(row.disPChgOverride)}</span>
              <span className="text-tn-muted ml-1">(overridden)</span>
              <button onClick={() => ef('disPChgOverride', null)}
                className="ml-2 text-tn-cyan hover:text-tn-fg underline">clear override</button>
            </div>
          ) : null}

          <button
            onClick={applyFromMatrix}
            className={`text-[10px] font-mono px-2 py-0.5 rounded border ${c.btnBg} ${c.text} transition-colors ml-auto`}
            title="Laden = chain sum of all legs; Ballast = direct from LAST port back to load port"
          >
            ↑ Auto-fill miles from matrix
          </button>
        </div>

        {/* Optional override */}
        <div className="mt-2 flex items-center gap-2">
          <span className="text-[10px] text-tn-muted font-mono">Override dis port total $:</span>
          <input
            type="number" step="1000" min={0}
            placeholder="leave blank to use sidebar"
            value={hasOverride ? row.disPChgOverride : ''}
            onChange={(e) => {
              const v = e.target.value;
              ef('disPChgOverride', v === '' ? null : parseFloat(v) || 0);
            }}
            className="input-blue w-28 text-xs"
          />
        </div>
      </div>

      {/* ── Other fields ─────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-2">
        <EF label="Route Name" value={row.dest} type="text"
            onChange={(v) => ef('dest', v)} />
        <EF label="Ballast Miles" value={row.miles_b} unit="nm"
            onChange={(v) => ef('miles_b', parseFloat(v) || 0)} />
        <EF label="Laden Miles" value={row.miles_l} unit="nm"
            onChange={(v) => ef('miles_l', parseFloat(v) || 0)} />
        <EF label="Cargo MT" value={row.intank} unit="MT"
            onChange={(v) => ef('intank', parseFloat(v) || 0)} />
        <EF label="Days Disch" value={row.daysDisch} unit="d" step="0.5"
            onChange={(v) => ef('daysDisch', parseFloat(v) || 0)} />
        <EF label="NOR +6h" value={row.norPlus6} unit="d" step="0.25"
            onChange={(v) => ef('norPlus6', parseFloat(v) || 0)} />
        <EF label="Load Port $" value={row.loadPChgVal}
            onChange={(v) => ef('loadPChg', parseFloat(v) || 0)} />
        <SEF label="Sea Days Factor" value={String(row.seaDaysFactor)}
             options={[{ v: '1.05', l: '× 1.05 (standard)' }, { v: '1', l: '× 1.00 (no factor)' }]}
             onChange={(v) => ef('seaDaysFactor', parseFloat(v))} />
        <SEF label="MDO Rate" value={row.mdo_rate}
             options={[{ v: 'portMDO', l: 'Port MDO' }, { v: 'idleMDO', l: 'Idle MDO' }]}
             onChange={(v) => ef('mdo_rate', v)} />
      </div>

      {/* ── Action buttons ───────────────────────────────────── */}
      <div className="flex gap-2 mt-4 flex-wrap">
        {row.isBuiltin && (
          <button
            onClick={() => onReset(row.id)}
            className="text-[11px] font-mono px-2.5 py-1 rounded border border-tn-border
                       text-tn-muted hover:text-tn-yellow hover:border-tn-yellow transition-colors"
          >
            ↺ Reset to defaults
          </button>
        )}
        {!row.isBuiltin && (
          <button
            onClick={() => { onDelete(row.id); onDone(); }}
            className="text-[11px] font-mono px-2.5 py-1 rounded border border-tn-red/40
                       text-tn-red hover:bg-tn-red/10 transition-colors"
          >
            🗑 Delete route
          </button>
        )}
        <button
          onClick={onDone}
          className={`text-[11px] font-mono px-2.5 py-1 rounded border ${c.btnBg} ${c.text} ml-auto transition-colors`}
        >
          ✓ Done
        </button>
      </div>
    </div>
  );
}

// ── TCE breakdown popover ─────────────────────────────────────────────────────

function TcePopover({ row, onClose }) {
  const commRate = row.commRate ?? 0.03975;
  const netFactor = 1 - commRate;
  const net = row.totalFreight * netFactor - row.awrip - row.bunkerCost - row.portChg;
  const pct = (commRate * 100).toFixed(3);
  const netPct = (netFactor * 100).toFixed(4);
  return (
    <div className="absolute z-50 top-full right-0 mt-1 w-[360px] bg-tn-bg-dark border border-tn-cyan/30
                    rounded-lg p-4 shadow-2xl shadow-black/50 text-left">
      <div className="flex items-center justify-between mb-3">
        <div className="text-[10px] font-mono uppercase tracking-widest text-tn-cyan font-bold">
          Implied TCE / Day — {row.dest}
        </div>
        <button onClick={onClose} className="text-tn-muted hover:text-tn-fg text-xs leading-none ml-2 flex-shrink-0">✕</button>
      </div>

      <div className="font-mono text-[11px] space-y-2">
        <div className="text-tn-muted leading-relaxed">
          ( Gross Earnings × {netPct}% − AWRIP − Bunker − Port Chg ) ÷ Total Days
        </div>

        <div className="bg-tn-bg rounded p-3 border border-tn-border leading-relaxed text-tn-fg-dim space-y-0.5">
          <div className="flex justify-between gap-4">
            <span className="text-tn-muted">Gross Earnings × {netPct}% <span className="text-tn-border">(net of {pct}% comm)</span></span>
            <span className="text-tn-fg">${fmt0(row.totalFreight * netFactor)}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-tn-muted">− AWRIP</span>
            <span className="text-tn-red">−${fmt0(row.awrip)}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-tn-muted">− Bunker</span>
            <span className="text-tn-red">−${fmt0(row.bunkerCost)}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-tn-muted">− Port Charges</span>
            <span className="text-tn-red">−${fmt0(row.portChg)}</span>
          </div>
          <div className="flex justify-between gap-4 pt-1 border-t border-tn-border/60 mt-1">
            <span className="text-tn-muted">Net hire</span>
            <span className="text-tn-fg font-bold">${fmt0(net)}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-tn-muted">÷ Total Days</span>
            <span className="text-tn-fg">{fmtD(row.totalDays)} d</span>
          </div>
        </div>

        <div className="flex justify-between items-baseline pt-1 border-t border-tn-border">
          <span className="text-tn-muted text-[10px]">= Implied TCE/Day</span>
          <span className="text-tn-cyan font-bold text-base">${fmt0(row.impliedTce)}<span className="text-tn-muted text-xs font-normal">/day</span></span>
        </div>
      </div>
    </div>
  );
}

// ── Small field helpers ───────────────────────────────────────────────────────

function EF({ label, value, type = 'number', unit, step = 'any', note, onChange }) {
  return (
    <div className="flex flex-col gap-0.5">
      <label className="text-[10px] text-tn-muted font-mono uppercase tracking-wide">{label}</label>
      <div className="flex items-center gap-1">
        <input
          type={type}
          step={type === 'number' ? step : undefined}
          min={type === 'number' ? 0 : undefined}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="input-blue flex-1 min-w-0 text-right"
        />
        {unit && <span className="text-[10px] text-tn-muted font-mono whitespace-nowrap">{unit}</span>}
      </div>
      {note && <div className="text-[9px] text-tn-muted font-mono leading-tight">{note}</div>}
    </div>
  );
}

function SEF({ label, value, options, onChange }) {
  return (
    <div className="flex flex-col gap-0.5">
      <label className="text-[10px] text-tn-muted font-mono uppercase tracking-wide">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-tn-bg-dark border border-tn-blue/40 rounded px-2 py-1 text-sm text-tn-cyan font-mono
                   focus:outline-none focus:border-tn-cyan focus:ring-1 focus:ring-tn-cyan"
      >
        {options.map((o) => <option key={o.v} value={o.v}>{o.l}</option>)}
      </select>
    </div>
  );
}

// ── Table primitives ──────────────────────────────────────────────────────────

function Th({ children, sub, highlight }) {
  return (
    <th className={`px-3 py-2 text-[11px] font-semibold uppercase tracking-wider border-b border-tn-border
                    whitespace-nowrap text-right
                    ${highlight ? 'text-tn-yellow' : 'text-tn-muted'}`}>
      {children}
      {sub && <div className="font-normal normal-case tracking-normal text-[10px] text-tn-muted mt-0.5">{sub}</div>}
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

function RouteLabel({ id, origin, dest, color }) {
  return (
    <div className="text-left">
      <div className="font-semibold text-xs text-tn-fg">
        <span className={color.text}>{origin}</span>
        <span className="text-tn-muted mx-1">→</span>
        <span className="text-tn-fg">{dest}</span>
      </div>
      <div className="inline-block text-[10px] mt-0.5 font-mono px-1.5 py-0.5 rounded
                      bg-tn-bg-dark text-tn-muted border border-tn-border">
        col {id}
      </div>
    </div>
  );
}
