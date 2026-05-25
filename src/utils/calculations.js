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

// ─── Distance matrix ─────────────────────────────────────────────────────────

export const DISTANCE_PORTS = ['Ruwais', 'NMG', 'Haldia', 'Mumbai', 'Dahej', 'Krishnapatnam', 'Vizag', 'MAA'];

export const PORT_SHORT = {
  Ruwais: 'RUW', NMG: 'NMG', Haldia: 'HLD', Mumbai: 'MUM',
  Dahej: 'DAH', Krishnapatnam: 'KRS', Vizag: 'VIZ', MAA: 'MAA',
};

// Maps a DISTANCE_PORTS name → the corresponding inp key for port charges
export const PORT_CHARGE_KEY = {
  NMG: 'portNMG', Haldia: 'portHald', Mumbai: 'portMumbai',
  Dahej: 'portDahej', Krishnapatnam: 'portKrishnapatnam', Vizag: 'portViz',
};

// Reverse: inp key → port name (for deriving sequence from namedDisPorts)
export const CHARGE_KEY_TO_PORT = Object.fromEntries(
  Object.entries(PORT_CHARGE_KEY).map(([p, k]) => [k, p])
);

export const DEFAULT_DISTANCE_MATRIX = {
  Ruwais:        { Ruwais: 0,       NMG: 1581.81, Haldia: 3205.43, Mumbai: 1284.19, Dahej: 1264.61, Krishnapatnam: 2734.85, Vizag: 2887.65, MAA: 403.55  },
  NMG:           { Ruwais: 1581.81, NMG: 0,       Haldia: 1654,    Mumbai: 418.89,  Dahej: 572.18,  Krishnapatnam: 1217.95, Vizag: 1406.55, MAA: 1803.06 },
  Haldia:        { Ruwais: 3205.43, NMG: 1654,    Haldia: 0,       Mumbai: 2033.86, Dahej: 2231,    Krishnapatnam: 653.26,  Vizag: 381.84,  MAA: 3426.67 },
  Mumbai:        { Ruwais: 1284.19, NMG: 418.89,  Haldia: 2033.86, Mumbai: 0,       Dahej: 170.27,  Krishnapatnam: 1585.18, Vizag: 1773.78, MAA: 1505.44 },
  Dahej:         { Ruwais: 1264.61, NMG: 572.18,  Haldia: 2231,    Mumbai: 170.27,  Dahej: 0,       Krishnapatnam: 1738.47, Vizag: 1927.08, MAA: 1485.86 },
  Krishnapatnam: { Ruwais: 2734.85, NMG: 1217.95, Haldia: 653.26,  Mumbai: 1585.18, Dahej: 1738.47, Krishnapatnam: 0,       Vizag: 282.31,  MAA: 2956.1  },
  Vizag:         { Ruwais: 2887.65, NMG: 1406.55, Haldia: 381.84,  Mumbai: 1773.78, Dahej: 1927.08, Krishnapatnam: 282.31,  Vizag: 0,       MAA: 3108.9  },
  MAA:           { Ruwais: 403.55,  NMG: 1803.06, Haldia: 3426.67, Mumbai: 1505.44, Dahej: 1485.86, Krishnapatnam: 2956.1,  Vizag: 3108.9,  MAA: 0       },
};

// namedDisPorts: keys from inp whose values are summed to give disport charge
// fixedDisPChgExtra: added on top of named ports (e.g. W's +60000)
// disPChgOverride: if non-null, overrides named ports entirely (used for custom routes)

