const schemaStatements = [
  `CREATE TABLE IF NOT EXISTS tenants (id TEXT PRIMARY KEY, name TEXT NOT NULL, email TEXT NOT NULL, dlt_entity_id TEXT, plan TEXT DEFAULT 'growth', status TEXT DEFAULT 'active', created_at DATETIME DEFAULT CURRENT_TIMESTAMP)`,
  `CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, email TEXT UNIQUE NOT NULL, name TEXT NOT NULL, role TEXT NOT NULL DEFAULT 'client', tenant_id TEXT DEFAULT 'default', avatar TEXT, google_id TEXT, password_hash TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP)`,
  `CREATE TABLE IF NOT EXISTS employees (id TEXT PRIMARY KEY, tenant_id TEXT DEFAULT 'default', name TEXT NOT NULL, type TEXT NOT NULL, primary_language TEXT NOT NULL, voice TEXT NOT NULL, industry TEXT, opening_greeting TEXT, prompt_text TEXT, call_steps TEXT, variables TEXT, p50_slo INTEGER DEFAULT 420, status TEXT DEFAULT 'active', sarvam_app_id TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP)`,
  `CREATE TABLE IF NOT EXISTS campaigns (id TEXT PRIMARY KEY, tenant_id TEXT DEFAULT 'default', name TEXT NOT NULL, employee_id TEXT, total_leads INTEGER DEFAULT 0, called_leads INTEGER DEFAULT 0, qualified_leads INTEGER DEFAULT 0, concurrency INTEGER DEFAULT 5, pacing_cps REAL DEFAULT 2.5, calling_window TEXT DEFAULT '09:00-21:00', status TEXT DEFAULT 'draft', created_at DATETIME DEFAULT CURRENT_TIMESTAMP)`,
  `CREATE TABLE IF NOT EXISTS leads (id TEXT PRIMARY KEY, tenant_id TEXT DEFAULT 'default', campaign_id TEXT, name TEXT NOT NULL, phone TEXT NOT NULL, status TEXT DEFAULT 'pending', extracted_data TEXT, call_duration INTEGER DEFAULT 0, last_call_at DATETIME, scheduled_callback_at DATETIME, created_at DATETIME DEFAULT CURRENT_TIMESTAMP)`,
  `CREATE TABLE IF NOT EXISTS calls (id TEXT PRIMARY KEY, tenant_id TEXT DEFAULT 'default', employee_id TEXT, employee_name TEXT, contact_name TEXT, phone TEXT NOT NULL, direction TEXT DEFAULT 'outbound', status TEXT DEFAULT 'completed', outcome TEXT DEFAULT 'completed', channel TEXT DEFAULT 'Instant', captured TEXT DEFAULT '{}', badge TEXT DEFAULT '', speed_to_lead TEXT DEFAULT '—', duration_seconds INTEGER DEFAULT 0, sentiment TEXT DEFAULT 'positive', qualification TEXT DEFAULT 'qualified', transcript TEXT, summary TEXT, cost REAL DEFAULT 0, p50_ms INTEGER DEFAULT 412, p95_ms INTEGER DEFAULT 830, carrier TEXT DEFAULT 'Exotel Primary', created_at DATETIME DEFAULT CURRENT_TIMESTAMP)`,
  `CREATE TABLE IF NOT EXISTS turns (id TEXT PRIMARY KEY, call_id TEXT NOT NULL, turn_idx INTEGER NOT NULL, role TEXT NOT NULL, text TEXT NOT NULL, asr_ms INTEGER DEFAULT 38, llm_ms INTEGER DEFAULT 115, tts_ms INTEGER DEFAULT 78, total_ms INTEGER DEFAULT 412, created_at DATETIME DEFAULT CURRENT_TIMESTAMP)`,
  `CREATE TABLE IF NOT EXISTS phone_numbers (id TEXT PRIMARY KEY, tenant_id TEXT DEFAULT 'default', number TEXT NOT NULL, provider TEXT NOT NULL, series_type TEXT DEFAULT '140-promotional', employee_id TEXT, channels INTEGER DEFAULT 1, status TEXT DEFAULT 'active', is_dlt_registered BOOLEAN DEFAULT 1, monthly_cost REAL DEFAULT 649, purchased_at DATETIME DEFAULT CURRENT_TIMESTAMP)`,
  `CREATE TABLE IF NOT EXISTS dnc_registry (id TEXT PRIMARY KEY, tenant_id TEXT DEFAULT 'default', phone TEXT NOT NULL, reason TEXT DEFAULT 'Customer requested opt-out during call', added_at DATETIME DEFAULT CURRENT_TIMESTAMP)`,
  `CREATE TABLE IF NOT EXISTS knowledge_base (id TEXT PRIMARY KEY, tenant_id TEXT DEFAULT 'default', employee_id TEXT, title TEXT NOT NULL, content TEXT NOT NULL, category TEXT DEFAULT 'faq', created_at DATETIME DEFAULT CURRENT_TIMESTAMP)`,
  `CREATE TABLE IF NOT EXISTS llm_usage_logs (id TEXT PRIMARY KEY, provider TEXT NOT NULL, model TEXT NOT NULL, latency_ms INTEGER DEFAULT 0, cached INTEGER DEFAULT 0, prompt_tokens INTEGER DEFAULT 0, completion_tokens INTEGER DEFAULT 0, status TEXT DEFAULT 'success', created_at DATETIME DEFAULT CURRENT_TIMESTAMP)`,
  `CREATE TABLE IF NOT EXISTS billing (id TEXT PRIMARY KEY, tenant_id TEXT NOT NULL UNIQUE, balance_credits REAL NOT NULL DEFAULT 0, balance_inr REAL NOT NULL DEFAULT 0, rate_standard REAL DEFAULT 5.00, rate_premium REAL DEFAULT 6.80, rate_enterprise REAL DEFAULT 3.50)`,
  `CREATE TABLE IF NOT EXISTS transactions (id TEXT PRIMARY KEY, tenant_id TEXT NOT NULL, type TEXT NOT NULL, amount REAL NOT NULL, credits REAL NOT NULL, description TEXT, invoice_id TEXT, status TEXT DEFAULT 'success', created_at DATETIME DEFAULT CURRENT_TIMESTAMP)`,
  `CREATE TABLE IF NOT EXISTS tenant_settings (tenant_id TEXT NOT NULL, key TEXT NOT NULL, value TEXT, PRIMARY KEY (tenant_id, key))`,
  `CREATE TABLE IF NOT EXISTS email_verifications (email TEXT PRIMARY KEY, code TEXT, expires_at INTEGER)`,
  `CREATE TABLE IF NOT EXISTS payment_orders (order_id TEXT PRIMARY KEY, tenant_id TEXT NOT NULL, amount_paise INTEGER NOT NULL, base_amount REAL NOT NULL, credits REAL NOT NULL, bonus_credits REAL NOT NULL DEFAULT 0, plan_id TEXT, status TEXT NOT NULL DEFAULT 'created', payment_id TEXT UNIQUE, created_at DATETIME DEFAULT CURRENT_TIMESTAMP)`,
  `CREATE INDEX IF NOT EXISTS idx_turso_employees_tenant ON employees(tenant_id, created_at DESC)`,
  `CREATE INDEX IF NOT EXISTS idx_turso_campaigns_tenant ON campaigns(tenant_id, created_at DESC)`,
  `CREATE INDEX IF NOT EXISTS idx_turso_leads_tenant ON leads(tenant_id, created_at DESC)`,
  `CREATE INDEX IF NOT EXISTS idx_turso_calls_tenant ON calls(tenant_id, created_at DESC)`,
  `CREATE INDEX IF NOT EXISTS idx_turso_transactions_tenant ON transactions(tenant_id, created_at DESC)`,
  `CREATE INDEX IF NOT EXISTS idx_turso_dnc_tenant_phone ON dnc_registry(tenant_id, phone)`
];

