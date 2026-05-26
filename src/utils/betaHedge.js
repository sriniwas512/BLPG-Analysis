import { calculateAll } from './calculations.js';

/**
 * Finite-difference beta: "if BLPG benchmark freight moves $1/pmt,
 * how much does this route's model parity freight move?"
 *
 * Also computes the closed-form analytical beta for verification.
 */
export function calculateRouteBetas(inputs, routeConfigs) {
  const commission = inputs.commission ?? 3.975;
  if (commission >= 100) return null;
  if (!inputs.frtRate || inputs.frtRate === 0) return null;
  if (!inputs.intankMT || inputs.intankMT === 0) return null;

  const base    = calculateAll(inputs, routeConfigs);
  const shocked = calculateAll({ ...inputs, frtRate: inputs.frtRate + 1 }, routeConfigs);
  const bm      = base.benchmark;
  const bmS     = shocked.benchmark;

  if (!bm.totalDays || bm.totalDays === 0) return null;

  const netFactor = 1 - commission / 100;
  // bm.totalFreight = frtRate × intankMT  →  benchmarkCargoMT = intankMT
  const benchmarkCargoMT = bm.totalFreight / inputs.frtRate;

  const routes = base.ruwaisRoutes.map((route) => {
    if (!route.intank || route.intank === 0) return { ...route, error: 'zero_cargo' };

    const shockedRoute = shocked.ruwaisRoutes.find((r) => r.id === route.id);
    if (!shockedRoute) return { ...route, error: 'no_shocked_route' };

    // Finite difference (official)
    const finiteBeta = shockedRoute.frtRatePerMT - route.frtRatePerMT;

    // Analytical closed-form:
    //   dTCE/d(frtRate)       = benchmarkCargoMT / benchmarkTotalDays
    //   d(routeFrt)/d(TCE)    = routeTotalDays / (netFactor × routeCargoMT)
    const analyticalBeta =
      (benchmarkCargoMT / bm.totalDays) *
      (route.totalDays / (netFactor * route.intank));

    const betaDiff     = Math.abs(finiteBeta - analyticalBeta);
    const betaMismatch = betaDiff > 0.01;
    const beta         = finiteBeta;

    const hedgeMT = route.intank * beta;

    const warnings = [];
    if (beta < 0 || beta > 2) warnings.push('beta_out_of_range');
    if (betaMismatch)          warnings.push('beta_mismatch');

    return {
      ...route,
      finiteBeta,
      analyticalBeta,
      betaDiff,
      betaMismatch,
      beta,
      hedgeMT,
      hedgeRounded500:  Math.round(hedgeMT / 500)  * 500,
      hedgeRounded1000: Math.round(hedgeMT / 1000) * 1000,
      residualMT:          route.intank - hedgeMT,
      shockedFrtRatePerMT: shockedRoute.frtRatePerMT,
      benchmarkCargoMT,
      warnings,
    };
  });

  return { base, shocked, routes, benchmark: bm, shockedBenchmark: bmS, netFactor, benchmarkCargoMT };
}