export const DEFAULT_ROUTE_CONFIGS = [
  {
    id: 'G', origin: 'Ruwais', dest: 'NMG + Haldia',
    miles_b: 3282, miles_l: 3328,
    loadPChg: 32000, namedDisPorts: ['portNMG', 'portHald'], fixedDisPChgExtra: 0, disPChgOverride: null,
    awrip: 40000, norPlus6: 0.75, daysLoading: 2, daysDisch: 10, daysBun: 0,
    intank: 45000, seaDaysFactor: 1.05, mdo_rate: 'portMDO', isBuiltin: true,
  },
  {
    id: 'I', origin: 'Ruwais', dest: 'NMG + Mumbai',
    miles_b: 1362, miles_l: 2031,
    loadPChg: 32000, namedDisPorts: ['portMumbai', 'portNMG'], fixedDisPChgExtra: 0, disPChgOverride: null,
    awrip: 40000, norPlus6: 0.75, daysLoading: 2, daysDisch: 10, daysBun: 0,
    intank: 45000, seaDaysFactor: 1.05, mdo_rate: 'portMDO', isBuiltin: true,
  },
  {
    id: 'K', origin: 'MAA', dest: 'Vizag + Haldia',
    miles_b: 3487, miles_l: 3580,
    loadPChg: 12000, namedDisPorts: ['portViz', 'portHald'], fixedDisPChgExtra: 0, disPChgOverride: null,
    awrip: 40000, norPlus6: 0.75, daysLoading: 2, daysDisch: 11, daysBun: 0,
    intank: 45000, seaDaysFactor: 1.05, mdo_rate: 'idleMDO', isBuiltin: true,
  },
  {
    id: 'M', origin: 'Ruwais', dest: 'STS Haldia + Haldia',
    miles_b: 3282, miles_l: 3283,
    loadPChg: 32000, namedDisPorts: ['portHald', 'portHaldSTS'], fixedDisPChgExtra: 0, disPChgOverride: null,
    awrip: 40000, norPlus6: 0.75, daysLoading: 2, daysDisch: 10, daysBun: 0,
    intank: 45000, seaDaysFactor: 1.05, mdo_rate: 'idleMDO', isBuiltin: true,
  },
  {
    id: 'O', origin: 'Ruwais', dest: 'New Mangalore',
    miles_b: 1612, miles_l: 1620,
    loadPChg: 32000, namedDisPorts: ['portNMG'], fixedDisPChgExtra: 0, disPChgOverride: null,
    awrip: 40000, norPlus6: 0.75, daysLoading: 2, daysDisch: 10, daysBun: 0,
    intank: 45000, seaDaysFactor: 1.05, mdo_rate: 'idleMDO', isBuiltin: true,
  },
  {
    id: 'Q', origin: 'Ruwais', dest: 'NMG + Dahej',
    miles_b: 1306, miles_l: 2221,
    loadPChg: 32000, namedDisPorts: ['portDahej', 'portNMG'], fixedDisPChgExtra: 0, disPChgOverride: null,
    awrip: 40000, norPlus6: 0.75, daysLoading: 2, daysDisch: 10, daysBun: 0,
    intank: 45000, seaDaysFactor: 1.05, mdo_rate: 'idleMDO', isBuiltin: true,
  },
  {
    id: 'S', origin: 'Ruwais', dest: 'NMG + Krishnapatnam',
    miles_b: 2764, miles_l: 2809,
    loadPChg: 32000, namedDisPorts: ['portNMG', 'portKrishnapatnam'], fixedDisPChgExtra: 0, disPChgOverride: null,
    awrip: 40000, norPlus6: 0.75, daysLoading: 2, daysDisch: 10, daysBun: 0,
    intank: 45000, seaDaysFactor: 1.05, mdo_rate: 'idleMDO', isBuiltin: true,
  },
  {
    id: 'U', origin: 'Ruwais', dest: 'NMG + Vizag + Haldia',
    miles_b: 3486, miles_l: 3633,
    loadPChg: 40000, namedDisPorts: ['portNMG', 'portViz', 'portHald'], fixedDisPChgExtra: 0, disPChgOverride: null,
    awrip: 40000, norPlus6: 1, daysLoading: 2, daysDisch: 13, daysBun: 0,
    intank: 45000, seaDaysFactor: 1.0, mdo_rate: 'idleMDO', isBuiltin: true,
  },
  {
    id: 'W', origin: 'Ruwais', dest: 'Haldia STS + Haldia',
    miles_b: 3486, miles_l: 3499,
    loadPChg: 40000, namedDisPorts: ['portHald'], fixedDisPChgExtra: 60000, disPChgOverride: null,
    awrip: 40000, norPlus6: 1, daysLoading: 2, daysDisch: 13, daysBun: 0,
    intank: 45000, seaDaysFactor: 1.0, mdo_rate: 'idleMDO', isBuiltin: true,
  },
];

function computeDisPChg(cfg, inp) {
  if (cfg.disPChgOverride != null) return cfg.disPChgOverride;
  const named = (cfg.namedDisPorts || []).reduce((s, k) => s + (inp[k] || 0), 0);
  return named + (cfg.fixedDisPChgExtra || 0);
}

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
  const portChg    = inp.loadPChgB + inp.disPChgB + inp.awripB;   // B21
  const revenue    = inp.frtRate * inp.intankMT;                  // B22
  const timeCost   = revenue - portChg - bunkerCost;              // B19
  const totalCost  = revenue;
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

  const blstDays = (inp.milesBallastD * (1 + sm)) / inp.spdBlst / 24;
  const ladnDays = (inp.milesLadenD * (1 + sm)) / inp.spdLadn / 24;
  const voyageDays = blstDays + ladnDays;

  const portDaysFactors = 0.5 + 2 + inp.daysDischD + 0.5;
  const totalDays = voyageDays + portDaysFactors;

  const ifoMT = inp.blstIFO * blstDays + inp.ladnIFO * ladnDays + portDaysFactors * inp.portIFO;
  const mdoMT = inp.seaMDO * voyageDays + inp.portMDO * portDaysFactors;

  const bunkerCost = ifoMT * inp.ifoPrice + mdoMT * inp.mdoPrice;
  const portChg    = inp.loadPChgD + inp.disPChgD;

  const timeCost     = Math.round(bResults.ratePerDay * totalDays * 100) / 100; // D19 = ROUND(D6*D43,2)
  const totalCost    = timeCost + bunkerCost + portChg;
  const frtRatePerMT = Math.round((totalCost / inp.intankMT) * 100) / 100;

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

