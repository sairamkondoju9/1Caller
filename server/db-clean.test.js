import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const testDataDir = path.join(__dirname, '..', 'data', 'test-temp');
let activeDb;
let dbPath;

function prepareTestDatabase() {
  fs.mkdirSync(testDataDir, { recursive: true });
  dbPath = path.join(testDataDir, `sarvam-${Date.now()}.db`);
  process.env.SARVAM_DB_PATH = dbPath;
}

function cleanupTestDatabase() {
  if (activeDb && typeof activeDb.close === 'function') {
    activeDb.close();
  }
  if (dbPath && fs.existsSync(dbPath)) {
    fs.rmSync(dbPath, { force: true });
  }
  delete process.env.SARVAM_DB_PATH;
  if (fs.existsSync(testDataDir)) {
    fs.rmSync(testDataDir, { recursive: true, force: true });
  }
}

test('production mode removes stale demo records from the database', async () => {
  delete process.env.ENABLE_DEMO_DATA;
  prepareTestDatabase();

  try {
    const { initDatabase, db } = await import('./db.js');
    activeDb = db;
    dbPath = process.env.SARVAM_DB_PATH;
    initDatabase();

    activeDb.prepare('INSERT OR REPLACE INTO tenants (id, name, email, dlt_entity_id, plan, status) VALUES (?, ?, ?, ?, ?, ?)')
      .run('demo_seed', 'Demo tenant', 'demo@example.com', 'DLT-DEMO-1', 'growth', 'active');

    activeDb.prepare('INSERT OR REPLACE INTO billing (id, tenant_id, balance_credits, balance_inr, rate_standard, rate_premium, rate_enterprise) VALUES (?, ?, ?, ?, ?, ?, ?)')
      .run('b_demo_seed', 'demo_seed', 9000, 9000, 5.00, 6.80, 3.60);

    activeDb.prepare(`
      INSERT OR REPLACE INTO calls (id, tenant_id, employee_id, employee_name, contact_name, phone, direction, channel, status, outcome, sentiment, badge, captured, duration_seconds, cost, speed_to_lead, summary, p50_ms, p95_ms, carrier, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      'call_demo_seed',
      'demo_seed',
      'emp_demo_seed',
      'Demo Agent',
      'Jane Customer',
      '+91 90000 00001',
      'outbound',
      'Instant',
      'completed',
      'Qualified',
      'positive',
      'Demo',
      JSON.stringify({ source: 'demo' }),
      120,
      25,
      '0.9s',
      'Demo summary',
      420,
      720,
      'Demo Carrier',
      new Date().toISOString()
    );

    initDatabase();

    const remainingTenant = activeDb.prepare('SELECT COUNT(*) as count FROM tenants WHERE id = ?').get('demo_seed');
    const remainingBilling = activeDb.prepare('SELECT COUNT(*) as count FROM billing WHERE tenant_id = ?').get('demo_seed');
    const remainingCalls = activeDb.prepare('SELECT COUNT(*) as count FROM calls WHERE tenant_id = ?').get('demo_seed');

    assert.equal(remainingTenant.count, 0, 'demo tenants should be cleaned from production mode');
    assert.equal(remainingBilling.count, 0, 'demo billing should be cleaned from production mode');
    assert.equal(remainingCalls.count, 0, 'demo calls should be cleaned from production mode');
  } finally {
    cleanupTestDatabase();
  }
});
