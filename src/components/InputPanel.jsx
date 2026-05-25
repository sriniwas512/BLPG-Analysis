function NumInput({ label, id, value, onChange, unit, min, step = 'any', tooltip }) {
  return (
    <div className="flex items-center gap-1 py-0.5">
      <label htmlFor={id} className="label-cell flex-1" title={tooltip}>
        {label}
        {unit && <span className="text-tn-muted ml-1">({unit})</span>}
      </label>
      <input
        id={id}
        type="number"
        step={step}
        min={min}
        value={value}
        onChange={(e) => onChange(id, parseFloat(e.target.value) || 0)}
        className="input-blue w-24"
      />
    </div>
  );
}

function SectionTitle({ children, color = 'blue' }) {
  const colorClass = {
    blue:   'text-tn-blue border-tn-blue/40',
    cyan:   'text-tn-cyan border-tn-cyan/40',
    purple: 'text-tn-purple border-tn-purple/40',
    yellow: 'text-tn-yellow border-tn-yellow/40',
    green:  'text-tn-green border-tn-green/40',
    orange: 'text-tn-orange border-tn-orange/40',
  }[color];

  return (
    <div className={`text-[10px] font-bold uppercase tracking-widest ${colorClass}
                    bg-tn-bg-dark border-l-2 px-2 py-1 mt-4 mb-1 -mx-2 rounded-sm font-mono`}>
      {children}
    </div>
  );
}

export default function InputPanel({ inputs: inp, onChange }) {
  return (
    <div className="bg-tn-bg-alt rounded-xl shadow-lg p-4 space-y-0 text-sm border border-tn-border">
      <h2 className="font-bold text-tn-fg text-base mb-1 flex items-center gap-2">
        <span className="inline-block w-3 h-3 rounded-sm bg-tn-blue"></span>
        Inputs
      </h2>
      <p className="text-xs text-tn-muted mb-2 font-mono">// blue cells from spreadsheet</p>

      <SectionTitle color="cyan">Market &amp; Vessel</SectionTitle>
      <NumInput label="Freight Rate" id="frtRate" value={inp.frtRate} onChange={onChange} unit="$/MT" min={0} />
      <NumInput label="In-Tank Qty" id="intankMT" value={inp.intankMT} onChange={onChange} unit="MT" min={0} />
      <NumInput label="IFO Price" id="ifoPrice" value={inp.ifoPrice} onChange={onChange} unit="$/MT" min={0} />
      <NumInput label="MDO Price" id="mdoPrice" value={inp.mdoPrice} onChange={onChange} unit="$/MT" min={0} />

      <SectionTitle color="blue">Route B — Ras Tanura → Chiba</SectionTitle>
      <NumInput label="Miles Ballast" id="milesBallastB" value={inp.milesBallastB} onChange={onChange} unit="nm" min={0} />
      <NumInput label="Miles Laden" id="milesLadenB" value={inp.milesLadenB} onChange={onChange} unit="nm" min={0} />
      <NumInput label="Load Port Chg" id="loadPChgB" value={inp.loadPChgB} onChange={onChange} unit="$" min={0} />
      <NumInput label="Dis Port Chg" id="disPChgB" value={inp.disPChgB} onChange={onChange} unit="$" min={0} />
      <NumInput label="AWRIP" id="awripB" value={inp.awripB} onChange={onChange} unit="$" min={0} />

      <SectionTitle color="purple">Route D — MAA → Ningbo+Caojing</SectionTitle>
      <NumInput label="Miles Ballast" id="milesBallastD" value={inp.milesBallastD} onChange={onChange} unit="nm" min={0} />
      <NumInput label="Miles Laden" id="milesLadenD" value={inp.milesLadenD} onChange={onChange} unit="nm" min={0} />
      <NumInput label="Load Port Chg" id="loadPChgD" value={inp.loadPChgD} onChange={onChange} unit="$" min={0} />
      <NumInput label="Dis Port Chg" id="disPChgD" value={inp.disPChgD} onChange={onChange} unit="$" min={0} />
      <NumInput label="Days Disch" id="daysDischD" value={inp.daysDischD} onChange={onChange} unit="days" step={0.5} min={0} />

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

      <div className="mt-4 text-xs text-tn-muted border-t border-tn-border pt-3 font-mono leading-relaxed">
        India routes use fixed geometry; all routes share vessel performance.
      </div>
    </div>
  );
}
