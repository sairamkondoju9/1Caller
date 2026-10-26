import test from 'node:test';
import assert from 'node:assert/strict';

import { calculateAdminOverview, sanitizeBalance } from './financialGuard.js';

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
