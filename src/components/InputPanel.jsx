import { useState } from 'react';
import { DISTANCE_PORTS, PORT_SHORT } from '../utils/calculations.js';

function NumInput({ label, id, value, onChange, unit, min, step = 'any', tooltip }) {
  return (
    <div className="flex items-center gap-1 py-0.5">
      <label htmlFor={id} className="label-cell flex-1" title={tooltip}>
        {label}
        {unit && <span className="text-tn-muted ml-1">({unit})</span>}
      </label>
      <input
        id={id}
        type="number" step={step} min={min}
        value={value}
        onChange={(e) => onChange(id, parseFloat(e.target.value) || 0)}
        className="input-blue w-24"
      />
    </div>
  );
}

function SectionTitle({ children, color = 'blue', action }) {
  const colorClass = {
    blue:   'text-tn-blue border-tn-blue/40',
    cyan:   'text-tn-cyan border-tn-cyan/40',
    purple: 'text-tn-purple border-tn-purple/40',
    yellow: 'text-tn-yellow border-tn-yellow/40',
    green:  'text-tn-green border-tn-green/40',
    orange: 'text-tn-orange border-tn-orange/40',
    red:    'text-tn-red border-tn-red/40',
  }[color];

  return (
    <div className={`flex items-center justify-between text-[10px] font-bold uppercase tracking-widest
                    ${colorClass} bg-tn-bg-dark border-l-2 px-2 py-1 mt-4 mb-1 -mx-2 rounded-sm font-mono`}>
      <span>{children}</span>
      {action}
    </div>
  );
}