// ─── India routes (dynamic config) ───────────────────────────────────────────

function calcIndiaRoute(cfg, inp, bResults) {
  const speed = inp.spdBlst;

  const blstDays = (cfg.miles_b / (speed * 24)) * cfg.seaDaysFactor;
  const ladnDays = (cfg.miles_l / (inp.spdLadn * 24)) * cfg.seaDaysFactor;
  const voyageDays = blstDays + ladnDays;

  const portDaysFactors = cfg.norPlus6 + cfg.daysLoading + cfg.daysDisch + cfg.daysBun;
  const totalDays = voyageDays + portDaysFactors;

  const ifoMT = voyageDays * inp.ladnIFO + portDaysFactors * inp.portIFO;
  const mdoSumDays = blstDays + ladnDays + voyageDays + portDaysFactors;
  const mdoRate = cfg.mdo_rate === 'portMDO' ? inp.portMDO : inp.idleMDO;
  const mdoMT = mdoSumDays * mdoRate;

  const bunkerCost = ifoMT * inp.ifoPrice + mdoMT * inp.mdoPrice;
  const disPChg    = computeDisPChg(cfg, inp);
  const portChg    = cfg.loadPChg + disPChg;

  const nonCommissionCosts = cfg.awrip + bunkerCost + portChg;
  const tce          = bResults.ratePerDay;
  const totalFreight = (tce * totalDays + nonCommissionCosts) / 0.96025;
  const commission   = totalFreight * 0.03975;
  const totalCost    = cfg.awrip + commission + bunkerCost + portChg;
  const frtRatePerMT = totalFreight / cfg.intank;

  return {
    frtRatePerMT,
    totalFreight,
    blstDays, ladnDays, voyageDays, portDaysFactors, totalDays,
    ifoMT, mdoMT, bunkerCost, disPChg, portChg, commission,
    timeCost: tce * totalDays,
    totalCost,
    ratePerDay: tce,
    tce,
    tcePlusBunk: tce + inp.portIFO * inp.ifoPrice,
  };
}

// ─── Main entry point ────────────────────────────────────────────────────────

export function calculateAll(inputs, routeConfigs = DEFAULT_ROUTE_CONFIGS) {
  const inp = { ...DEFAULT_INPUTS, ...inputs };

  const benchmark = {
    ...calcB(inp),
    id: 'B', origin: 'Ras Tanura', dest: 'Chiba', group: 'BENCHMARK',
  };
  const routeD = {
    ...calcD(inp, benchmark),
    id: 'D', origin: 'MAA', dest: 'Ningbo + Caojing', group: 'MAA',
  };

  const others = routeConfigs.map((cfg) => ({
    ...calcIndiaRoute(cfg, inp, benchmark),
    // identity + group
    id: cfg.id,
    origin: cfg.origin,
    dest: cfg.dest,
    group: cfg.origin === 'MAA' ? 'MAA' : 'RUWAIS',
    isBuiltin: cfg.isBuiltin,
    // pass config fields through for the inline edit form
    miles_b: cfg.miles_b,
    miles_l: cfg.miles_l,
    intank: cfg.intank,
    daysDisch: cfg.daysDisch,
    norPlus6: cfg.norPlus6,
    daysLoading: cfg.daysLoading,
    daysBun: cfg.daysBun,
    seaDaysFactor: cfg.seaDaysFactor,
    mdo_rate: cfg.mdo_rate,
    awrip: cfg.awrip,
    loadPChgVal: cfg.loadPChg,
    disPChgOverride: cfg.disPChgOverride,
    namedDisPorts: cfg.namedDisPorts,
    fixedDisPChgExtra: cfg.fixedDisPChgExtra,
  }));

  return {
    benchmark,
    maaRoutes: [routeD, ...others.filter((r) => r.group === 'MAA')],
    ruwaisRoutes: others.filter((r) => r.group === 'RUWAIS'),
    all: [benchmark, routeD, ...others],
  };
}