let schemaInitialization;
let isSchemaReady = false;

export function isTursoSchemaReady() {
  return isSchemaReady;
}

export function ensureTursoSchema(turso) {
  if (isSchemaReady) return Promise.resolve();
  if (!turso) throw new Error('Turso is not configured');
  if (!schemaInitialization) {
    schemaInitialization = (async () => {
      try {
        await turso.batch(schemaStatements.map(sql => ({ sql })), 'write');
      } catch {
        // Fallback to sequential execution if batch is unsupported
        for (const sql of schemaStatements) await turso.execute(sql);
      }
      const migrations = [
        "ALTER TABLE calls ADD COLUMN outcome TEXT DEFAULT 'completed'",
        "ALTER TABLE calls ADD COLUMN channel TEXT DEFAULT 'Instant'",
        "ALTER TABLE calls ADD COLUMN captured TEXT DEFAULT '{}'",
        "ALTER TABLE calls ADD COLUMN badge TEXT DEFAULT ''",
        "ALTER TABLE calls ADD COLUMN speed_to_lead TEXT DEFAULT '—'",
        "ALTER TABLE users ADD COLUMN google_id TEXT",
        "ALTER TABLE users ADD COLUMN password_hash TEXT",
        "ALTER TABLE employees ADD COLUMN sarvam_app_id TEXT"
      ];
      for (const sql of migrations) {
        try { await turso.execute(sql); } catch (error) {
          if (!/duplicate column|already exists/i.test(error.message || '')) throw error;
        }
      }
      isSchemaReady = true;
    })().catch(error => {
      schemaInitialization = undefined;
      isSchemaReady = false;
      throw error;
    });
  }
  return schemaInitialization;
}