export default function InputPanel({ inputs: inp, onChange, distanceMatrix, onMatrixChange }) {
  const [matrixOpen, setMatrixOpen] = useState(true);

  return (
    <div className="bg-tn-bg-alt rounded-xl shadow-lg p-4 space-y-0 text-sm border border-tn-border">
      <h2 className="font-bold text-tn-fg text-base mb-1 flex items-center gap-2">
        <span className="inline-block w-3 h-3 rounded-sm bg-tn-blue"></span>
        Inputs
      </h2>
      <p className="text-xs text-tn-muted mb-2 font-mono">// blue cells from spreadsheet</p>

      <SectionTitle color="cyan">Market &amp; Vessel</SectionTitle>
      <p className="text-[10px] text-tn-muted -mt-0.5 mb-1 font-mono">
        // target freight rate is the hero card ↑
      </p>
      <NumInput label="In-Tank Qty" id="intankMT" value={inp.intankMT} onChange={onChange} unit="MT" min={0} />
      <NumInput label="IFO Price" id="ifoPrice" value={inp.ifoPrice} onChange={onChange} unit="$/MT" min={0} />
      <NumInput label="MDO Price" id="mdoPrice" value={inp.mdoPrice} onChange={onChange} unit="$/MT" min={0} />

      <SectionTitle color="blue">Route B — Ras Tanura → Chiba</SectionTitle>
      <NumInput label="Miles Ballast" id="milesBallastB" value={inp.milesBallastB} onChange={onChange} unit="nm" min={0} />
      <NumInput label="Miles Laden" id="milesLadenB" value={inp.milesLadenB} onChange={onChange} unit="nm" min={0} />
      <NumInput label="Load Port Chg" id="loadPChgB" value={inp.loadPChgB} onChange={onChange} unit="$" min={0} />
      <NumInput label="Dis Port Chg" id="disPChgB" value={inp.disPChgB} onChange={onChange} unit="$" min={0} />
      <NumInput label="AWRIP" id="awripB" value={inp.awripB} onChange={onChange} unit="$" min={0} />

      <SectionTitle color="purple">India Routes — All</SectionTitle>
      <NumInput label="AWRIP" id="awripIndia" value={inp.awripIndia} onChange={onChange} unit="$" min={0}
        tooltip="War risk + insurance + P&I, applied to every India route" />
      <NumInput label="Commission" id="commission" value={inp.commission} onChange={onChange} unit="%" step={0.001} min={0} max={10}
        tooltip="Address + brokerage commission applied to all India route gross freight" />
      <div className="text-[10px] text-tn-muted font-mono -mt-0.5 mb-1 pl-1">
        Gross factor: {((1 - (inp.commission ?? 3.975) / 100) * 100).toFixed(4)}% · applies to all Ruwais routes
      </div>

      <SectionTitle color="green">Vessel Performance</SectionTitle>
      <NumInput label="Speed Ballast" id="spdBlst" value={inp.spdBlst} onChange={onChange} unit="kn" min={1} />
      <NumInput label="Speed Laden" id="spdLadn" value={inp.spdLadn} onChange={onChange} unit="kn" min={1} />
      <NumInput label="Ballast IFO" id="blstIFO" value={inp.blstIFO} onChange={onChange} unit="MT/d" min={0} />
      <NumInput label="Laden IFO" id="ladnIFO" value={inp.ladnIFO} onChange={onChange} unit="MT/d" min={0} />
      <NumInput label="Port IFO" id="portIFO" value={inp.portIFO} onChange={onChange} unit="MT/d" min={0} />
      <NumInput label="Sea MDO" id="seaMDO" value={inp.seaMDO} onChange={onChange} unit="MT/d" step={0.01} min={0} />
      <NumInput label="Port MDO" id="portMDO" value={inp.portMDO} onChange={onChange} unit="MT/d" step={0.01} min={0} />
      <NumInput label="Idle MDO" id="idleMDO" value={inp.idleMDO} onChange={onChange} unit="MT/d" step={0.01} min={0} />

      <SectionTitle color="yellow">Port Days (Route B)</SectionTitle>
      <NumInput label="NOR +6h" id="norPlus6B" value={inp.norPlus6B} onChange={onChange} unit="days" step={0.25} min={0} />
      <NumInput label="Days Loading" id="daysLoadingB" value={inp.daysLoadingB} onChange={onChange} unit="days" step={0.5} min={0} />
      <NumInput label="Days Disch" id="daysDischB" value={inp.daysDischB} onChange={onChange} unit="days" step={0.5} min={0} />
      <NumInput label="Days Bunkering" id="daysBunB" value={inp.daysBunB} onChange={onChange} unit="days" step={0.25} min={0} />
      <NumInput label="Sea Margin" id="seaMargin" value={inp.seaMargin} onChange={onChange} unit="%" step={0.005} min={0} max={0.5}
        tooltip="Fraction, e.g. 0.05 = 5%" />

      <SectionTitle color="orange">Indian Port Charges</SectionTitle>
      <NumInput label="Dahej" id="portDahej" value={inp.portDahej} onChange={onChange} unit="$" min={0} />
      <NumInput label="NMG (New Mangalore)" id="portNMG" value={inp.portNMG} onChange={onChange} unit="$" min={0} />
      <NumInput label="Vizag" id="portViz" value={inp.portViz} onChange={onChange} unit="$" min={0} />
      <NumInput label="Haldia" id="portHald" value={inp.portHald} onChange={onChange} unit="$" min={0} />
      <NumInput label="Haldia STS" id="portHaldSTS" value={inp.portHaldSTS} onChange={onChange} unit="$" min={0} />
      <NumInput label="Mumbai" id="portMumbai" value={inp.portMumbai} onChange={onChange} unit="$" min={0} />
      <NumInput label="Krishnapatnam" id="portKrishnapatnam" value={inp.portKrishnapatnam} onChange={onChange} unit="$" min={0} />

      {/* ── Distance Matrix ──────────────────────────────────── */}
      <SectionTitle
        color="red"
        action={
          <button
            onClick={() => setMatrixOpen((o) => !o)}
            className="text-tn-muted hover:text-tn-fg text-[10px] normal-case tracking-normal font-normal ml-2"
          >
            {matrixOpen ? '▲ hide' : '▼ show'}
          </button>
        }
      >
        Distance Matrix (nm)
      </SectionTitle>

      {matrixOpen && (
        <div className="overflow-x-auto -mx-2 mt-1">
          <table className="border-collapse text-xs font-mono w-max">
            <thead>
              <tr>
                <th className="w-8 sticky left-0 bg-tn-bg-alt z-10" />
                {DISTANCE_PORTS.map((p) => (
                  <th key={p} className="px-1 pb-1 text-tn-muted text-center" style={{ width: 60 }}>
                    {PORT_SHORT[p]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {DISTANCE_PORTS.map((from) => (
                <tr key={from}>
                  <td className="pr-2 text-tn-fg-dim font-medium sticky left-0 bg-tn-bg-alt z-10 whitespace-nowrap">
                    {PORT_SHORT[from]}
                  </td>
                  {DISTANCE_PORTS.map((to) => (
                    <td key={to} className="p-0.5">
                      {from === to ? (
                        <div className="w-[58px] text-center text-tn-border select-none">—</div>
                      ) : (
                        <input
                          type="number" step="0.01" min={0}
                          value={distanceMatrix[from]?.[to] ?? 0}
                          onChange={(e) => onMatrixChange(from, to, parseFloat(e.target.value) || 0)}
                          className="w-[58px] bg-tn-bg-dark border border-tn-border/50 rounded px-1
                                     text-tn-cyan text-right focus:outline-none focus:border-tn-cyan
                                     focus:ring-1 focus:ring-tn-cyan/30 transition-colors"
                          style={{ fontSize: 11, height: 22 }}
                        />
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <p className="text-[10px] text-tn-muted mt-1.5 px-2 font-mono leading-relaxed">
            Symmetric — editing one cell updates its mirror.<br/>
            Used to auto-fill laden miles on custom routes.
          </p>
        </div>
      )}

      <div className="mt-4 text-xs text-tn-muted border-t border-tn-border pt-3 font-mono leading-relaxed">
        India routes use fixed geometry; all routes share vessel performance.
      </div>
    </div>
  );
}
