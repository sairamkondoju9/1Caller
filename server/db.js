import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@libsql/client';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataDir = process.env.VERCEL
  ? path.join('/tmp', 'data')
  : path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = process.env.SARVAM_DB_PATH || path.join(dataDir, 'sarvam.db');
export const db = new DatabaseSync(dbPath);
const shouldSeedDemoData = process.env.ENABLE_DEMO_DATA === 'true';

function purgeKnownDemoData() {
  if (shouldSeedDemoData) return;

  const demoTenantIds = ['tenant_2', 'tenant_3', 'tenant_4', 'tenant_5', 'tenant_demo', 'demo_seed'];
  const demoEmployeeIds = ['emp-jagan', 'emp-bhuvana', 'emp-lakshmi', 'emp-ananya', 'emp_demo_1'];
  const demoBillingIds = ['b_tenant_2', 'b_tenant_3', 'b_tenant_4', 'b_tenant_5', 'b_tenant_demo', 'b_demo_seed'];
  const demoCallIds = ['call_0537e41c', 'call_8243302c', 'call_6fc9d161', 'call_demo_1'];

  if (demoTenantIds.length) {
    db.prepare(`DELETE FROM calls WHERE tenant_id IN (${demoTenantIds.map(() => '?').join(',')}) OR employee_id IN (${demoEmployeeIds.map(() => '?').join(',')}) OR id IN (${demoCallIds.map(() => '?').join(',')})`).run(
      ...demoTenantIds,
      ...demoEmployeeIds,
      ...demoCallIds
    );
    db.prepare(`DELETE FROM leads WHERE tenant_id IN (${demoTenantIds.map(() => '?').join(',')})`).run(...demoTenantIds);
    db.prepare(`DELETE FROM transactions WHERE tenant_id IN (${demoTenantIds.map(() => '?').join(',')})`).run(...demoTenantIds);
    db.prepare(`DELETE FROM knowledge_base WHERE tenant_id IN (${demoTenantIds.map(() => '?').join(',')}) OR employee_id IN (${demoEmployeeIds.map(() => '?').join(',')})`).run(
      ...demoTenantIds,
      ...demoEmployeeIds
    );
    db.prepare(`DELETE FROM dnc_registry WHERE tenant_id IN (${demoTenantIds.map(() => '?').join(',')}) OR id = ?`).run(...demoTenantIds, 'dnd-1');
    db.prepare(`DELETE FROM phone_numbers WHERE tenant_id IN (${demoTenantIds.map(() => '?').join(',')}) OR id IN (?, ?, ?, ?, ?, ?)`).run(
      ...demoTenantIds,
      'num_sarvam_live_1',
      'num_demo_1',
      'num_demo_2',
      'num_demo_3',
      'num_demo_4',
      'num_demo_5'
    );
    db.prepare(`DELETE FROM employees WHERE tenant_id IN (${demoTenantIds.map(() => '?').join(',')}) OR id IN (${demoEmployeeIds.map(() => '?').join(',')})`).run(
      ...demoTenantIds,
      ...demoEmployeeIds
    );
    db.prepare(`DELETE FROM billing WHERE tenant_id IN (${demoTenantIds.map(() => '?').join(',')}) OR id IN (${demoBillingIds.map(() => '?').join(',')})`).run(
      ...demoTenantIds,
      ...demoBillingIds
    );
    db.prepare(`DELETE FROM tenants WHERE id IN (${demoTenantIds.map(() => '?').join(',')})`).run(...demoTenantIds);
  }
}

export const turso = (process.env.TURSO_DATABASE_URL && process.env.TURSO_AUTH_TOKEN)
  ? createClient({
      url: process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN
    })
  : null;

