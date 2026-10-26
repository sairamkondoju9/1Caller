import { createClient } from '@libsql/client';

if (!process.argv.includes('--apply')) {
  throw new Error('This migration makes database changes. Re-run with --apply to continue.');
}

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url || !authToken) {
  throw new Error('TURSO_DATABASE_URL and TURSO_AUTH_TOKEN must be set before running this migration.');
}

const client = createClient({ url, authToken });

async function migrateTurso() {
  console.log('Migrating schemas to Turso (libSQL)...');

  const statements = [
    `CREATE TABLE IF NOT EXISTS tenants (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      dlt_entity_id TEXT,
      plan TEXT DEFAULT 'growth',
      status TEXT DEFAULT 'active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );`,

    `CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'tenant',
      tenant_id TEXT DEFAULT 'default',
      avatar TEXT,
      google_id TEXT,
      password_hash TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );`,

    `CREATE TABLE IF NOT EXISTS employees (
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
    );`,

    `CREATE TABLE IF NOT EXISTS campaigns (
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
    );`,

    `CREATE TABLE IF NOT EXISTS leads (
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
    );`,

    `CREATE TABLE IF NOT EXISTS calls (
      id TEXT PRIMARY KEY,
      tenant_id TEXT DEFAULT 'default',
      employee_id TEXT,
      employee_name TEXT,
      contact_name TEXT,
      phone TEXT NOT NULL,
      direction TEXT DEFAULT 'outbound',
      status TEXT DEFAULT 'completed',
      outcome TEXT DEFAULT 'completed',
      channel TEXT DEFAULT 'Instant',
      captured TEXT DEFAULT '{}',
      badge TEXT DEFAULT '',
      speed_to_lead TEXT DEFAULT '—',
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
    );`,

    `CREATE TABLE IF NOT EXISTS turns (
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
    );`,

    `CREATE TABLE IF NOT EXISTS phone_numbers (
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
    );`,

    `CREATE TABLE IF NOT EXISTS dnc_registry (
      id TEXT PRIMARY KEY,
      tenant_id TEXT DEFAULT 'default',
      phone TEXT NOT NULL,
      reason TEXT DEFAULT 'Customer requested opt-out during call',
      added_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );`,

    `CREATE TABLE IF NOT EXISTS knowledge_base (
      id TEXT PRIMARY KEY,
      tenant_id TEXT DEFAULT 'default',
      employee_id TEXT,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      category TEXT DEFAULT 'faq',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );`,

    `CREATE TABLE IF NOT EXISTS llm_usage_logs (
      id TEXT PRIMARY KEY,
      provider TEXT NOT NULL,
      model TEXT NOT NULL,
      latency_ms INTEGER DEFAULT 0,
      cached INTEGER DEFAULT 0,
      prompt_tokens INTEGER DEFAULT 0,
      completion_tokens INTEGER DEFAULT 0,
      status TEXT DEFAULT 'success',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );`,

    `CREATE TABLE IF NOT EXISTS billing (
      id TEXT PRIMARY KEY,
      tenant_id TEXT DEFAULT 'default',
      balance_credits REAL DEFAULT 50.0,
      balance_inr REAL DEFAULT 50.0,
      rate_standard REAL DEFAULT 5.00,
      rate_premium REAL DEFAULT 6.80,
      rate_enterprise REAL DEFAULT 3.50
    );`,

    `CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      tenant_id TEXT DEFAULT 'default',
      type TEXT NOT NULL,
      amount REAL NOT NULL,
      credits REAL NOT NULL,
      description TEXT,
      invoice_id TEXT,
      status TEXT DEFAULT 'success',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );`,

    `CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT
    );`,

    `CREATE INDEX IF NOT EXISTS idx_calls_created ON calls(created_at DESC);`,
    `CREATE INDEX IF NOT EXISTS idx_calls_status ON calls(status);`,
    `CREATE INDEX IF NOT EXISTS idx_leads_campaign ON leads(campaign_id, status);`,
    `CREATE INDEX IF NOT EXISTS idx_dnc_phone ON dnc_registry(phone);`,
    `CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);`,
    `CREATE INDEX IF NOT EXISTS idx_employees_status ON employees(status);`
  ];

  for (const sql of statements) {
    await client.execute(sql);
  }
  console.log('Tables and indexes created successfully in Turso!');

  console.log('Schema migration complete; no sample records seeded.');
}

migrateTurso().catch(e => console.error('Migration failed:', e));
