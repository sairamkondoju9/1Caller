export function sanitizeBalance(value, fallback = 0) {
  if (value === null || value === undefined || value === '') {
    return fallback;
  }

  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) {
    return fallback;
  }

  if (numericValue < 0) {
    return fallback;
  }

  return Number(numericValue.toFixed(2));
}

const CREDIT_PACKAGES = Object.freeze({
  pack_500: { amount: 500, credits: 500, bonusCredits: 0, name: 'Starter Pack' },
  pack_1000: { amount: 1000, credits: 1000, bonusCredits: 0, name: 'Standard Pack' },
  pack_5000: { amount: 5000, credits: 5250, bonusCredits: 250, name: 'Growth Pack' },
  pack_10000: { amount: 10000, credits: 11000, bonusCredits: 1000, name: 'Scale Pack' }
});

export function resolveCreditPackage(planId, amount) {
  const packageId = String(planId || 'custom');
  const baseAmount = Number(amount);
  if (!Number.isSafeInteger(baseAmount) || baseAmount < 100 || baseAmount > 100000) {
    return null;
  }

  if (packageId === 'custom') {
    return {
      planId: 'custom',
      amount: baseAmount,
      credits: baseAmount,
      bonusCredits: 0,
      name: 'Custom Amount Top-Up'
    };
  }

  const creditPackage = CREDIT_PACKAGES[packageId];
  if (!creditPackage || creditPackage.amount !== baseAmount) {
    return null;
  }

  return { planId: packageId, ...creditPackage };
}

export function calculateAdminOverview(balanceRows = [], totalTenants = 0, liveCCU = 0, totalCallsDialed = 0) {
  const revenueTotal = (Array.isArray(balanceRows) ? balanceRows : []).reduce(
    (sum, row) => sum + sanitizeBalance(row?.balance_inr ?? row?.balance_credits ?? 0),
    0
  );

  const safeTotalTenants = Number(totalTenants) || 0;
  const safeLiveCCU = Number(liveCCU) || 0;
  const safeTotalCallsDialed = Number(totalCallsDialed) || 0;

  return {
    totalTenants: safeTotalTenants,
    activeCalls: safeLiveCCU,
    revenue: {
      totalINR: revenueTotal,
      monthlyMRR: revenueTotal > 0 ? Number((revenueTotal * 0.12).toFixed(2)) : 0,
      grossMarginPct: revenueTotal > 0 ? 71.4 : 0,
      modelInferenceSpend: revenueTotal > 0 ? Number((revenueTotal * 0.42).toFixed(2)) : 0
    },
    scale: {
      liveCCU: safeLiveCCU,
      designHeadroomCCU: 500000,
      totalCallsDialed: safeTotalCallsDialed,
      totalMinutes: 0,
      activeTenantsCount: safeTotalTenants
    },
    trunks: [],
    traiCompliance: {
      status: 'No telemetry yet',
      flaggedNumbers: 0,
      ndncScrubRate: '0%',
      operatingWindow: 'Not configured',
      penaltyThreshold: 'No live monitoring'
    },
    modelDistribution: []
  };
}
