const fmt0 = (v) =>
  v == null ? '–' : v.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
const fmt2 = (v) =>
  v == null ? '–' : v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtD = (v) => (v == null ? '–' : v.toFixed(2));

const COLS = [
  { key: 'frtRatePerMT', label: 'Frt Rate',    sub: '$/MT',  fmt: fmt2, highlight: true  },
  { key: 'totalDays',    label: 'Total Days',  sub: 'days',  fmt: fmtD, highlight: false },
  { key: 'voyageDays',   label: 'Sea Days',    sub: 'days',  fmt: fmtD, highlight: false },
  { key: 'bunkerCost',   label: 'Bunker Cost', sub: '$',     fmt: fmt0, highlight: false },
  { key: 'portChg',      label: 'Port Chgs',   sub: '$',     fmt: fmt0, highlight: false },
  { key: 'timeCost',     label: 'Time Cost',   sub: '$',     fmt: fmt0, highlight: false },
  { key: 'totalCost',    label: 'Total Cost',  sub: '$',     fmt: fmt0, highlight: false },
  { key: 'tce',          label: 'TCE',         sub: '$/day', fmt: fmt0, highlight: true  },
  { key: 'tcePlusBunk',  label: 'TCE+Bunk',    sub: '$/day', fmt: fmt0, highlight: true  },
];

function RouteLabel({ id, origin, dest }) {
  const isRef = id === 'B';
  return (
    <div className="text-left">
      <div className={`font-semibold text-xs ${isRef ? 'text-tn-cyan' : 'text-tn-fg'}`}>
        {isRef && <span className="text-tn-yellow">★ </span>}
        {origin}
      </div>
      <div className="text-tn-muted text-xs leading-tight">→ {dest}</div>
      <div className={`inline-block text-[10px] mt-0.5 font-mono px-1.5 py-0.5 rounded
                       ${isRef
                          ? 'bg-tn-cyan/20 text-tn-cyan border border-tn-cyan/30'
                          : 'bg-tn-bg-dark text-tn-muted border border-tn-border'}`}>
        col {id}
      </div>
    </div>
  );
}

export default function ResultsTable({ results }) {
  if (!results || results.length === 0) return null;

  return (
    <div className="bg-tn-bg-alt rounded-xl shadow-lg overflow-hidden border border-tn-border">
      <div className="px-4 py-3 border-b border-tn-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="font-semibold text-tn-fg">Route Comparison</h2>
          <span className="text-[10px] text-tn-muted font-mono px-2 py-0.5 rounded bg-tn-bg-dark border border-tn-border">
            {results.length} voyages
          </span>
        </div>
        <span className="text-xs text-tn-muted">
          India routes → break-even freight to match reference TCE
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-tn-bg-dark">
              <th className="text-left px-3 py-2 text-[11px] text-tn-muted font-semibold uppercase tracking-wider
                             border-b border-tn-border sticky left-0 bg-tn-bg-dark z-10 min-w-[180px]">
                Route
              </th>
              {COLS.map((c) => (
                <th key={c.key}
                    className={`px-3 py-2 text-[11px] font-semibold uppercase tracking-wider border-b border-tn-border
                                whitespace-nowrap text-right
                                ${c.highlight ? 'text-tn-cyan' : 'text-tn-muted'}`}>
                  {c.label}
                  <div className="font-normal normal-case tracking-normal text-[10px] text-tn-muted mt-0.5">
                    {c.sub}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {results.map((row) => {
              const isRef = row.id === 'B';
              const isIndia = !['B', 'D'].includes(row.id);
              const rowBg = isRef
                ? 'bg-tn-cyan/5 hover:bg-tn-cyan/10'
                : 'hover:bg-tn-bg-hi';
              const stickyBg = isRef
                ? 'bg-tn-cyan/5'
                : 'bg-tn-bg-alt';

              return (
                <tr key={row.id} className={`border-b border-tn-border/40 transition-colors ${rowBg}`}>
                  <td className={`px-3 py-2 sticky left-0 z-10 ${stickyBg}`}>
                    <RouteLabel id={row.id} origin={row.origin} dest={row.dest} />
                  </td>
                  {COLS.map((c) => {
                    const val = row[c.key];
                    const isRate = c.key === 'frtRatePerMT';

                    let cellClass = 'px-3 py-2 text-right font-mono text-xs whitespace-nowrap text-tn-fg-dim';
                    if (c.highlight) cellClass += ' font-semibold';
                    if (isRef && c.highlight) cellClass += ' text-tn-cyan';

                    return (
                      <td key={c.key} className={cellClass}>
                        {isRate && isIndia ? (
                          <span className="bg-tn-yellow/10 text-tn-yellow px-2 py-0.5 rounded
                                           border border-tn-yellow/30 font-bold">
                            ${c.fmt(val)}
                          </span>
                        ) : (
                          c.fmt(val)
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="px-4 py-3 bg-tn-bg-dark border-t border-tn-border flex flex-wrap gap-x-6 gap-y-2 text-[11px] text-tn-muted">
        <div className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 bg-tn-cyan/20 border border-tn-cyan/40 rounded-sm"></span>
          Reference voyage (Ras Tanura → Chiba)
        </div>
        <div className="flex items-center gap-1.5">
          <span className="inline-block w-8 h-4 bg-tn-yellow/10 border border-tn-yellow/30 rounded-sm"></span>
          Break-even freight to match reference TCE
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-tn-muted">Commission:</span>
          <span className="text-tn-purple font-mono">3.975%</span>
          <span>(India routes)</span>
        </div>
      </div>
    </div>
  );
}
