// All formulas replicated from AG - INDIA sheet.
// Column B = Ras Tanura → Chiba (reference voyage)
// Column D = MAA → Ningbo + Caojing
// Columns G,I,K,M,O,Q,S,U,W = Ruwais/MAA → Indian ports

export const DEFAULT_INPUTS = {
  // Market / vessel (blue, column B)
  frtRate: 207,
  intankMT: 46200,
  ifoPrice: 925,
  mdoPrice: 1495,
  awripB: 0,
  spdBlst: 16,
  spdLadn: 16,
  blstIFO: 45,
  ladnIFO: 45,
  portIFO: 11,
  seaMDO: 0.1,
  portMDO: 0.1,
  idleMDO: 0.1,
  norPlus6B: 0.5,
  daysLoadingB: 2,
  daysDischB: 2,
  daysBunB: 0.5,
  seaMargin: 0.05,

  // Route B geometry (blue)
  milesBallastB: 6674.11,
  milesLadenB: 6665.76,
  loadPChgB: 12000,
  disPChgB: 75000,

  // Route D geometry (blue)
  milesBallastD: 11848.82,
  milesLadenD: 1702.05,
  loadPChgD: 12000,
  disPChgD: 295000,
  daysDischD: 2.5,

  // Port charges – Z column (editable)
  portDahej: 191000,
  portNMG: 70000,
  portViz: 114000,
  portHald: 94000,
  portHaldSTS: 60000,
  portMumbai: 165000,
  portKrishnapatnam: 140000,
};

// ─── Route B (Ras Tanura → Chiba) ───────────────────────────────────────────

function calcB(inp) {
  const sm = inp.seaMargin;

  const blstDays = ((inp.milesBallastB * (1 + sm)) / inp.spdBlst / 24) * 1.05; // B33
  const ladnDays = ((inp.milesLadenB * (1 + sm)) / inp.spdLadn / 24) * 1.05;   // B34
  const voyageDays = blstDays + ladnDays;                                         // B35

  const portDaysFactors = inp.norPlus6B + inp.daysLoadingB + inp.daysDischB + inp.daysBunB; // B36+B37+B38+B39
  const totalDays = voyageDays + portDaysFactors;                                 // B43

  const ifoMT = inp.blstIFO * blstDays + inp.ladnIFO * ladnDays + portDaysFactors * inp.portIFO; // B44
  const mdoMT = inp.seaMDO * voyageDays + inp.portMDO * portDaysFactors;                          // B45

  const bunkerCost = ifoMT * inp.ifoPrice + mdoMT * inp.mdoPrice; // B20
  const portChg    = inp.loadPChgB + inp.disPChgB + inp.awripB;   // B21 (B15=B17=B18=0)
  const revenue    = inp.frtRate * inp.intankMT;                  // B22
  const timeCost   = revenue - portChg - bunkerCost;              // B19
  const totalCost  = revenue;                                      // B22 = total cost on this side
  const ratePerDay = timeCost / totalDays;                         // B6

  return {
    frtRatePerMT: inp.frtRate,
    totalFreight: revenue,
    blstDays, ladnDays, voyageDays, portDaysSea: portDaysFactors, totalDays,
    ifoMT, mdoMT, bunkerCost, portChg, timeCost, totalCost,
    ratePerDay,
    tce: ratePerDay,
    tcePlusBunk: ratePerDay + inp.portIFO * inp.ifoPrice,
    tcMonthly: ratePerDay * 30.4166666666,
  };
}

// ─── Route D (MAA → Ningbo + Caojing) ────────────────────────────────────────

function calcD(inp, bResults) {
  const sm = inp.seaMargin;

  // D33/D34 use sea_margin but NOT the extra *1.05
  const blstDays = (inp.milesBallastD * (1 + sm)) / inp.spdBlst / 24;
  const ladnDays = (inp.milesLadenD * (1 + sm)) / inp.spdLadn / 24;
  const voyageDays = blstDays + ladnDays;

  // D36=0.5, D37=2, D38=daysDischD, D39=0.5  (D40=D41=0)
  const portDaysFactors = 0.5 + 2 + inp.daysDischD + 0.5;
  const totalDays = voyageDays + portDaysFactors;

  const ifoMT = inp.blstIFO * blstDays + inp.ladnIFO * ladnDays + portDaysFactors * inp.portIFO;
  const mdoMT = inp.seaMDO * voyageDays + inp.portMDO * portDaysFactors;

  const bunkerCost = ifoMT * inp.ifoPrice + mdoMT * inp.mdoPrice; // D20
  const portChg    = inp.loadPChgD + inp.disPChgD;                // D21 (D15=0)

  // Back-calculation: hold TCE = benchmark, solve for total earnings on this route
  const timeCost     = Math.round(bResults.ratePerDay * totalDays * 100) / 100; // D19 = ROUND(D6*D43,2)
  const totalCost    = timeCost + bunkerCost + portChg;                          // D22 — total gross earnings
  const frtRatePerMT = Math.round((totalCost / inp.intankMT) * 100) / 100;       // D3

  return {
    frtRatePerMT,
    totalFreight: totalCost,
    blstDays, ladnDays, voyageDays, portDaysFactors, totalDays,
    ifoMT, mdoMT, bunkerCost, portChg, timeCost, totalCost,
    ratePerDay: bResults.ratePerDay,
    tce: bResults.ratePerDay,
    tcePlusBunk: bResults.ratePerDay + inp.portIFO * inp.ifoPrice,
  };
}

