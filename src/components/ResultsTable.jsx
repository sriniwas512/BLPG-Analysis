const fmt0 = (v) =>
  v == null ? '–' : v.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
const fmt2 = (v) =>
  v == null ? '–' : v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtD = (v) => (v == null ? '–' : v.toFixed(2));

const COLS = [
  { key: 'frtRatePerMT',  label: 'Frt Rate',    sub: '$/MT',    fmt: fmt2,  highlight: true },
  { key: 'totalDays',     label: 'Total Days',   sub: 'days',    fmt: fmtD,  highlight: false },
  { key: 'voyageDays',    label: 'Sea Days',     sub: 'days',    fmt: fmtD,  highlight: false },
  { key: 'bunkerCost',    label: 'Bunker Cost',  sub: '$',       fmt: fmt0,  highlight: false },
  { key: 'portChg',       label: 'Port Chgs',    sub: '$',       fmt: fmt0,  highlight: false },
  { key: 'timeCost',      label: 'Time Cost',    sub: '$',       fmt: fmt0,  highlight: false },
  { key: 'totalCost',     label: 'Total Cost',   sub: '$',       fmt: fmt0,  highlight: false },
  { key: 'tce',           label: 'TCE',          sub: '$/day',   fmt: fmt0,  highlight: true  },
  { key: 'tcePlusBunk',   label: 'TCE+Bunk',     sub: '$/day',   fmt: fmt0,  highlight: true  },
];

function RouteLabel({ id, origin, dest }) {
  const isRef = id === 'B';
  return (
    <div className="text-left">
      <div className={`font-bold text-xs ${isRef ? 'text-blue-800' : 'text-slate-700'}`}>
        {id === 'B' ? '★ ' : ''}{origin}
      </div>
      <div className="text-slate-500 text-xs leading-tight">→ {dest}</div>
      <div className={`text-xs mt-0.5 font-mono px-1 rounded ${isRef ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'}`}>
        Col {id}
      </div>
    </div>
  );
}

export default function ResultsTable({ results }) {
  if (!results || results.length === 0) return null;

  const refTce = results[0]?.tce ?? 0;

  return (
    <div className="bg-white rounded-xl shadow overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
        <h2 className="font-bold text-slate-700">Route Comparison</h2>
        <span className="text-xs text-slate-400">
          India routes show break-even freight rate to match reference TCE
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-slate-50">
              <th className="text-left px-3 py-2 text-xs text-slate-500 font-semibold border-b border-slate-200 sticky left-0 bg-slate-50 z-10 min-w-[140px]">
                Route
              </th>
              {COLS.map((c) => (
                <th key={c.key}
                    className={`px-3 py-2 text-xs font-semibold border-b border-slate-200 whitespace-nowrap text-right
                                ${c.highlight ? 'text-blue-700 bg-blue-50' : 'text-slate-500'}`}>
                  {c.label}
                  <div className="font-normal text-slate-400">{c.sub}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {results.map((row, i) => {
              const isRef = row.id === 'B';
              const isIndiaRoute = !['B', 'D'].includes(row.id);
              const tceDiff = row.tce - refTce; // for india routes this is ~0

              return (
                <tr key={row.id}
                    className={`border-b border-slate-100 hover:bg-slate-50 transition-colors
                                ${isRef ? 'bg-blue-50' : ''}`}>
                  <td className={`px-3 py-2 sticky left-0 z-10
                                  ${isRef ? 'bg-blue-50' : 'bg-white hover:bg-slate-50'}`}>
                    <RouteLabel id={row.id} origin={row.origin} dest={row.dest} />
                  </td>
                  {COLS.map((c) => {
                    const val = row[c.key];
                    const isRate = c.key === 'frtRatePerMT';
                    const isTce  = c.key === 'tce' || c.key === 'tcePlusBunk';

                    return (
                      <td key={c.key}
                          className={`px-3 py-2 text-right font-mono text-xs whitespace-nowrap
                                      ${c.highlight ? 'font-semibold' : ''}
                                      ${isRef && c.highlight ? 'text-blue-800' : ''}
                                      ${isIndiaRoute && isRate ? 'text-amber-700 font-bold' : ''}`}>
                        {c.key === 'frtRatePerMT' && !isRef
                          ? <span className="bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                              ${c.fmt(val)}
                            </span>
                          : c.fmt(val)}
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
      <div className="px-4 py-3 bg-slate-50 border-t border-slate-100 flex flex-wrap gap-4 text-xs text-slate-500">
        <div className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 bg-blue-100 border border-blue-300 rounded-sm"></span>
          Reference voyage (Ras Tanura → Chiba)
        </div>
        <div className="flex items-center gap-1.5">
          <span className="inline-block w-8 h-4 bg-amber-50 border border-amber-200 rounded-sm"></span>
          Break-even freight rate for India route to match reference TCE
        </div>
        <div className="flex items-center gap-1.5">
          Commission: 3.975% (India routes only)
        </div>
      </div>
    </div>
  );
}
