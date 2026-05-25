const fmt0 = (v) =>
  v == null ? '–' : v.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
const fmt2 = (v) =>
  v == null ? '–' : v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtD = (v) => (v == null ? '–' : v.toFixed(2));

const COLOR_MAP = {
  purple: { text: 'text-tn-purple', border: 'border-tn-purple/40', bg: 'bg-tn-purple/10', ring: 'shadow-tn-purple/5' },
  orange: { text: 'text-tn-orange', border: 'border-tn-orange/40', bg: 'bg-tn-orange/10', ring: 'shadow-tn-orange/5' },
  cyan:   { text: 'text-tn-cyan',   border: 'border-tn-cyan/40',   bg: 'bg-tn-cyan/10',   ring: 'shadow-tn-cyan/5' },
};

export default function RouteGroup({ title, description, color = 'purple', routes }) {
  if (!routes || routes.length === 0) return null;
  const c = COLOR_MAP[color];

  return (
    <section className={`bg-tn-bg-alt rounded-xl border ${c.border} shadow-lg ${c.ring} overflow-hidden`}>
      <header className="px-4 py-3 border-b border-tn-border flex items-center justify-between flex-wrap gap-2">
        <div>
          <div className="flex items-center gap-2">
            <span className={`inline-block w-2 h-2 rounded-full ${c.bg.replace('/10','')}`}></span>
            <h2 className={`font-bold ${c.text} text-base uppercase tracking-wide`}>{title}</h2>
            <span className="text-[10px] text-tn-muted font-mono px-2 py-0.5 rounded bg-tn-bg-dark border border-tn-border">
              {routes.length} route{routes.length > 1 ? 's' : ''}
            </span>
          </div>
          <p className="text-xs text-tn-muted mt-1">{description}</p>
        </div>
      </header>

      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-tn-bg-dark">
              <th className="text-left px-3 py-2 text-[11px] text-tn-muted font-semibold uppercase tracking-wider
                             border-b border-tn-border sticky left-0 bg-tn-bg-dark z-10 min-w-[200px]">
                Route
              </th>
              <Th highlight>Break-Even Frt</Th>
              <Th sub="MT">Cargo</Th>
              <Th sub="days">Total Days</Th>
              <Th sub="days">Sea Days</Th>
              <Th sub="$">Bunker Cost</Th>
              <Th sub="$">Port Chgs</Th>
              <Th sub="$">Commission</Th>
              <Th sub="$">Total Cost</Th>
            </tr>
          </thead>
          <tbody>
            {routes.map((row) => (
              <tr key={row.id} className="border-b border-tn-border/40 hover:bg-tn-bg-hi transition-colors">
                <td className="px-3 py-2 sticky left-0 z-10 bg-tn-bg-alt">
                  <RouteLabel id={row.id} origin={row.origin} dest={row.dest} color={c} />
                </td>
                <td className="px-3 py-2 text-right whitespace-nowrap">
                  <span className={`${c.bg} ${c.text} px-2.5 py-1 rounded border ${c.border}
                                    font-mono font-bold text-sm`}>
                    ${fmt2(row.frtRatePerMT)}
                    <span className="text-[10px] text-tn-muted ml-1 font-normal">/pmt</span>
                  </span>
                </td>
                <Td>{fmt0(row.id === 'D' ? 46200 : 45000)}</Td>
                <Td>{fmtD(row.totalDays)}</Td>
                <Td>{fmtD(row.voyageDays)}</Td>
                <Td>${fmt0(row.bunkerCost)}</Td>
                <Td>${fmt0(row.portChg)}</Td>
                <Td>{row.commission ? `$${fmt0(row.commission)}` : '–'}</Td>
                <Td>${fmt0(row.totalCost)}</Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function Th({ children, sub, highlight }) {
  return (
    <th className={`px-3 py-2 text-[11px] font-semibold uppercase tracking-wider border-b border-tn-border
                    whitespace-nowrap text-right
                    ${highlight ? 'text-tn-cyan' : 'text-tn-muted'}`}>
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
