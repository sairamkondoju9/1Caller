import test from 'node:test';
import assert from 'node:assert/strict';

import { calculateAdminOverview, resolveCreditPackage, sanitizeBalance } from './financialGuard.js';

test('admin overview derives revenue from actual balances instead of marketing constants', () => {
  const overview = calculateAdminOverview(
    [{ balance_inr: 1200 }, { balance_inr: 800 }, { balance_inr: 0 }],
    3,
    10,
    42
  );

  assert.equal(overview.revenue.totalINR, 2000);
  assert.equal(overview.scale.totalCallsDialed, 42);
  assert.equal(overview.totalTenants, 3);
});

test('financial values default to zero instead of fake demo balances', () => {
  assert.equal(sanitizeBalance(undefined), 0);
  assert.equal(sanitizeBalance(null), 0);
  assert.equal(sanitizeBalance('2450'), 2450);
  assert.equal(sanitizeBalance(-50), 0);
});

test('credit packages are resolved from server-owned prices and quantities', () => {
  assert.deepEqual(resolveCreditPackage('pack_5000', 5000), {
    planId: 'pack_5000',
    amount: 5000,
    credits: 5250,
    bonusCredits: 250,
    name: 'Growth Pack'
  });
  assert.deepEqual(resolveCreditPackage('custom', 100), {
    planId: 'custom',
    amount: 100,
    credits: 100,
    bonusCredits: 0,
    name: 'Custom Amount Top-Up'
  });
  assert.equal(resolveCreditPackage('pack_5000', 100), null);
  assert.equal(resolveCreditPackage('unknown', 5000), null);
  assert.equal(resolveCreditPackage('custom', 99), null);
  assert.equal(resolveCreditPackage('custom', 100.5), null);
});
