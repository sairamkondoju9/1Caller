-- ==============================================================================
-- ANTIGRAVITY VOICE ENGINE - SUPABASE / POSTGRESQL PRODUCTION SCHEMA
-- Multi-Tenant Autonomous AI Voice Support & Telephony Platform
-- Target: 500,000 Concurrent Calls (CCU) | Sub-420ms Voice-to-Voice Latency
-- ==============================================================================

-- 1. Enable UUID and Cryptographic extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Tenants Table
CREATE TABLE IF NOT EXISTS tenants (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  dlt_entity_id TEXT,
  plan TEXT DEFAULT 'growth',
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Users Table (Platform Owners, Admins, Tenant Staff)
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'tenant', -- 'owner' (Super Admin) | 'admin' | 'tenant' | 'viewer'
  tenant_id TEXT DEFAULT 'default' REFERENCES tenants(id) ON DELETE CASCADE,
  avatar TEXT,
  google_id TEXT,
  password_hash TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Autonomous AI Voice Employees
CREATE TABLE IF NOT EXISTS employees (
  id TEXT PRIMARY KEY,
  tenant_id TEXT DEFAULT 'default' REFERENCES tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- 'sales', 'support', 'collections', 'appointment'
  primary_language TEXT NOT NULL, -- 'te-IN', 'hi-IN', 'ta-IN', 'kn-IN', 'mr-IN', 'en-IN'
  voice TEXT NOT NULL, -- 'kavya' (Cartesia Sonic-2), 'arjun', 'sarah', 'bulbul_meera'
  industry TEXT,
  opening_greeting TEXT,
  prompt_text TEXT,
  call_steps TEXT, -- JSON Array of conversation state steps
  variables TEXT, -- JSON Array of dynamic CRM variables
  p50_slo INTEGER DEFAULT 420,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Outbound & Inbound Campaigns
CREATE TABLE IF NOT EXISTS campaigns (
  id TEXT PRIMARY KEY,
  tenant_id TEXT DEFAULT 'default' REFERENCES tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  employee_id TEXT REFERENCES employees(id) ON DELETE SET NULL,
  total_leads INTEGER DEFAULT 0,
  called_leads INTEGER DEFAULT 0,
  qualified_leads INTEGER DEFAULT 0,
  concurrency INTEGER DEFAULT 5,
  pacing_cps NUMERIC DEFAULT 2.5,
  calling_window TEXT DEFAULT '09:00-21:00',
  status TEXT DEFAULT 'ready',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Leads & Contacts
CREATE TABLE IF NOT EXISTS leads (
  id TEXT PRIMARY KEY,
  tenant_id TEXT DEFAULT 'default' REFERENCES tenants(id) ON DELETE CASCADE,
  campaign_id TEXT REFERENCES campaigns(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  extracted_data JSONB,
  call_duration INTEGER DEFAULT 0,
  last_call_at TIMESTAMPTZ,
  scheduled_callback_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Call Records (CDR)
CREATE TABLE IF NOT EXISTS calls (
  id TEXT PRIMARY KEY,
  tenant_id TEXT DEFAULT 'default' REFERENCES tenants(id) ON DELETE CASCADE,
  employee_id TEXT REFERENCES employees(id) ON DELETE SET NULL,
  employee_name TEXT,
  contact_name TEXT,
  phone TEXT NOT NULL,
  direction TEXT DEFAULT 'outbound',
  status TEXT DEFAULT 'completed',
  duration_seconds INTEGER DEFAULT 0,
  sentiment TEXT DEFAULT 'positive',
  qualification TEXT DEFAULT 'qualified',
  transcript JSONB,
  summary TEXT,
  cost NUMERIC DEFAULT 0,
  p50_ms INTEGER DEFAULT 412,
  p95_ms INTEGER DEFAULT 830,
  carrier TEXT DEFAULT 'Sarvam Telephony Network',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Conversational Turns (Audio Latency Waterfall)
CREATE TABLE IF NOT EXISTS turns (
  id TEXT PRIMARY KEY,
  call_id TEXT NOT NULL REFERENCES calls(id) ON DELETE CASCADE,
  turn_idx INTEGER NOT NULL,
  role TEXT NOT NULL, -- 'user' | 'assistant'
  text TEXT NOT NULL,
  asr_ms INTEGER DEFAULT 38,
  llm_ms INTEGER DEFAULT 115,
  tts_ms INTEGER DEFAULT 78,
  total_ms INTEGER DEFAULT 412,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. DLT Telephony Numbers
CREATE TABLE IF NOT EXISTS phone_numbers (
  id TEXT PRIMARY KEY,
  tenant_id TEXT DEFAULT 'default' REFERENCES tenants(id) ON DELETE CASCADE,
  number TEXT NOT NULL,
  provider TEXT NOT NULL, -- 'Sarvam Telephony Network', 'Exotel Primary', 'Plivo Secondary'
  series_type TEXT DEFAULT '140-promotional',
  employee_id TEXT REFERENCES employees(id) ON DELETE SET NULL,
  channels INTEGER DEFAULT 1,
  status TEXT DEFAULT 'active',
  is_dlt_registered BOOLEAN DEFAULT TRUE,
  monthly_cost NUMERIC DEFAULT 649,
  purchased_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. TRAI National Do-Not-Call (DNC) Registry
CREATE TABLE IF NOT EXISTS dnc_registry (
  id TEXT PRIMARY KEY,
  tenant_id TEXT DEFAULT 'default' REFERENCES tenants(id) ON DELETE CASCADE,
  phone TEXT NOT NULL,
  reason TEXT DEFAULT 'Customer requested opt-out during call',
  added_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Knowledge Base (RAG per industry)
CREATE TABLE IF NOT EXISTS knowledge_base (
  id TEXT PRIMARY KEY,
  tenant_id TEXT DEFAULT 'default' REFERENCES tenants(id) ON DELETE CASCADE,
  employee_id TEXT REFERENCES employees(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT DEFAULT 'faq',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. Billing & Credit Ledger
CREATE TABLE IF NOT EXISTS billing (
  id TEXT PRIMARY KEY,
  tenant_id TEXT DEFAULT 'default' UNIQUE REFERENCES tenants(id) ON DELETE CASCADE,
  balance_credits NUMERIC DEFAULT 50.0,
  balance_inr NUMERIC DEFAULT 50.0,
  rate_standard NUMERIC DEFAULT 5.00,
  rate_premium NUMERIC DEFAULT 6.80,
  rate_enterprise NUMERIC DEFAULT 3.50
);

-- 13. Transactions Table
CREATE TABLE IF NOT EXISTS transactions (
  id TEXT PRIMARY KEY,
  tenant_id TEXT DEFAULT 'default' REFERENCES tenants(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'topup', 'usage_deduction', 'refund'
  amount NUMERIC NOT NULL,
  credits NUMERIC NOT NULL,
  description TEXT,
  invoice_id TEXT,
  status TEXT DEFAULT 'success',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. System Settings
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT
);

-- ==============================================================================
-- HIGH-CONCURRENCY PERFORMANCE INDEXES
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_leads_campaign_status ON leads (campaign_id, status);
CREATE INDEX IF NOT EXISTS idx_leads_phone ON leads (phone);
CREATE INDEX IF NOT EXISTS idx_calls_tenant_created ON calls (tenant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_turns_call_idx ON turns (call_id, turn_idx);
CREATE INDEX IF NOT EXISTS idx_dnc_phone ON dnc_registry (phone);
CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);

-- Intentionally do not seed demo tenants, users, balances, or phone numbers.