// ─── India routes (G, I, K, M, O, Q, S, U, W) ───────────────────────────────
// Formula: G3 = (TCE*G43 + non-commission costs) / 96.025%
// G18 = G3 * 3.975%  (commission included via divide by 96.025%)

const INDIA_ROUTE_CONFIG = [
  {
    id: 'G', origin: 'Ruwais', dest: 'NMG + Haldia',
    miles_b: 3282, miles_l: 3328,
    loadPChg: 32000, getDisPChg: (p) => p.portNMG + p.portHald,
    awrip: 40000, norPlus6: 0.75, daysLoading: 2, daysDisch: 10, daysBun: 0,
    intank: 45000,
    seaDaysFactor: 1.05, useSeaMarginVar: false,
    mdo_rate: 'portMDO',   // uses G31
  },
  {
    id: 'I', origin: 'Ruwais', dest: 'NMG + Mumbai',
    miles_b: 1362, miles_l: 2031,
    loadPChg: 32000, getDisPChg: (p) => p.portMumbai + p.portNMG,
    awrip: 40000, norPlus6: 0.75, daysLoading: 2, daysDisch: 10, daysBun: 0,
    intank: 45000,
    seaDaysFactor: 1.05, useSeaMarginVar: false,
    mdo_rate: 'portMDO',
  },
  {
    id: 'K', origin: 'MAA', dest: 'Vizag + Haldia',
    miles_b: 3487, miles_l: 3580,
    loadPChg: 12000, getDisPChg: (p) => p.portViz + p.portHald,
    awrip: 40000, norPlus6: 0.75, daysLoading: 2, daysDisch: 11, daysBun: 0,
    intank: 45000,
    seaDaysFactor: 1.05, useSeaMarginVar: false,
    mdo_rate: 'idleMDO',   // uses K32
  },
  {
    id: 'M', origin: 'Ruwais', dest: 'STS Haldia + Haldia',
    miles_b: 3282, miles_l: 3283,
    loadPChg: 32000, getDisPChg: (p) => p.portHald + p.portHaldSTS,
    awrip: 40000, norPlus6: 0.75, daysLoading: 2, daysDisch: 10, daysBun: 0,
    intank: 45000,
    seaDaysFactor: 1.05, useSeaMarginVar: false,
    mdo_rate: 'idleMDO',
  },
  {
    id: 'O', origin: 'Ruwais', dest: 'New Mangalore',
    miles_b: 1612, miles_l: 1620,
    loadPChg: 32000, getDisPChg: (p) => p.portNMG,
    awrip: 40000, norPlus6: 0.75, daysLoading: 2, daysDisch: 10, daysBun: 0,
    intank: 45000,
    seaDaysFactor: 1.05, useSeaMarginVar: false,
    mdo_rate: 'idleMDO',
  },
  {
    id: 'Q', origin: 'Ruwais', dest: 'NMG + Dahej',
    miles_b: 1306, miles_l: 2221,
    loadPChg: 32000, getDisPChg: (p) => p.portDahej + p.portNMG,
    awrip: 40000, norPlus6: 0.75, daysLoading: 2, daysDisch: 10, daysBun: 0,
    intank: 45000,
    seaDaysFactor: 1.05, useSeaMarginVar: false,
    mdo_rate: 'idleMDO',
  },
  {
    id: 'S', origin: 'Ruwais', dest: 'NMG + Krishnapatnam',
    miles_b: 2764, miles_l: 2809,
    loadPChg: 32000, getDisPChg: (p) => p.portNMG + p.portKrishnapatnam,
    awrip: 40000, norPlus6: 0.75, daysLoading: 2, daysDisch: 10, daysBun: 0,
    intank: 45000,
    seaDaysFactor: 1.05, useSeaMarginVar: false,
    mdo_rate: 'idleMDO',
  },
  {
    id: 'U', origin: 'Ruwais', dest: 'NMG + Vizag + Haldia',
    miles_b: 3486, miles_l: 3633,
    loadPChg: 40000, getDisPChg: (p) => p.portNMG + p.portViz + p.portHald,
    awrip: 40000, norPlus6: 1, daysLoading: 2, daysDisch: 13, daysBun: 0,
    intank: 45000,
    seaDaysFactor: 1.0, useSeaMarginVar: false, // U33 = U11/(U24*24) — no factor
    mdo_rate: 'idleMDO',
  },
  {
    id: 'W', origin: 'Ruwais', dest: 'Haldia STS + Haldia',
    miles_b: 3486, miles_l: 3499,
    loadPChg: 40000, getDisPChg: (p) => p.portHald + 60000, // W14 = Z7+60000
    awrip: 40000, norPlus6: 1, daysLoading: 2, daysDisch: 13, daysBun: 0,
    intank: 45000,
    seaDaysFactor: 1.0, useSeaMarginVar: false, // W33 = W11/(W24*24) — no factor
    mdo_rate: 'idleMDO',
  },
];