export function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS tenants (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      dlt_entity_id TEXT,
      plan TEXT DEFAULT 'growth',
      status TEXT DEFAULT 'active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'tenant',
      tenant_id TEXT DEFAULT 'default',
      avatar TEXT,
      google_id TEXT,
      password_hash TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS employees (
      id TEXT PRIMARY KEY,
      tenant_id TEXT DEFAULT 'default',
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      primary_language TEXT NOT NULL,
      voice TEXT NOT NULL,
      industry TEXT,
      opening_greeting TEXT,
      prompt_text TEXT,
      call_steps TEXT,
      variables TEXT,
      p50_slo INTEGER DEFAULT 420,
      status TEXT DEFAULT 'active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS campaigns (
      id TEXT PRIMARY KEY,
      tenant_id TEXT DEFAULT 'default',
      name TEXT NOT NULL,
      employee_id TEXT,
      total_leads INTEGER DEFAULT 0,
      called_leads INTEGER DEFAULT 0,
      qualified_leads INTEGER DEFAULT 0,
      concurrency INTEGER DEFAULT 5,
      pacing_cps REAL DEFAULT 2.5,
      calling_window TEXT DEFAULT '09:00-21:00',
      status TEXT DEFAULT 'ready',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS leads (
      id TEXT PRIMARY KEY,
      tenant_id TEXT DEFAULT 'default',
      campaign_id TEXT,
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      extracted_data TEXT,
      call_duration INTEGER DEFAULT 0,
      last_call_at DATETIME,
      scheduled_callback_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS calls (
      id TEXT PRIMARY KEY,
      tenant_id TEXT DEFAULT 'default',
      employee_id TEXT,
      employee_name TEXT,
      contact_name TEXT,
      phone TEXT NOT NULL,
      direction TEXT DEFAULT 'outbound',
      status TEXT DEFAULT 'completed',
      duration_seconds INTEGER DEFAULT 0,
      sentiment TEXT DEFAULT 'positive',
      qualification TEXT DEFAULT 'qualified',
      transcript TEXT,
      summary TEXT,
      cost REAL DEFAULT 0,
      p50_ms INTEGER DEFAULT 412,
      p95_ms INTEGER DEFAULT 830,
      carrier TEXT DEFAULT 'Exotel Primary',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS turns (
      id TEXT PRIMARY KEY,
      call_id TEXT NOT NULL,
      turn_idx INTEGER NOT NULL,
      role TEXT NOT NULL,
      text TEXT NOT NULL,
      asr_ms INTEGER DEFAULT 38,
      llm_ms INTEGER DEFAULT 115,
      tts_ms INTEGER DEFAULT 78,
      total_ms INTEGER DEFAULT 412,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS phone_numbers (
      id TEXT PRIMARY KEY,
      tenant_id TEXT DEFAULT 'default',
      number TEXT NOT NULL,
      provider TEXT NOT NULL,
      series_type TEXT DEFAULT '140-promotional',
      employee_id TEXT,
      channels INTEGER DEFAULT 1,
      status TEXT DEFAULT 'active',
      is_dlt_registered BOOLEAN DEFAULT 1,
      monthly_cost REAL DEFAULT 649,
      purchased_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS dnc_registry (
      id TEXT PRIMARY KEY,
      tenant_id TEXT DEFAULT 'default',
      phone TEXT NOT NULL,
      reason TEXT DEFAULT 'Customer requested opt-out during call',
      added_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS knowledge_base (
      id TEXT PRIMARY KEY,
      tenant_id TEXT DEFAULT 'default',
      employee_id TEXT,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      category TEXT DEFAULT 'faq',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS llm_usage_logs (
      id TEXT PRIMARY KEY,
      provider TEXT NOT NULL,
      model TEXT NOT NULL,
      latency_ms INTEGER DEFAULT 0,
      cached INTEGER DEFAULT 0,
      prompt_tokens INTEGER DEFAULT 0,
      completion_tokens INTEGER DEFAULT 0,
      status TEXT DEFAULT 'success',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS billing (
      id TEXT PRIMARY KEY,
      tenant_id TEXT DEFAULT 'default',
      balance_credits REAL DEFAULT 50.0,
      balance_inr REAL DEFAULT 50.0,
      rate_standard REAL DEFAULT 5.00,
      rate_premium REAL DEFAULT 6.80,
      rate_enterprise REAL DEFAULT 3.50
    );

    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      tenant_id TEXT DEFAULT 'default',
      type TEXT NOT NULL,
      amount REAL NOT NULL,
      credits REAL NOT NULL,
      description TEXT,
      invoice_id TEXT,
      status TEXT DEFAULT 'success',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT
    );

    CREATE TABLE IF NOT EXISTS tenant_settings (
      tenant_id TEXT NOT NULL,
      key TEXT NOT NULL,
      value TEXT,
      PRIMARY KEY (tenant_id, key)
    );

    CREATE TABLE IF NOT EXISTS payment_orders (
      order_id TEXT PRIMARY KEY,
      tenant_id TEXT NOT NULL,
      amount_paise INTEGER NOT NULL,
      base_amount REAL NOT NULL,
      credits REAL NOT NULL,
      bonus_credits REAL NOT NULL DEFAULT 0,
      plan_id TEXT,
      status TEXT NOT NULL DEFAULT 'created',
      payment_id TEXT UNIQUE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Production High-Concurrency Indexes
    CREATE INDEX IF NOT EXISTS idx_calls_created ON calls(created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_calls_status ON calls(status);
    CREATE INDEX IF NOT EXISTS idx_leads_campaign ON leads(campaign_id, status);
    CREATE INDEX IF NOT EXISTS idx_dnc_phone ON dnc_registry(phone);
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_employees_status ON employees(status);
  `);

  // High-concurrency WAL mode & optimizations for 500k scale
  try { db.exec("PRAGMA journal_mode = WAL;"); } catch (e) {}
  try { db.exec("PRAGMA synchronous = NORMAL;"); } catch (e) {}
  try { db.exec("PRAGMA busy_timeout = 5000;"); } catch (e) {}
  try { db.exec("PRAGMA cache_size = -64000;"); } catch (e) {}
  try { db.exec("PRAGMA temp_store = MEMORY;"); } catch (e) {}
  try { db.exec("PRAGMA mmap_size = 268435456;"); } catch (e) {}

  // Safe migrations for existing SQLite databases
  try { db.exec("ALTER TABLE tenants ADD COLUMN plan TEXT DEFAULT 'growth'"); } catch (e) {}
  try { db.exec("ALTER TABLE tenants ADD COLUMN status TEXT DEFAULT 'active'"); } catch (e) {}
  try { db.exec("ALTER TABLE calls ADD COLUMN outcome TEXT DEFAULT 'completed'"); } catch (e) {}
  try { db.exec("ALTER TABLE calls ADD COLUMN channel TEXT DEFAULT 'Instant'"); } catch (e) {}
  try { db.exec("ALTER TABLE calls ADD COLUMN captured TEXT DEFAULT '{}'"); } catch (e) {}
  try { db.exec("ALTER TABLE calls ADD COLUMN badge TEXT DEFAULT ''"); } catch (e) {}
  try { db.exec("ALTER TABLE calls ADD COLUMN speed_to_lead TEXT DEFAULT '—'"); } catch (e) {}

  purgeKnownDemoData();

  // Initialize seed data if empty
  const userCheck = db.prepare('SELECT COUNT(*) as count FROM users').get();
  if (userCheck.count === 0) {
    db.prepare(`
      INSERT INTO users (id, email, name, role, tenant_id, avatar)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run('usr_owner_1', 'owner@outpero.com', 'Sairam (Platform Owner)', 'owner', 'platform', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop');

    db.prepare(`
      INSERT INTO users (id, email, name, role, tenant_id, avatar)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run('usr_tenant_1', 'sairamkondoju9@gmail.com', 'Sairam Kondoju', 'admin', 'default', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop');
  }

  const tenantCheck = db.prepare('SELECT COUNT(*) as count FROM tenants').get();
  if (tenantCheck.count === 0) {
    db.prepare('INSERT INTO tenants (id, name, email, dlt_entity_id, plan, status) VALUES (?, ?, ?, ?, ?, ?)').run(
      'default', 'Default Workspace', 'team@example.com', 'DLT-DEFAULT', 'growth', 'active'
    );
  }

  const billingCheck = db.prepare('SELECT COUNT(*) as count FROM billing WHERE tenant_id = ?').get('default');
  if (billingCheck.count === 0) {
    db.prepare('INSERT INTO billing (id, tenant_id, balance_credits, balance_inr, rate_standard, rate_premium, rate_enterprise) VALUES (?, ?, ?, ?, ?, ?, ?)').run(
      'b-1',       'default', 0, 0, 5.00, 6.80, 3.50
    );
  }

  // Demo fixtures remain opt-in; production defaults to clean zero-state data.
  if (shouldSeedDemoData) {
    const demoTenantId = 'tenant_demo';
    const demoTenantExists = db.prepare('SELECT id FROM tenants WHERE id = ?').get(demoTenantId);
    if (!demoTenantExists) {
      db.prepare('INSERT INTO tenants (id, name, email, dlt_entity_id, plan, status) VALUES (?, ?, ?, ?, ?, ?)').run(
        demoTenantId, 'Demo Workspace', 'demo@example.com', 'DLT-DEMO', 'growth', 'active'
      );
    }

    const demoBillingExists = db.prepare('SELECT id FROM billing WHERE tenant_id = ?').get(demoTenantId);
    if (!demoBillingExists) {
      db.prepare('INSERT INTO billing (id, tenant_id, balance_credits, balance_inr, rate_standard, rate_premium, rate_enterprise) VALUES (?, ?, ?, ?, ?, ?, ?)').run(
        `b_${demoTenantId}`, demoTenantId, 2500, 2500, 5.00, 6.80, 3.50
      );
    }

    const demoEmployeeExists = db.prepare('SELECT id FROM employees WHERE id = ?').get('emp_demo_1');
    if (!demoEmployeeExists) {
      db.prepare(`
        INSERT INTO employees (id, tenant_id, name, type, primary_language, voice, industry, opening_greeting, prompt_text, call_steps, variables, p50_slo, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        'emp_demo_1',
        demoTenantId,
        'Demo Sales Agent',
        'instant_lead',
        'en',
        'P01 Warm Female',
        'General business',
        'Hello! I am your demo sales agent.',
        'Demo workflow for testing the UI and call flow.',
        JSON.stringify(['Greet the customer', 'Qualify interest', 'Book a callback']),
        JSON.stringify(['budget', 'interest']),
        420,
        'ready'
      );
    }

    const demoCallExists = db.prepare('SELECT id FROM calls WHERE id = ?').get('call_demo_1');
    if (!demoCallExists) {
      db.prepare(`
        INSERT INTO calls (id, tenant_id, employee_id, employee_name, contact_name, phone, direction, channel, status, outcome, sentiment, badge, captured, duration_seconds, cost, speed_to_lead, summary, p50_ms, p95_ms, carrier, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        'call_demo_1',
        demoTenantId,
        'emp_demo_1',
        'Demo Sales Agent',
        'Jane Customer',
        '+91 90000 00001',
        'outbound',
        'Instant',
        'completed',
        'Qualified',
        'positive',
        'Demo call',
        JSON.stringify({ source: 'demo' }),
        120,
        25,
        '0.9s',
        'Demo call summary',
        420,
        720,
        'Demo Carrier',
        new Date().toISOString()
      );
    }
  }
}

export function recordLLMCall({ provider, model, latencyMs = 0, cached = 0, promptTokens = 0, completionTokens = 0, status = 'success' }) {
  try {
    const id = `llm_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const stmt = db.prepare(`
      INSERT INTO llm_usage_logs (id, provider, model, latency_ms, cached, prompt_tokens, completion_tokens, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `);
    stmt.run(id, provider.toLowerCase(), model, Math.round(latencyMs), cached ? 1 : 0, promptTokens, completionTokens, status);
  } catch (err) {
    console.error('[DB] recordLLMCall error:', err.message);
  }
}

export function getLLMUsageStats() {
  const quotas = {
    'groq': 14400,    // Groq Free Tier: 14,400 requests/day
    'mistral': 1000,  // Mistral Free Tier: 1,000 requests/day
    'gemini': 1500    // Google Gemini Free Tier: 1,500 requests/day
  };

  try {
    // Count calls made today (UTC day matching SQLite datetime('now'))
    const rows = db.prepare(`
      SELECT 
        LOWER(provider) as prov,
        COUNT(*) as total_calls,
        SUM(CASE WHEN status = 'rate_limited' THEN 1 ELSE 0 END) as rate_limited_calls,
        AVG(latency_ms) as avg_latency,
        MAX(created_at) as last_call_at
      FROM llm_usage_logs
      WHERE date(created_at) = date('now')
      GROUP BY LOWER(provider)
    `).all();

    const statsMap = {};
    for (const r of rows) {
      statsMap[r.prov] = r;
    }

    const groqCalls = statsMap['groq']?.total_calls || 0;
    const mistralCalls = statsMap['mistral']?.total_calls || 0;
    const geminiCalls = statsMap['gemini']?.total_calls || 0;

    const providers = [
      {
        id: 'groq',
        name: 'Groq LPU',
        tier: 'Tier 1 (Fastest Primary)',
        model: 'meta-llama/llama-4-scout-17b / qwen3.8-27b',
        quotaDaily: quotas.groq,
        callsToday: groqCalls,
        callsLeft: Math.max(0, quotas.groq - groqCalls),
        avgLatencyMs: Math.round(statsMap['groq']?.avg_latency || 920),
        status: (statsMap['groq']?.rate_limited_calls > 0) ? 'cooling_down' : 'operational',
        isPrimary: true
      },
      {
        id: 'mistral',
        name: 'Mistral AI',
        tier: 'Tier 2 (High-Speed Secondary)',
        model: 'ministral-3b-latest',
        quotaDaily: quotas.mistral,
        callsToday: mistralCalls,
        callsLeft: Math.max(0, quotas.mistral - mistralCalls),
        avgLatencyMs: Math.round(statsMap['mistral']?.avg_latency || 4133),
        status: 'standby_ready',
        isPrimary: false
      },
      {
        id: 'gemini',
        name: 'Google Gemini',
        tier: 'Tier 3 (High-Capacity Safety Net)',
        model: 'gemini-3.1-flash-lite',
        quotaDaily: quotas.gemini,
        callsToday: geminiCalls,
        callsLeft: Math.max(0, quotas.gemini - geminiCalls),
        avgLatencyMs: Math.round(statsMap['gemini']?.avg_latency || 2640),
        status: 'standby_ready',
        isPrimary: false
      }
    ];

    const totalCallsToday = providers.reduce((acc, p) => acc + p.callsToday, 0);
    const totalRemaining = providers.reduce((acc, p) => acc + p.callsLeft, 0);

    return {
      providers,
      totalCallsToday,
      totalRemaining,
      resetAt: '00:00 UTC (Daily)'
    };
  } catch (err) {
    console.error('[DB] getLLMUsageStats error:', err.message);
    return {
      providers: [],
      totalCallsToday: 0,
      totalRemaining: 16900,
      resetAt: '00:00 UTC (Daily)'
    };
  }
}
