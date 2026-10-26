import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import jwt from 'jsonwebtoken';

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const testDbDir = path.join(currentDir, '..', 'data', 'workflow-load-test');
const testDbPath = path.join(testDbDir, 'sarvam.db');

process.env.NODE_ENV = 'test';
delete process.env.VERCEL;
process.env.JWT_SECRET = 'local-workflow-load-test-secret';
process.env.SARVAM_DB_PATH = testDbPath;
process.env.TURSO_DATABASE_URL = '';
process.env.TURSO_AUTH_TOKEN = '';
process.env.GOOGLE_CLIENT_ID = '';
process.env.RAZORPAY_KEY_ID = '';
process.env.RAZORPAY_KEY_SECRET = '';

let appServer;
let testDb;

test('1,000 authenticated read requests complete locally without provider side effects', async () => {
  fs.mkdirSync(testDbDir, { recursive: true });
  ({ db: testDb } = await import('./db.js'));
  const { server } = await import('./server.js');
  appServer = server;
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolve);
  });
  const baseUrl = `http://127.0.0.1:${server.address().port}`;
  const tenantId = 'load_test_tenant';
  testDb.prepare('INSERT INTO tenants (id, name, email) VALUES (?, ?, ?)').run(tenantId, 'Load Test Workspace', 'load@example.test');
  testDb.prepare('INSERT INTO billing (id, tenant_id, balance_credits, balance_inr) VALUES (?, ?, 0, 0)').run('b_load_test', tenantId);
  testDb.prepare('INSERT INTO employees (id, tenant_id, name, type, primary_language, voice, status) VALUES (?, ?, ?, ?, ?, ?, ?)')
    .run('load_test_employee', tenantId, 'Load Test Agent', 'instant_lead', 'en', 'E01', 'ready');
  testDb.prepare('INSERT INTO leads (id, tenant_id, name, phone) VALUES (?, ?, ?, ?)')
    .run('load_test_lead', tenantId, 'Synthetic Contact', '+14155550100');
  const token = jwt.sign({ id: 'load_test_user', email: 'load@example.test', role: 'client', tenant_id: tenantId }, process.env.JWT_SECRET);
  const routes = ['/api/stats', '/api/employees', '/api/campaigns', '/api/leads', '/api/calls', '/api/dashboard-summary', '/api/performance'];
  const totalRequests = 1000;
  const batchSize = 100;
  const latencies = [];
  let completed = 0;
  let failed = 0;

  for (let offset = 0; offset < totalRequests; offset += batchSize) {
    const batch = Array.from({ length: Math.min(batchSize, totalRequests - offset) }, async (_, index) => {
      const route = routes[(offset + index) % routes.length];
      const start = performance.now();
      try {
        const response = await fetch(`${baseUrl}${route}`, { headers: { authorization: `Bearer ${token}` } });
        await response.arrayBuffer();
        latencies.push(performance.now() - start);
        if (!response.ok) failed += 1;
        else completed += 1;
      } catch {
        failed += 1;
      }
    });
    await Promise.all(batch);
  }

  latencies.sort((a, b) => a - b);
  const p95Ms = latencies[Math.max(0, Math.ceil(latencies.length * 0.95) - 1)] || 0;
  console.log(JSON.stringify({ target: 'isolated local SQLite only', requests: totalRequests, completed, failed, p95Ms: Number(p95Ms.toFixed(1)) }));
  assert.equal(completed, totalRequests, 'all local authenticated read requests should return 2xx');
  assert.equal(failed, 0);
  assert.ok(Number.isFinite(p95Ms));
});

test.after(async () => {
  if (appServer?.listening) await new Promise(resolve => appServer.close(resolve));
  testDb?.close();
  if (fs.existsSync(testDbDir)) fs.rmSync(testDbDir, { recursive: true, force: true });
  delete process.env.SARVAM_DB_PATH;
});