function calcIndiaRoute(cfg, inp, bResults) {
  const speed = inp.spdBlst; // G24 = B24

  // Sea days: factor applied differently per route (see original formulas)
  const blstDays = (cfg.miles_b / (speed * 24)) * cfg.seaDaysFactor;
  const ladnDays = (cfg.miles_l / (inp.spdLadn * 24)) * cfg.seaDaysFactor;
  const voyageDays = blstDays + ladnDays; // G35

  // Port days: G36+G37+G38+G39+G40+G41
  const portDaysFactors = cfg.norPlus6 + cfg.daysLoading + cfg.daysDisch + cfg.daysBun;
  const totalDays = voyageDays + portDaysFactors; // G43

  // Bunker IFO: G44 = (G35*G27) + (port_days*G28)
  // Uses voyage_days (not separate ballast/laden) × laden IFO + port_days × port IFO
  const ifoMT = voyageDays * inp.ladnIFO + portDaysFactors * inp.portIFO; // G44

  // Bunker MDO: G45 = SUM(G33:G41)*mdo_rate
  // SUM(G33:G41) = blstDays+ladnDays+voyageDays+norPlus6+daysLoading+daysDisch+daysBun+0+0
  // Note: G35 (voyageDays) is included in the sum, so sea days counted twice — replicating formula exactly
  const mdoSumDays = blstDays + ladnDays + voyageDays + portDaysFactors;
  const mdoRate = cfg.mdo_rate === 'portMDO' ? inp.portMDO : inp.idleMDO;
  const mdoMT = mdoSumDays * mdoRate; // G45

  const bunkerCost = ifoMT * inp.ifoPrice + mdoMT * inp.mdoPrice; // G20
  const disPChg = cfg.getDisPChg(inp);
  const portChg = cfg.loadPChg + disPChg;                         // G21 = G14+G13

  // Back-calculation (original sheet formula): hold TCE = benchmark
  // G3 = (TCE*totalDays + awrip + bunkerCost + portChg) / 0.96025
  const nonCommissionCosts = cfg.awrip + bunkerCost + portChg;
  const tce = bResults.ratePerDay; // G48 = B6
  const totalFreight = (tce * totalDays + nonCommissionCosts) / 0.96025; // G3 — total gross earnings (USD)
  const commission   = totalFreight * 0.03975; // G18
  const totalCost    = cfg.awrip + commission + bunkerCost + portChg; // G22 (= totalFreight by construction)
  const frtRatePerMT = totalFreight / cfg.intank; // implied $/pmt

  return {
    frtRatePerMT,
    totalFreight,
    blstDays, ladnDays, voyageDays, portDaysFactors, totalDays,
    ifoMT, mdoMT, bunkerCost, portChg, commission,
    timeCost: tce * totalDays,
    totalCost,
    ratePerDay: tce,
    tce,
    tcePlusBunk: tce + inp.portIFO * inp.ifoPrice, // G49
  };
}

// ─── Main entry point ────────────────────────────────────────────────────────

export function calculateAll(inputs) {
  const inp = { ...DEFAULT_INPUTS, ...inputs };

  const benchmark = {
    ...calcB(inp),
    id: 'B', origin: 'Ras Tanura', dest: 'Chiba', group: 'BENCHMARK',
  };
  const routeD = {
    ...calcD(inp, benchmark),
    id: 'D', origin: 'MAA', dest: 'Ningbo + Caojing', group: 'MAA',
  };
  const others = INDIA_ROUTE_CONFIG.map((cfg) => ({
    ...calcIndiaRoute(cfg, inp, benchmark),
    id: cfg.id,
    origin: cfg.origin,
    dest: cfg.dest,
    group: cfg.origin === 'MAA' ? 'MAA' : 'RUWAIS',
  }));

  return {
    benchmark,
    maaRoutes: [routeD, ...others.filter((r) => r.group === 'MAA')],
    ruwaisRoutes: others.filter((r) => r.group === 'RUWAIS'),
    all: [benchmark, routeD, ...others],
  };
}

export { INDIA_ROUTE_CONFIG };
