import express from 'express';
import cors from 'cors';
import http from 'node:http';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { WebSocketServer } from 'ws';
import jwt from 'jsonwebtoken';
import 'dotenv/config';
import crypto from 'node:crypto';
import Razorpay from 'razorpay';
import { db, turso, initDatabase, getLLMUsageStats } from './db.js';
import { ensureTursoSchema } from './tursoSchema.js';
import { sanitizeBalance, calculateAdminOverview } from './financialGuard.js';
import { AudioSession } from './audioGateway.js';
import { sarvam } from './sarvamClient.js';
import { cartesia } from './cartesiaClient.js';
import { groqClient } from './groqClient.js';
import { mistralClient } from './mistralClient.js';
import { geminiClient } from './geminiClient.js';
import { llmManager } from './llmManager.js';
import { whatsappClient } from './whatsappClient.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const JWT_SECRET = process.env.JWT_SECRET || (process.env.NODE_ENV === 'production' ? '' : 'local-development-only-secret');
if (!JWT_SECRET) throw new Error('JWT_SECRET must be configured in production');

initDatabase();

const razorpay = process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET
  ? new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET })
  : null;

const app = express();
app.use(cors());
app.use(express.json({ limit: '2mb', verify: (req, res, buffer) => { req.rawBody = Buffer.from(buffer); } }));
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

app.use('/api', async (req, res, next) => {
  if (req.path === '/config' || req.path === '/health') return next();
  if (process.env.VERCEL && process.env.NODE_ENV === 'production' && !turso) {
    return res.status(503).json({ error: 'Persistent business data storage is not configured. Add Turso credentials and redeploy.' });
  }
  if (!turso) return next();
  try {
    await ensureTursoSchema(turso);
    next();
  } catch (error) {
    console.error('[Turso Schema Initialization Error]:', error.message);
    res.status(503).json({ error: 'Persistent business database schema is unavailable. Check Turso credentials and migrations.' });
  }
});

// Serve production static files with cache-busting for index.html and immutable caching for assets
const distPath = path.resolve(__dirname, '../client/dist');
app.use(express.static(distPath, {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('index.html')) {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
    } else if (filePath.includes('/assets/')) {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    }
  }
}));

const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: '/ws' });

// Active WebSocket Audio Sessions Map
const activeSessions = new Map();

wss.on('connection', (ws, request) => {
  const connectionUrl = new URL(request.url, `http://${request.headers.host || 'localhost'}`);
  const token = connectionUrl.searchParams.get('token');
  let user;
  try {
    user = jwt.verify(token || '', JWT_SECRET);
  } catch {
    ws.close(1008, 'Authentication required');
    return;
  }

  const sessionId = `sess_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  const employeeId = connectionUrl.searchParams.get('employeeId');
  const employee = employeeId
    ? db.prepare('SELECT * FROM employees WHERE id = ? AND tenant_id = ?').get(employeeId, user.tenant_id)
    : db.prepare('SELECT * FROM employees WHERE tenant_id = ? ORDER BY created_at DESC LIMIT 1').get(user.tenant_id);
  if (!employee) {
    ws.close(1008, 'No employee available in this workspace');
    return;
  }

  const session = new AudioSession(sessionId, employee, ws);
  activeSessions.set(sessionId, session);

  ws.send(JSON.stringify({
    event: 'session.ready',
    sessionId: sessionId,
    employee: employee,
    p50_slo_ms: 420
  }));

  ws.on('message', async (message) => {
    try {
      const data = JSON.parse(message.toString());

      if (data.action === 'user_speech' || data.action === 'user_turn') {
        const result = await session.handleUserInput(data.text);
        session.emitEvent('turn.completed', {
          turn: {
            text: result.text,
            engine: result.waterfall.ttsEngine,
            waterfall: result.waterfall
          }
        });
      } else if (data.action === 'barge_in') {
        session.triggerBargeIn();
      } else if (data.action === 'change_language') {
        session.language = data.language;
      } else if (data.action === 'change_engine') {
        session.preferredEngine = data.engine;
      }
    } catch (err) {
      console.error('[WS Error]', err);
    }
  });

  ws.on('close', () => {
    activeSessions.delete(sessionId);
  });
});

// ==========================================
// AUTHENTICATION MIDDLEWARE
// ==========================================

// Middleware: Require valid JWT token
function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }
  const token = authHeader.substring(7);
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Unauthorized: Invalid or expired token' });
  }
}

// Middleware: Require admin/owner role
function requireAdmin(req, res, next) {
  if (!req.user || (req.user.role !== 'owner' && req.user.role !== 'admin')) {
    return res.status(403).json({ error: 'Forbidden: Admin access only' });
  }
  next();
}

// ==========================================
// REST API ROUTES
// ==========================================

// System Health & Latency Budget Diagnostic
app.get('/api/health', async (req, res) => {
  const databaseBackend = turso ? 'turso' : process.env.VERCEL ? 'ephemeral_sqlite' : 'local_sqlite';
  let databaseStatus = turso ? 'unreachable' : process.env.VERCEL ? 'not_configured' : 'connected';
  if (turso) {
    try {
      await ensureTursoSchema(turso);
      await turso.execute('SELECT 1 AS healthy');
      databaseStatus = 'connected';
    } catch (error) {
      console.error('[Health Check] Turso connection failed:', error.message);
    }
  } else if (!process.env.VERCEL) {
    try {
      db.prepare('SELECT 1 AS healthy').get();
    } catch (error) {
      databaseStatus = 'unreachable';
      console.error('[Health Check] Local database check failed:', error.message);
    }
  }

  const aiGeneration = [process.env.GROQ_API_KEY, process.env.GEMINI_API_KEY, process.env.MISTRAL_API_KEY, process.env.CEREBRAS_API_KEY]
    .some(Boolean) ? 'configured' : 'not_configured';
  const voiceGateway = process.env.VOICE_WS_URL
    ? 'configured'
    : process.env.VERCEL ? 'not_configured' : 'local_websocket';
  const providers = {
    cartesia: process.env.CARTESIA_API_KEY ? 'configured' : 'not_configured',
    sarvam: process.env.SARVAM_API_KEY ? 'configured' : 'not_configured',
    aiGeneration,
    googleAuth: process.env.GOOGLE_CLIENT_ID ? 'configured' : 'not_configured',
    database: databaseStatus,
    databaseBackend,
    voiceGateway
  };
  const ready = databaseStatus === 'connected'
    && aiGeneration === 'configured'
    && providers.sarvam === 'configured'
    && voiceGateway !== 'not_configured';

  res.status(ready ? 200 : 503).json({
    status: ready ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    providers,
    note: 'Provider configuration is reported only; this check does not make AI, payment, or phone calls.'
  });
});

// Environment Configuration Status for Frontend
app.get('/api/config', (req, res) => {
  const hasPersistentDatabase = !process.env.VERCEL || Boolean(turso);
  res.json({
    googleClientId: process.env.GOOGLE_CLIENT_ID || null,
    hasGoogleAuth: Boolean(process.env.GOOGLE_CLIENT_ID),
    razorpayKeyId: process.env.RAZORPAY_KEY_ID || null,
    hasRazorpay: Boolean(razorpay),
    hasSarvamKey: Boolean(process.env.SARVAM_API_KEY),
    hasCartesiaKey: Boolean(process.env.CARTESIA_API_KEY),
    hasDatabaseUrl: Boolean(turso),
    hasPersistentDatabase,
    databaseBackend: turso ? 'turso' : process.env.VERCEL ? 'ephemeral_sqlite' : 'local_sqlite',
    voiceWebSocketUrl: process.env.VOICE_WS_URL || null,
    hasPersistentVoiceGateway: Boolean(process.env.VOICE_WS_URL),
    nodeEnv: process.env.NODE_ENV || 'production',
    environment: process.env.NODE_ENV || 'production',
    preferredTtsEngine: 'cartesia',
    preferredTelephony: 'sarvam'
  });
});

// ==========================================
// AUTHENTICATION & GOOGLE LOGIN ROUTES
// ==========================================

// Google Sign-In & Verification
app.post('/api/auth/google', async (req, res) => {
  try {
    const { credential } = req.body;
    if (!process.env.GOOGLE_CLIENT_ID || !credential) {
      return res.status(503).json({ error: 'Verified Google sign-in is not configured' });
    }
    if (process.env.VERCEL && process.env.NODE_ENV === 'production' && !turso) {
      return res.status(503).json({ error: 'Persistent account storage is not configured. Set TURSO_DATABASE_URL and TURSO_AUTH_TOKEN, then redeploy.' });
    }

    const verifyRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`, {
      signal: AbortSignal.timeout(5000)
    });
    if (!verifyRes.ok) {
      return res.status(401).json({ error: 'Invalid Google credential' });
    }
    const googleData = await verifyRes.json();
    const emailVerified = googleData.email_verified === true || String(googleData.email_verified).toLowerCase() === 'true';
    if (googleData.aud !== process.env.GOOGLE_CLIENT_ID || !emailVerified || !googleData.email || !googleData.sub) {
      return res.status(401).json({ error: 'Google identity could not be verified' });
    }

    const userEmail = googleData.email.trim().toLowerCase();
    const userName = googleData.name || userEmail.split('@')[0];
    const userAvatar = googleData.picture || '';
    const googleId = googleData.sub;
    const ownerEmails = new Set((process.env.OWNER_EMAILS || '').split(',').map(value => value.trim().toLowerCase()).filter(Boolean));
    const adminEmails = new Set((process.env.ADMIN_EMAILS || '').split(',').map(value => value.trim().toLowerCase()).filter(Boolean));
    const role = ownerEmails.has(userEmail) ? 'owner' : adminEmails.has(userEmail) ? 'admin' : 'client';

    let user = null;

    // Use the shared database as the source of truth when configured.
    if (turso) {
      try {
        await turso.execute(`CREATE TABLE IF NOT EXISTS tenants (
          id TEXT PRIMARY KEY, name TEXT NOT NULL, email TEXT NOT NULL,
          dlt_entity_id TEXT, plan TEXT DEFAULT 'growth', status TEXT DEFAULT 'active',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);
        await turso.execute(`CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY, email TEXT UNIQUE NOT NULL, name TEXT NOT NULL,
          role TEXT NOT NULL DEFAULT 'client', tenant_id TEXT NOT NULL,
          avatar TEXT, google_id TEXT, password_hash TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);
        await turso.execute(`CREATE TABLE IF NOT EXISTS billing (
          id TEXT PRIMARY KEY, tenant_id TEXT NOT NULL UNIQUE,
          balance_credits REAL NOT NULL DEFAULT 0, balance_inr REAL NOT NULL DEFAULT 0,
          rate_standard REAL DEFAULT 5.00, rate_premium REAL DEFAULT 6.80,
          rate_enterprise REAL DEFAULT 3.50
        )`);
        const tUser = await turso.execute({
          sql: 'SELECT * FROM users WHERE email = ?',
          args: [userEmail]
        });
        if (tUser.rows && tUser.rows.length > 0) {
          user = tUser.rows[0];
        }
      } catch (err) {
        console.error('[Turso Auth User Fetch Error]:', err.message);
        return res.status(503).json({ error: 'Account database is unavailable. Please retry sign-in shortly.' });
      }
    }

    if (!user && !turso) {
      user = db.prepare('SELECT * FROM users WHERE email = ?').get(userEmail);
    }

    if (!user) {
      const id = `usr_${crypto.randomUUID()}`;
      const tenantId = `tenant_${crypto.randomUUID()}`;
      const cleanName = userName || userEmail.split('@')[0];
      if (turso) {
        let tx;
        try {
          tx = await turso.transaction('write');
          await tx.execute({
            sql: `INSERT INTO tenants (id, name, email, plan, status) VALUES (?, ?, ?, 'growth', 'active')`,
            args: [tenantId, `${cleanName}'s Workspace`, userEmail]
          });
          await tx.execute({
            sql: `INSERT INTO users (id, email, name, role, tenant_id, avatar, google_id) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            args: [id, userEmail, cleanName, role, tenantId, userAvatar || '', googleId || '']
          });
          await tx.execute({
            sql: 'INSERT INTO billing (id, tenant_id, balance_credits, balance_inr) VALUES (?, ?, 50, 0)',
            args: [`b_${tenantId}`, tenantId]
          });
          await tx.execute({
            sql: `INSERT INTO transactions (id, tenant_id, type, amount, credits, description, status)
                  VALUES (?, ?, 'signup_bonus', 0, 50, '50 free signup credits', 'success')`,
            args: [`signup_bonus_${tenantId}`, tenantId]
          });
          await tx.commit();
          user = {
            id,
            email: userEmail,
            name: cleanName,
            role,
            tenant_id: tenantId,
            avatar: userAvatar || '',
            google_id: googleId || ''
          };
        } catch (e) {
          if (tx) await tx.rollback().catch(() => {});
          console.error('[Turso User Create Error]:', e.message);
          return res.status(503).json({ error: 'Could not create your workspace in the account database. Please retry.' });
        }
      } else {
        db.exec('BEGIN IMMEDIATE');
        try {
          db.prepare('INSERT INTO tenants (id, name, email, plan, status) VALUES (?, ?, ?, ?, ?)')
            .run(tenantId, `${cleanName}'s Workspace`, userEmail, 'growth', 'active');
          db.prepare(`
            INSERT INTO billing (id, tenant_id, balance_credits, balance_inr, rate_standard, rate_premium, rate_enterprise)
            VALUES (?, ?, 50, 0, 5.00, 6.80, 3.50)
          `).run(`b_${tenantId}`, tenantId);
          db.prepare(`
            INSERT INTO transactions (id, tenant_id, type, amount, credits, description, status)
            VALUES (?, ?, 'signup_bonus', 0, 50, '50 free signup credits', 'success')
          `).run(`signup_bonus_${tenantId}`, tenantId);
          db.prepare(`
            INSERT INTO users (id, email, name, role, tenant_id, avatar, google_id)
            VALUES (?, ?, ?, ?, ?, ?, ?)
          `).run(id, userEmail, cleanName, role, tenantId, userAvatar || '', googleId);
          db.exec('COMMIT');
        } catch (error) {
          db.exec('ROLLBACK');
          throw error;
        }
        user = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
      }
    }

    if (!user) {
      return res.status(503).json({ error: 'Account storage is unavailable; sign-in was not completed' });
    }

    // Privileges are granted only by explicit server-side email allowlists.
    if (!turso) {
      db.prepare('UPDATE users SET role = ?, google_id = ? WHERE id = ?').run(role, googleId, user.id);
    }
    if (turso) {
      try {
        await turso.execute({
          sql: 'UPDATE users SET role = ?, google_id = ? WHERE id = ?',
          args: [role, googleId, user.id]
        });
      } catch (syncError) {
        console.warn('[Turso Auth User Update Warning]:', syncError.message);
      }
    }
    user.role = role;
    user.google_id = googleId;

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, tenant_id: user.tenant_id },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({ success: true, token, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// One-Click Login & Role Switching
app.post('/api/auth/login', async (req, res) => {
  return res.status(410).json({ error: 'Email-only sign-in has been disabled. Use verified Google sign-in.' });
});

// Current User Profile
app.get('/api/auth/me', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      if (process.env.VERCEL && process.env.NODE_ENV === 'production' && !turso) {
        return res.status(503).json({ error: 'Persistent account storage is not configured' });
      }
      let user;
      if (turso) {
        const tUser = await turso.execute({
          sql: 'SELECT * FROM users WHERE id = ?',
          args: [decoded.id]
        });
        user = tUser.rows?.[0];
      } else {
        user = db.prepare('SELECT * FROM users WHERE id = ?').get(decoded.id);
      }
      if (user) {
        return res.json({ user });
      }
      return res.status(401).json({ error: 'Account session no longer exists' });
    } catch (e) {
      if (e.name === 'JsonWebTokenError' || e.name === 'TokenExpiredError' || e.name === 'NotBeforeError') {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      console.error('[Auth Profile Storage Error]:', e.message);
      return res.status(503).json({ error: 'Account database is temporarily unavailable' });
    }
  }
  return res.status(401).json({ error: 'Unauthorized' });
});

// ==========================================
// SUPER ADMIN & OWNER CONTROL PLANE (Section 11)
// ==========================================

// Global Overview: Platform revenue, global CCU, trunk health, and margins
app.get('/api/admin/overview', authenticateToken, requireAdmin, async (req, res) => {
  try {
    if (turso) {
      const [tenantsResult, balancesResult, callsResult] = await Promise.all([
        turso.execute('SELECT COUNT(*) AS count FROM tenants'),
        turso.execute('SELECT balance_inr FROM billing'),
        turso.execute('SELECT COUNT(*) AS count FROM calls')
      ]);
      const balanceRows = balancesResult.rows;
      return res.json(calculateAdminOverview(balanceRows, Number(tenantsResult.rows[0]?.count || 0), 0, Number(callsResult.rows[0]?.count || 0)));
    }
    const tenants = db.prepare('SELECT * FROM tenants').all();
    const balanceRows = db.prepare('SELECT balance_inr FROM billing').all();
    const calls = db.prepare('SELECT COUNT(*) as count, SUM(duration_seconds) as total_seconds, SUM(cost) as total_cost FROM calls').get();
    const liveCCU = activeSessions.size;
    const totalRevenue = balanceRows.reduce((sum, row) => sum + sanitizeBalance(row.balance_inr), 0);

    res.json(calculateAdminOverview(
      balanceRows,
      tenants.length,
      liveCCU,
      calls.count || 0
    ));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin Tenants Directory
app.get('/api/admin/tenants', authenticateToken, requireAdmin, async (req, res) => {
  try {
    if (turso) {
      const result = await turso.execute(`
        SELECT t.*, b.balance_credits, b.balance_inr,
          (SELECT COUNT(*) FROM employees e WHERE e.tenant_id = t.id AND e.status != 'archived') AS active_employees,
          (SELECT COUNT(*) FROM calls c WHERE c.tenant_id = t.id) AS monthly_calls
        FROM tenants t LEFT JOIN billing b ON b.tenant_id = t.id ORDER BY t.created_at ASC
      `);
      return res.json(result.rows.map(tenant => ({ ...tenant, balance_credits: sanitizeBalance(tenant.balance_credits), balance_inr: sanitizeBalance(tenant.balance_inr) })));
    }
    const tenants = db.prepare(`
      SELECT t.*, b.balance_credits, b.balance_inr
      FROM tenants t
      LEFT JOIN billing b ON b.tenant_id = t.id
      ORDER BY t.created_at ASC
    `).all();

    res.json(tenants.map(t => ({
      ...t,
      balance_credits: sanitizeBalance(t.balance_credits),
      balance_inr: sanitizeBalance(t.balance_inr),
      active_employees: db.prepare("SELECT COUNT(*) as count FROM employees WHERE tenant_id = ? AND status != 'archived'").get(t.id)?.count || 0,
      monthly_calls: db.prepare("SELECT COUNT(*) as count FROM calls WHERE tenant_id = ?").get(t.id)?.count || 0
    })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin Add Credits to Tenant
app.post('/api/admin/tenants/:id/add-credits', authenticateToken, requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const { credits } = req.body;
    const addAmt = sanitizeBalance(credits);

    if (addAmt <= 0) {
      return res.status(400).json({ error: 'Credits must be a positive number' });
    }

    if (turso) return res.status(503).json({ error: 'Manual credit adjustments are disabled until audited ledger support is configured.' });
    const tenantExists = db.prepare('SELECT id FROM tenants WHERE id = ?').get(id);
    if (!tenantExists) {
      return res.status(404).json({ error: 'Tenant not found' });
    }

    const existingRow = db.prepare('SELECT id FROM billing WHERE tenant_id = ?').get(id);
    if (existingRow) {
      db.prepare('UPDATE billing SET balance_credits = balance_credits + ?, balance_inr = balance_inr + ? WHERE tenant_id = ?').run(
        addAmt, addAmt, id
      );
    } else {
      db.prepare('INSERT INTO billing (id, tenant_id, balance_credits, balance_inr, rate_standard, rate_premium, rate_enterprise) VALUES (?, ?, ?, ?, 5.00, 6.80, 3.50)').run(
        `b_${id}`,
        id,
        addAmt,
        addAmt
      );
    }

    res.json({ success: true, added: addAmt });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin Toggle Tenant Status (Active / Suspended)
app.post('/api/admin/tenants/:id/status', authenticateToken, requireAdmin, (req, res) => {
  try {
    if (turso) return res.status(503).json({ error: 'Tenant status changes are not yet available in the shared database.' });
    const { id } = req.params;
    const { status } = req.body;
    db.prepare('UPDATE tenants SET status = ? WHERE id = ?').run(status, id);
    res.json({ success: true, status });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Global Stats (Powers Top Header Live Pill & KPIs)
app.get('/api/stats', authenticateToken, async (req, res) => {
  try {
    const activeCallsCount = activeSessions.size;
    const callsPerMin = activeCallsCount > 0 ? (activeCallsCount * 2.4).toFixed(1) : '0.0';
    const tenantId = req.user.tenant_id;
    if (turso) {
      const rows = await turso.batch([
        { sql: 'SELECT COALESCE(SUM(balance_credits), 0) AS balance_credits FROM billing WHERE tenant_id = ?', args: [tenantId] },
        { sql: "SELECT COUNT(*) AS count FROM employees WHERE tenant_id = ? AND status IN ('active', 'ready')", args: [tenantId] },
        { sql: 'SELECT COUNT(*) AS count FROM leads WHERE tenant_id = ?', args: [tenantId] }
      ], 'read');
      const balanceCredits = sanitizeBalance(rows[0].rows[0]?.balance_credits);
      return res.json({
        activeCalls: 0,
        callsPerMin: '0.0',
        talkingCount: 0,
        ringingCount: 0,
        balanceCredits,
        balanceMinutes: (balanceCredits / 5.0).toFixed(1),
        activeEmployees: Number(rows[1].rows[0]?.count || 0),
        totalLeads: Number(rows[2].rows[0]?.count || 0)
      });
    }
    const billingRow = db.prepare('SELECT SUM(balance_credits) as balance_credits FROM billing WHERE tenant_id = ?').get(tenantId) || { balance_credits: 0 };
    const balanceCredits = sanitizeBalance(billingRow.balance_credits);
    const empCount = db.prepare("SELECT COUNT(*) as count FROM employees WHERE tenant_id = ? AND (status = 'active' OR status = 'ready')").get(tenantId).count;
    const leadCount = db.prepare('SELECT COUNT(*) as count FROM leads WHERE tenant_id = ?').get(tenantId).count;

    res.json({
      activeCalls: activeCallsCount,
      callsPerMin: callsPerMin,
      talkingCount: activeCallsCount,
      ringingCount: 0,
      balanceCredits,
      balanceMinutes: (balanceCredits / 5.0).toFixed(1),
      activeEmployees: empCount,
      totalLeads: leadCount
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Employees (AI Phone Agents - Queried from Turso Cloud or SQLite)
app.get('/api/employees', authenticateToken, async (req, res) => {
  try {
    if (turso) {
      const tRes = await turso.execute({ sql: 'SELECT * FROM employees WHERE tenant_id = ? ORDER BY created_at DESC', args: [req.user.tenant_id] });
      return res.json((tRes.rows || []).map(e => {
          let parsedSteps = [];
          try {
            parsedSteps = e.call_steps ? JSON.parse(e.call_steps) : [];
          } catch {
            parsedSteps = [];
          }
          const hasRichSteps = Array.isArray(parsedSteps) && parsedSteps.length > 0 && typeof parsedSteps[0] === 'object';
          return {
            ...e,
            call_steps: parsedSteps,
            scriptSteps: hasRichSteps ? parsedSteps : null,
            variables: e.variables ? (typeof e.variables === 'string' ? JSON.parse(e.variables) : e.variables) : []
          };
        }));
    }
  } catch (err) {
    if (turso) {
      console.error('[Turso Employees Fetch Error]:', err.message);
      return res.status(503).json({ error: 'Employees are temporarily unavailable from the workspace database.' });
    }
  }

  const employees = db.prepare('SELECT * FROM employees WHERE tenant_id = ? ORDER BY created_at DESC').all(req.user.tenant_id);
  res.json(employees.map(e => {
    let parsedSteps = [];
    try {
      parsedSteps = e.call_steps ? JSON.parse(e.call_steps) : [];
    } catch {
      parsedSteps = [];
    }
    const hasRichSteps = Array.isArray(parsedSteps) && parsedSteps.length > 0 && typeof parsedSteps[0] === 'object';
    return {
      ...e,
      call_steps: parsedSteps,
      scriptSteps: hasRichSteps ? parsedSteps : null,
      variables: e.variables ? JSON.parse(e.variables) : []
    };
  }));
});

app.post('/api/employees', authenticateToken, async (req, res) => {
  const { id: existingId, name, type, primary_language, voice, industry, opening_greeting, prompt_text, call_steps, scriptSteps, variables } = req.body;
  const id = existingId || `emp_${crypto.randomUUID()}`;
  const tenantId = req.user.tenant_id;
  const employeeStatus = req.body.status === 'draft' ? 'draft' : 'ready';
  const stepsToSave = (scriptSteps && Array.isArray(scriptSteps) && scriptSteps.length > 0) ? scriptSteps : (call_steps || []);
  if (!String(name || '').trim()) return res.status(400).json({ error: 'Employee name is required' });
  if (existingId) {
    const existingAnywhere = turso
      ? (await turso.execute({ sql: 'SELECT id, tenant_id FROM employees WHERE id = ?', args: [id] })).rows[0]
      : db.prepare('SELECT id, tenant_id FROM employees WHERE id = ?').get(id);
    if (existingAnywhere && existingAnywhere.tenant_id !== tenantId) {
      return res.status(404).json({ error: 'Employee not found in this workspace' });
    }
  }
  
  // Upsert or insert employee in the shared production database when configured.
  const existing = db.prepare('SELECT id FROM employees WHERE id = ? AND tenant_id = ?').get(id, tenantId);
  if (turso) {
    try {
      const result = await turso.execute({
        sql: 'SELECT id FROM employees WHERE id = ? AND tenant_id = ?',
        args: [id, tenantId]
      });
      const update = result.rows.length > 0;
      await turso.execute({
        sql: update
          ? `UPDATE employees SET name = ?, type = ?, primary_language = ?, voice = ?, industry = ?, opening_greeting = ?, prompt_text = ?, call_steps = ?, variables = ?, status = ? WHERE id = ? AND tenant_id = ?`
          : `INSERT INTO employees (id, tenant_id, name, type, primary_language, voice, industry, opening_greeting, prompt_text, call_steps, variables, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: update
          ? [name.trim(), type || 'instant_lead', primary_language || 'en', voice || 'Cartesia Sonic-2 / Bulbul V4', industry || 'General Business', opening_greeting || 'Hello! How can I help you today?', prompt_text || '', JSON.stringify(stepsToSave), JSON.stringify(variables || []), employeeStatus, id, tenantId]
          : [id, tenantId, name.trim(), type || 'instant_lead', primary_language || 'en', voice || 'Cartesia Sonic-2 / Bulbul V4', industry || 'General Business', opening_greeting || 'Hello! How can I help you today?', prompt_text || '', JSON.stringify(stepsToSave), JSON.stringify(variables || []), employeeStatus]
      });
      return res.json({ success: true, id });
    } catch (error) {
      console.error('[Turso Employee Save Error]:', error.message);
      return res.status(503).json({ error: 'Employee could not be saved to the workspace database.' });
    }
  }

  if (existing) {
    db.prepare(`
      UPDATE employees SET
        name = ?, type = ?, primary_language = ?, voice = ?, industry = ?,
        opening_greeting = ?, prompt_text = ?, call_steps = ?, variables = ?, status = ?
      WHERE id = ? AND tenant_id = ?
    `).run(
      name || 'AI Assistant',
      type || 'instant_lead',
      primary_language || 'en',
      voice || 'Cartesia Sonic-2 / Bulbul V4',
      industry || 'General Business',
      opening_greeting || 'Hello! How can I help you today?',
      prompt_text || '',
      JSON.stringify(stepsToSave),
      JSON.stringify(variables || []),
      employeeStatus,
      id,
      tenantId
    );
  } else {
    db.prepare(`
      INSERT INTO employees (id, tenant_id, name, type, primary_language, voice, industry, opening_greeting, prompt_text, call_steps, variables, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      tenantId,
      name || 'AI Assistant',
      type || 'instant_lead',
      primary_language || 'en',
      voice || 'Cartesia Sonic-2 / Bulbul V4',
      industry || 'General Business',
      opening_greeting || 'Hello! How can I help you today?',
      prompt_text || '',
      JSON.stringify(stepsToSave),
      JSON.stringify(variables || []),
      employeeStatus
    );
  }

  res.json({ success: true, id });
});

// Compatibility endpoint for the admin provider test; uses the compact profile contract.
app.post('/api/employees/parse-prompt', authenticateToken, async (req, res) => {
  try {
    const result = await llmManager.generateEmployeeScript(req.body);
    res.json({
      ...result,
      openingLine: result.opening_greeting,
      steps: result.call_steps,
      providerTier: result.source
    });
  } catch (error) {
    const message = error.message || 'Employee generation failed.';
    const missingProvider = message.startsWith('No AI provider is configured.');
    const invalidInput = /at least 10 characters|Enter your business name|supported employee language/.test(message);
    console.error('[Employee Profile Test Error]:', message);
    res.status(invalidInput ? 400 : missingProvider ? 503 : 502).json({
      error: missingProvider
        ? 'Employee generation requires a Groq, Cerebras, Mistral, or Gemini API key configured on the server.'
        : message
    });
  }
});

app.post('/api/employees/generate-support-script', authenticateToken, async (req, res) => {
  try {
    const result = await llmManager.generateSupportEmployeeScript(req.body);
    res.json(result);
  } catch (error) {
    const message = error.message || 'Customer-support script generation failed.';
    const missingProvider = message.startsWith('No AI provider is configured.');
    console.error('[Support Script Generation Error]:', message);
    const statusCode = error.name === 'SupportInputError' ? 400 : (missingProvider ? 503 : 502);
    res.status(statusCode).json({ error: message });
  }
});

app.post('/api/employees/build-stage', authenticateToken, async (req, res) => {
  try {
    const result = await llmManager.generateEmployeeBuildStage(req.body);
    res.json(result);
  } catch (error) {
    const message = error.message || 'Employee setup guidance could not be generated.';
    const invalidInput = /supported employee-building stage|at least 10 characters|supported employee language|business name before creating the call plan|customer issue before creating the support plan/.test(message);
    const missingProvider = message.startsWith('No AI provider is configured.');
    console.error('[Employee Build Stage Error]:', message);
    res.status(invalidInput ? 400 : missingProvider ? 503 : 502).json({ error: message });
  }
});

app.post('/api/employees/generate-script', authenticateToken, async (req, res) => {
  try {
    const result = await llmManager.generateEmployeeScript(req.body);
    res.json(result);
  } catch (error) {
    const message = error.message || 'Employee script generation failed.';
    const missingProvider = message.startsWith('No AI provider is configured.');
    console.error('[Employee Script Generation Error]:', message);
    const statusCode = /at least 10 characters|Enter your business name|supported employee language/.test(message)
      ? 400
      : (missingProvider ? 503 : 502);
    res.status(statusCode).json({ error: message });
  }
});

// Swara AI Copilot Conversational Chat Endpoint (Multi-Provider Failover)
app.post('/api/copilot/chat', authenticateToken, async (req, res) => {
  const { currentScript, userInstruction, instruction } = req.body;
  const reply = await llmManager.swaraChatCopilot({ 
    currentScript, 
    userInstruction: userInstruction || instruction || '' 
  });
  const updatedSteps = (reply && reply.steps) || currentScript || [];
  res.json({
    ...reply,
    updatedSteps
  });
});

// Active LLM Providers Status Endpoint
app.get('/api/llm/providers', (req, res) => {
  const providers = llmManager.getActiveProviders();
  res.json({
    providers,
    list: providers
  });
});

// Real-Time Multi-Provider Quota & Call Tracking for Admin Panel
app.get('/api/admin/llm-usage', authenticateToken, requireAdmin, (req, res) => {
  const usage = getLLMUsageStats();
  const circuitBreaker = llmManager.getCircuitBreakerStatus();
  res.json({
    ...usage,
    circuitBreaker,
    recentCalls: [],
    providerStats: usage.providers || []
  });
});

// Bulk Campaigns
app.get('/api/campaigns', authenticateToken, (req, res) => {
  if (turso) {
    return turso.execute({
      sql: 'SELECT * FROM campaigns WHERE tenant_id = ? ORDER BY created_at DESC',
      args: [req.user.tenant_id]
    }).then(result => res.json(result.rows)).catch(error => {
      console.error('[Turso Campaign Fetch Error]:', error.message);
      res.status(503).json({ error: 'Campaigns are temporarily unavailable.' });
    });
  }
  const campaigns = db.prepare('SELECT * FROM campaigns WHERE tenant_id = ? ORDER BY created_at DESC').all(req.user.tenant_id);
  res.json(campaigns);
});

app.post('/api/campaigns', authenticateToken, async (req, res) => {
  const { name, employee_id, leads = [], concurrency = 5, pacing_cps = 2.5 } = req.body;
  const tenantId = req.user.tenant_id;
  const campaignName = String(name || '').trim();
  if (campaignName.length < 2) return res.status(400).json({ error: 'Campaign name must be at least 2 characters' });
  if (!Array.isArray(leads) || leads.length < 1 || leads.length > 5000) {
    return res.status(400).json({ error: 'Upload between 1 and 5,000 valid contacts to create a campaign draft' });
  }
  if (!employee_id) {
    return res.status(400).json({ error: 'Select a published AI employee before creating a campaign draft.' });
  }
  {
    const employee = turso
      ? (await turso.execute({ sql: 'SELECT id, status FROM employees WHERE id = ? AND tenant_id = ?', args: [employee_id, tenantId] })).rows[0]
      : db.prepare('SELECT id, status FROM employees WHERE id = ? AND tenant_id = ?').get(employee_id, tenantId);
    if (!employee) return res.status(400).json({ error: 'Selected employee is not in this workspace' });
    if (employee.status === 'draft') {
      return res.status(400).json({ error: 'Review and publish this employee before creating a campaign.' });
    }
    if (!['active', 'ready'].includes(employee.status)) {
      return res.status(400).json({ error: 'Select an active, published employee before creating a campaign.' });
    }
  }
  const cleanedLeads = leads.map(contact => ({
    name: String(contact?.name || '').trim().slice(0, 120),
    phone: String(contact?.phone || '').replace(/[\s()-]/g, '').slice(0, 20)
  })).filter(contact => contact.name && /^\+?[0-9]{8,15}$/.test(contact.phone));
  if (cleanedLeads.length !== leads.length) return res.status(400).json({ error: 'Some contacts have invalid names or phone numbers. Correct the file and upload again.' });

  const id = `cmp_${crypto.randomUUID()}`;
  if (turso) {
    let tx;
    try {
      tx = await turso.transaction('write');
      await tx.execute({
        sql: `INSERT INTO campaigns (id, tenant_id, name, employee_id, total_leads, concurrency, pacing_cps, status)
              VALUES (?, ?, ?, ?, ?, ?, ?, 'draft')`,
        args: [id, tenantId, campaignName, employee_id || null, cleanedLeads.length, Math.max(1, Math.min(50, Number(concurrency) || 5)), Math.max(0.1, Math.min(10, Number(pacing_cps) || 2.5))]
      });
      for (const contact of cleanedLeads) {
        await tx.execute({
          sql: `INSERT INTO leads (id, tenant_id, campaign_id, name, phone, status, extracted_data)
                VALUES (?, ?, ?, ?, ?, 'pending', '{}')`,
          args: [`lead_${crypto.randomUUID()}`, tenantId, id, contact.name, contact.phone]
        });
      }
      await tx.commit();
      return res.json({ success: true, id, status: 'draft', leadsCreated: cleanedLeads.length, dialingStarted: false });
    } catch (error) {
      if (tx) await tx.rollback().catch(() => {});
      console.error('[Turso Campaign Create Error]:', error.message);
      return res.status(503).json({ error: 'Campaign draft could not be saved. No calls were started.' });
    }
  }
  const insertCampaign = db.prepare(`
    INSERT INTO campaigns (id, tenant_id, name, employee_id, total_leads, concurrency, pacing_cps, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, 'draft')
  `);
  const insertLead = db.prepare(`
    INSERT INTO leads (id, tenant_id, campaign_id, name, phone, status, extracted_data)
    VALUES (?, ?, ?, ?, ?, 'pending', '{}')
  `);
  db.exec('BEGIN IMMEDIATE');
  try {
    insertCampaign.run(id, tenantId, campaignName, employee_id || null, cleanedLeads.length, Math.max(1, Math.min(50, Number(concurrency) || 5)), Math.max(0.1, Math.min(10, Number(pacing_cps) || 2.5)));
    for (const [index, contact] of cleanedLeads.entries()) {
      insertLead.run(`lead_${crypto.randomUUID()}`, tenantId, id, contact.name, contact.phone);
    }
    db.exec('COMMIT');
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }
  res.json({ success: true, id, status: 'draft', leadsCreated: cleanedLeads.length, dialingStarted: false });
});

// Leads CRM
app.get('/api/leads', authenticateToken, (req, res) => {
  if (turso) {
    return turso.execute({
      sql: 'SELECT * FROM leads WHERE tenant_id = ? ORDER BY created_at DESC',
      args: [req.user.tenant_id]
    }).then(result => res.json(result.rows.map(lead => ({
      ...lead,
      extracted_data: lead.extracted_data ? (typeof lead.extracted_data === 'string' ? JSON.parse(lead.extracted_data) : lead.extracted_data) : {}
    })))).catch(error => {
      console.error('[Turso Leads Fetch Error]:', error.message);
      res.status(503).json({ error: 'Leads are temporarily unavailable.' });
    });
  }
  const leads = db.prepare('SELECT * FROM leads WHERE tenant_id = ? ORDER BY created_at DESC').all(req.user.tenant_id);
  res.json(leads.map(l => ({
    ...l,
    extracted_data: l.extracted_data ? JSON.parse(l.extracted_data) : {}
  })));
});

app.post('/api/leads', authenticateToken, async (req, res) => {
  const { name, phone, status, campaign_id, extracted_data } = req.body;
  const tenantId = req.user.tenant_id;
  if (!String(name || '').trim() || !/^\+?[0-9\s()-]{8,20}$/.test(String(phone || ''))) {
    return res.status(400).json({ error: 'A contact name and valid phone number are required' });
  }
  if (campaign_id) {
    const campaignExists = turso
      ? (await turso.execute({ sql: 'SELECT id FROM campaigns WHERE id = ? AND tenant_id = ?', args: [campaign_id, tenantId] })).rows.length > 0
      : Boolean(db.prepare('SELECT id FROM campaigns WHERE id = ? AND tenant_id = ?').get(campaign_id, tenantId));
    if (!campaignExists) return res.status(400).json({ error: 'Campaign not found in this workspace' });
  }
  const id = `lead_${crypto.randomUUID()}`;

  if (turso) {
    try {
      await turso.execute({
        sql: `INSERT INTO leads (id, tenant_id, name, phone, status, campaign_id, extracted_data)
              VALUES (?, ?, ?, ?, ?, ?, ?)`,
        args: [id, tenantId, name.trim(), String(phone).trim(), status || 'pending', campaign_id || null, JSON.stringify(extracted_data || {})]
      });
      return res.json({ success: true, id });
    } catch (error) {
      console.error('[Turso Lead Create Error]:', error.message);
      return res.status(503).json({ error: 'Lead could not be saved.' });
    }
  }

  db.prepare(`
    INSERT INTO leads (id, tenant_id, name, phone, status, campaign_id, extracted_data)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(id, tenantId, name.trim(), String(phone).trim(), status || 'pending', campaign_id || null, JSON.stringify(extracted_data || {}));

  res.json({ success: true, id });
});

// All Conversations & Call Logs
app.get('/api/calls', authenticateToken, (req, res) => {
  if (turso) {
    return turso.execute({ sql: 'SELECT * FROM calls WHERE tenant_id = ? ORDER BY created_at DESC LIMIT 500', args: [req.user.tenant_id] })
      .then(result => res.json(result.rows.map(call => ({
        ...call,
        captured: typeof call.captured === 'string' ? JSON.parse(call.captured || '{}') : (call.captured || {}),
        transcript: call.transcript ? (typeof call.transcript === 'string' ? JSON.parse(call.transcript) : call.transcript) : []
      }))))
      .catch(error => {
        console.error('[Turso Calls Fetch Error]:', error.message);
        res.status(503).json({ error: 'Conversations are temporarily unavailable.' });
      });
  }
  const calls = db.prepare('SELECT * FROM calls WHERE tenant_id = ? ORDER BY created_at DESC').all(req.user.tenant_id);
  res.json(calls.map(c => ({
    ...c,
    captured: typeof c.captured === 'string' ? JSON.parse(c.captured || '{}') : (c.captured || {}),
    transcript: c.transcript ? JSON.parse(c.transcript) : []
  })));
});

// Real-Time Dashboard Summary (Strictly Real Metrics, Zero Fake Data)
app.get('/api/dashboard-summary', authenticateToken, async (req, res) => {
  try {
    const range = ['today', '7d', '30d'].includes(req.query.range) ? req.query.range : '7d';
    const tenantId = req.user.tenant_id;
    const rangeDays = range === 'today' ? 1 : range === '30d' ? 30 : 7;
    const rangeStart = new Date();
    if (range === 'today') rangeStart.setHours(0, 0, 0, 0);
    else rangeStart.setDate(rangeStart.getDate() - (rangeDays - 1));
    const rangeStartIso = new Date(rangeStart.getTime() - rangeStart.getTimezoneOffset() * 60000)
      .toISOString().slice(0, 19).replace('T', ' ');
    const callAggregateSql = `
      SELECT COUNT(*) AS total_calls,
        SUM(CASE WHEN COALESCE(duration_seconds, 0) > 0 THEN 1 ELSE 0 END) AS answered_calls,
        COALESCE(SUM(COALESCE(duration_seconds, 0)), 0) AS total_duration_seconds,
        COUNT(DISTINCT CASE WHEN COALESCE(duration_seconds, 0) > 0
          THEN COALESCE(NULLIF(phone, ''), contact_name) END) AS unique_customers
      FROM calls WHERE tenant_id = ? AND created_at >= ?
    `;
    const recentCallsSql = 'SELECT * FROM calls WHERE tenant_id = ? AND created_at >= ? ORDER BY created_at DESC LIMIT 50';
    const trendSql = `
      SELECT substr(created_at, 1, 10) AS day, COUNT(*) AS count
      FROM calls WHERE tenant_id = ? AND created_at >= ?
      GROUP BY substr(created_at, 1, 10)
    `;
    const hourSql = `
      SELECT CAST(strftime('%H', created_at) AS INTEGER) / 3 * 3 AS hour_bucket, COUNT(*) AS count
      FROM calls WHERE tenant_id = ? AND created_at >= ?
      GROUP BY hour_bucket
    `;
    const channelSql = `
      SELECT COALESCE(NULLIF(channel, ''), NULLIF(direction, ''), 'Other') AS name, COUNT(*) AS count
      FROM calls WHERE tenant_id = ? AND created_at >= ?
      GROUP BY name ORDER BY count DESC
    `;
    let aggregate;
    let employeeCount;
    let qualifiedLeads;
    let billing;
    let dayRows;
    let hourRows;
    let channelRows;
    let recentCalls;
    if (turso) {
      const [aggregateResult, employeeResult, qualifiedResult, billingResult, dayResult, hourResult, channelResult, recentResult] = await Promise.all([
        turso.execute({ sql: callAggregateSql, args: [tenantId, rangeStartIso] }),
        turso.execute({ sql: "SELECT COUNT(*) AS count FROM employees WHERE tenant_id = ? AND status IN ('active', 'ready')", args: [tenantId] }),
        turso.execute({ sql: "SELECT COUNT(*) AS count FROM leads WHERE tenant_id = ? AND status = 'qualified' AND created_at >= ?", args: [tenantId, rangeStartIso] }),
        turso.execute({ sql: 'SELECT COALESCE(SUM(balance_credits), 0) AS balance_credits, MAX(rate_standard) AS rate_standard FROM billing WHERE tenant_id = ?', args: [tenantId] }),
        turso.execute({ sql: trendSql, args: [tenantId, rangeStartIso] }),
        turso.execute({ sql: hourSql, args: [tenantId, rangeStartIso] }),
        turso.execute({ sql: channelSql, args: [tenantId, rangeStartIso] }),
        turso.execute({ sql: recentCallsSql, args: [tenantId, rangeStartIso] })
      ]);
      aggregate = aggregateResult.rows[0] || {};
      employeeCount = employeeResult.rows[0]?.count || 0;
      qualifiedLeads = qualifiedResult.rows[0]?.count || 0;
      billing = billingResult.rows[0] || { balance_credits: 0, rate_standard: 5 };
      dayRows = dayResult.rows;
      hourRows = hourResult.rows;
      channelRows = channelResult.rows;
      recentCalls = recentResult.rows;
    } else {
      aggregate = db.prepare(callAggregateSql).get(tenantId, rangeStartIso) || {};
      employeeCount = db.prepare("SELECT COUNT(*) AS count FROM employees WHERE tenant_id = ? AND status IN ('active', 'ready')").get(tenantId).count;
      qualifiedLeads = db.prepare("SELECT COUNT(*) AS count FROM leads WHERE tenant_id = ? AND status = 'qualified' AND created_at >= ?").get(tenantId, rangeStartIso).count;
      billing = db.prepare('SELECT COALESCE(SUM(balance_credits), 0) AS balance_credits, MAX(rate_standard) AS rate_standard FROM billing WHERE tenant_id = ?').get(tenantId) || { balance_credits: 0, rate_standard: 5 };
      dayRows = db.prepare(trendSql).all(tenantId, rangeStartIso);
      hourRows = db.prepare(hourSql).all(tenantId, rangeStartIso);
      channelRows = db.prepare(channelSql).all(tenantId, rangeStartIso);
      recentCalls = db.prepare(recentCallsSql).all(tenantId, rangeStartIso);
    }
    const totalCalls = Number(aggregate.total_calls || 0);
    const answeredCalls = Number(aggregate.answered_calls || 0);
    const totalDurationSec = Number(aggregate.total_duration_seconds || 0);
    const avgDurationSec = answeredCalls > 0 ? Math.round(totalDurationSec / answeredCalls) : 0;
    const uniquePhones = Number(aggregate.unique_customers || 0);
    const workAutomatedMin = Math.ceil(totalDurationSec / 60);
    const ratePerMinute = Number(billing.rate_standard) > 0 ? Number(billing.rate_standard) : 5;
    const minutesLeft = Math.floor(Math.max(0, Number(billing.balance_credits) || 0) / ratePerMinute);
    const dayCounts = new Map(dayRows.map(row => [row.day, Number(row.count) || 0]));
    const days = Array.from({ length: rangeDays }, (_, index) => {
      const date = new Date(rangeStart);
      date.setDate(rangeStart.getDate() + index);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      return { date: key.slice(5), count: dayCounts.get(key) || 0 };
    });
    const hourCounts = new Map(hourRows.map(row => [Number(row.hour_bucket), Number(row.count) || 0]));
    const busiestHours = Array.from({ length: 8 }, (_, index) => {
      const hour = index * 3;
      return { hour: `${String(hour).padStart(2, '0')}:00`, count: hourCounts.get(hour) || 0 };
    });
    const channels = channelRows.map(row => {
      const count = Number(row.count) || 0;
      return { name: row.name, count, percentage: totalCalls ? Math.round(count / totalCalls * 100) : 0 };
    });
    const busiest = [...busiestHours].sort((a, b) => b.count - a.count)[0];

    res.json({
      totalCalls: totalCalls,
      qualifiedLeads,
      summary: {
        handledConversations: totalCalls,
        unansweredCalls: Math.max(0, totalCalls - answeredCalls),
        workAutomatedMin: workAutomatedMin,
        activeEmployeesCount: Number(employeeCount) || 0,
        minutesLeft: minutesLeft,
        conversationsLeft: minutesLeft
      },
      atAGlance: {
        callsHandled: totalCalls,
        customersReached: answeredCalls,
        qualified: qualifiedLeads,
        talkTimeFormatted: `${workAutomatedMin} min`,
        avgConversationFormatted: `${avgDurationSec}s`,
        customersServed: uniquePhones
      },
      trends: {
        callsOverTime: days,
        busiestHours,
        channels
      },
      insights: totalCalls ? [
        busiest?.count ? `Busiest period was ${busiest.hour} (${busiest.count} calls).` : 'Call activity is distributed across the selected period.',
        channels[0] ? `Most conversations came through ${channels[0].name} (${channels[0].count}).` : 'No channel data is available yet.'
      ] : ['No calls in the selected period.', 'Channel insights appear after the first call.'],
      recentCalls: recentCalls.map(c => ({
        ...c,
        captured: typeof c.captured === 'string'
          ? (() => { try { return JSON.parse(c.captured || '{}'); } catch { return {}; } })()
          : (c.captured || {})
      }))
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Fast Transcriber API powered by Groq Whisper Turbo (Telugu, Tamil, Hindi, English)
app.post('/api/transcribe', authenticateToken, async (req, res) => {
  try {
    const { audioBase64, language = 'en', mimeType = 'audio/webm' } = req.body;
    if (!audioBase64) {
      return res.status(400).json({ error: 'audioBase64 is required' });
    }

    const buffer = Buffer.from(audioBase64.replace(/^data:audio\/\w+;base64,/, ''), 'base64');
    const langCode = (language || 'en').slice(0, 2).toLowerCase(); // 'te', 'ta', 'hi', 'en'

    const formData = new FormData();
    const blob = new Blob([buffer], { type: mimeType });
    formData.append('file', blob, 'audio.webm');
    formData.append('model', 'whisper-large-v3-turbo');
    formData.append('language', langCode);
    formData.append('temperature', '0');

    const groqKey = process.env.GROQ_API_KEY;
    if (!groqKey) return res.status(503).json({ error: 'Transcription service is not configured.' });
    const startTime = Date.now();
    const response = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqKey}`
      },
      body: formData
    });

    const latency = Date.now() - startTime;
    if (!response.ok) {
      const errText = await response.text();
      console.warn('[Transcribe] Groq Whisper error:', errText);
      return res.status(response.status).json({ error: errText });
    }

    const data = await response.json();
    res.json({
      text: data.text || '',
      latencyMs: latency,
      model: 'whisper-large-v3-turbo',
      language: langCode
    });
  } catch (err) {
    console.error('[Transcribe] Server error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Phone Numbers (Real Sarvam Telephony lines & KYC Carrier Orders)
app.get('/api/phone-numbers', authenticateToken, async (req, res) => {
  try {
    const tenantId = req.user.tenant_id;
    if (turso) {
      const tRes = await turso.execute({ sql: 'SELECT * FROM phone_numbers WHERE tenant_id = ? ORDER BY purchased_at DESC', args: [tenantId] });
      return res.json(tRes.rows || []);
    }
    const numbers = db.prepare('SELECT * FROM phone_numbers WHERE tenant_id = ? ORDER BY purchased_at DESC').all(tenantId);
    return res.json(numbers);
  } catch (err) {
    console.warn('[Turso Phone Numbers Fetch Error]:', err.message);
    return res.status(503).json({ error: 'Phone-number inventory is temporarily unavailable.' });
  }
});

app.post('/api/phone-numbers/buy', authenticateToken, async (req, res) => {
  return res.status(503).json({ error: 'Carrier ordering is not connected. No number was purchased and no credits were charged.' });
});

// Knowledge Base (Train Employees RAG)
app.get('/api/knowledge-base', authenticateToken, async (req, res) => {
  const tenantId = req.user.tenant_id;
  try {
    const rows = turso
      ? (await turso.execute({ sql: 'SELECT * FROM knowledge_base WHERE tenant_id = ? ORDER BY created_at DESC', args: [tenantId] })).rows
      : db.prepare('SELECT * FROM knowledge_base WHERE tenant_id = ? ORDER BY created_at DESC').all(tenantId);
    res.json(rows);
  } catch (error) {
    console.error('[Knowledge Base Fetch Error]:', error.message);
    res.status(503).json({ error: 'Knowledge base is temporarily unavailable.' });
  }
});

app.post('/api/knowledge-base', authenticateToken, async (req, res) => {
  const { title, content, employee_id, category } = req.body;
  const tenantId = req.user.tenant_id;
  if (!String(title || '').trim() || !String(content || '').trim()) return res.status(400).json({ error: 'Title and content are required.' });
  const id = `kb_${crypto.randomUUID()}`;
  try {
    if (employee_id) {
      const employee = turso
        ? (await turso.execute({ sql: 'SELECT id FROM employees WHERE id = ? AND tenant_id = ?', args: [employee_id, tenantId] })).rows[0]
        : db.prepare('SELECT id FROM employees WHERE id = ? AND tenant_id = ?').get(employee_id, tenantId);
      if (!employee) return res.status(404).json({ error: 'Employee not found in this workspace.' });
    }
    if (turso) {
      await turso.execute({ sql: 'INSERT INTO knowledge_base (id, tenant_id, title, content, employee_id, category) VALUES (?, ?, ?, ?, ?, ?)', args: [id, tenantId, title.trim(), content, employee_id || null, category || 'faq'] });
    } else {
      db.prepare('INSERT INTO knowledge_base (id, tenant_id, title, content, employee_id, category) VALUES (?, ?, ?, ?, ?, ?)').run(id, tenantId, title.trim(), content, employee_id || null, category || 'faq');
    }
    res.json({ success: true, id });
  } catch (error) {
    console.error('[Knowledge Base Save Error]:', error.message);
    res.status(503).json({ error: 'Knowledge base item could not be saved.' });
  }
});

// Billing & Credits
app.get('/api/billing', authenticateToken, async (req, res) => {
  const tenantId = req.user.tenant_id;
  try {
    const billing = turso
      ? (await turso.execute({ sql: 'SELECT * FROM billing WHERE tenant_id = ?', args: [tenantId] })).rows[0]
      : db.prepare('SELECT * FROM billing WHERE tenant_id = ?').get(tenantId);
    const row = billing || { id: `b_${tenantId}`, tenant_id: tenantId, balance_credits: 0, balance_inr: 0, rate_standard: 5, rate_premium: 6.8, rate_enterprise: 3.5 };
    res.json({ ...row, balance_credits: sanitizeBalance(row.balance_credits), balance_inr: sanitizeBalance(row.balance_inr) });
  } catch (error) {
    console.error('[Billing Fetch Error]:', error.message);
    res.status(503).json({ error: 'Billing data is temporarily unavailable.' });
  }
});

app.get('/api/billing/config', (req, res) => {
  res.json({ keyId: process.env.RAZORPAY_KEY_ID || null, currency: 'INR', companyName: 'Sarvam Voice AI', themeColor: '#0f0e17' });
});

app.get('/api/performance', authenticateToken, async (req, res) => {
  try {
    const tenantId = req.user.tenant_id;
    const range = req.query.range || '7d';
    const rangeDays = { '24h': 1, '7d': 7, '30d': 30 };
    if (range !== 'all' && !Object.hasOwn(rangeDays, range)) {
      return res.status(400).json({ error: 'Range must be 24h, 7d, 30d, or all.' });
    }
    const [callResult, leadResult] = turso
      ? await Promise.all([
          turso.execute({ sql: 'SELECT status, duration_seconds, cost, created_at FROM calls WHERE tenant_id = ? ORDER BY created_at DESC LIMIT 10000', args: [tenantId] }),
          turso.execute({ sql: 'SELECT status, created_at FROM leads WHERE tenant_id = ? ORDER BY created_at DESC LIMIT 10000', args: [tenantId] })
        ])
      : [
          { rows: db.prepare('SELECT status, duration_seconds, cost, created_at FROM calls WHERE tenant_id = ? ORDER BY created_at DESC LIMIT 10000').all(tenantId) },
          { rows: db.prepare('SELECT status, created_at FROM leads WHERE tenant_id = ? ORDER BY created_at DESC LIMIT 10000').all(tenantId) }
        ];
    const rangeStart = range === 'all' ? null : Date.now() - rangeDays[range] * 24 * 60 * 60 * 1000;
    const inRange = row => rangeStart === null || new Date(row.created_at).getTime() >= rangeStart;
    const calls = (callResult.rows || []).filter(inRange);
    const leads = (leadResult.rows || []).filter(inRange);
    const answered = calls.filter(call => Number(call.duration_seconds) > 0);
    const totalSeconds = calls.reduce((sum, call) => sum + (Number(call.duration_seconds) || 0), 0);
    const totalCost = calls.reduce((sum, call) => sum + (Number(call.cost) || 0), 0);
    const qualified = leads.filter(lead => lead.status === 'qualified').length;
    const dailyVolume = Array.from({ length: 7 }, (_, index) => {
      const date = new Date();
      date.setDate(date.getDate() - 6 + index);
      date.setHours(0, 0, 0, 0);
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);
      const onDate = calls.filter(call => { const timestamp = new Date(call.created_at); return timestamp >= date && timestamp < nextDate; });
      return { day: date.toLocaleDateString('en-US', { weekday: 'short' }), calls: onDate.length, answered: onDate.filter(call => Number(call.duration_seconds) > 0).length };
    });
    const hourFormatter = new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      hourCycle: 'h23',
      timeZone: 'Asia/Kolkata'
    });
    const callsByHour = new Map();
    for (const call of calls) {
      const hour = Number(hourFormatter.format(new Date(call.created_at)));
      if (hour < 9 || hour > 21) continue;
      const hourCalls = callsByHour.get(hour) || [];
      hourCalls.push(call);
      callsByHour.set(hour, hourCalls);
    }
    const hourlyDistribution = Array.from({ length: 13 }, (_, index) => {
      const hour = index + 9;
      const hourCalls = callsByHour.get(hour) || [];
      const hourAnswered = hourCalls.filter(call => Number(call.duration_seconds) > 0).length;
      return {
        hour: `${String(hour).padStart(2, '0')}:00`,
        calls: hourCalls.length,
        rate: hourCalls.length ? `${(hourAnswered / hourCalls.length * 100).toFixed(1)}%` : '0%'
      };
    });
    const unanswered = calls.length - answered.length;
    res.json({
      summary: {
        totalCalls: calls.length,
        answerRate: calls.length ? `${(answered.length / calls.length * 100).toFixed(1)}%` : '0%',
        totalTalkTimeHours: (totalSeconds / 3600).toFixed(1),
        avgDurationSec: answered.length ? Math.round(totalSeconds / answered.length) : 0,
        qualifiedRate: leads.length ? `${(qualified / leads.length * 100).toFixed(1)}%` : '0%',
        totalCost: totalCost.toFixed(2),
        avgCostPerCall: calls.length ? `₹${(totalCost / calls.length).toFixed(2)}` : '₹0.00'
      },
      dailyVolume,
      hourlyDistribution,
      funnel: [
        { stage: 'Dialed', count: calls.length, pct: calls.length ? '100%' : '0%' },
        { stage: 'Answered', count: answered.length, pct: calls.length ? `${(answered.length / calls.length * 100).toFixed(1)}%` : '0%' },
        { stage: 'Not answered', count: unanswered, pct: calls.length ? `${(unanswered / calls.length * 100).toFixed(1)}%` : '0%' },
        { stage: 'Qualified leads', count: qualified, pct: calls.length ? `${(qualified / calls.length * 100).toFixed(1)}%` : '0%' }
      ],
      dispositions: [
        { label: 'Answered', count: answered.length, pct: calls.length ? Number((answered.length / calls.length * 100).toFixed(1)) : 0, color: 'bg-emerald-500' },
        { label: 'Not answered', count: unanswered, pct: calls.length ? Number((unanswered / calls.length * 100).toFixed(1)) : 0, color: 'bg-gray-400' }
      ]
    });
  } catch (error) {
    console.error('[Performance Fetch Error]:', error.message);
    res.status(503).json({ error: 'Performance data is temporarily unavailable.' });
  }
});

// Create Live Razorpay Order
app.post('/api/billing/create-order', authenticateToken, async (req, res) => {
  try {
    if (!razorpay) return res.status(503).json({ error: 'Payments are not configured' });
    const { amount, planName } = req.body;
    const requestedAmount = Number(amount);
    const baseAmount = requestedAmount;
    const creditAmount = requestedAmount;
    if (!Number.isSafeInteger(baseAmount) || baseAmount < 100 || baseAmount > 100000) {
      return res.status(400).json({ error: 'Choose a top-up amount between ₹100 and ₹100,000' });
    }

    // Standard 18% GST calculation (Input Tax Credit eligible)
    const totalWithGst = Math.round(baseAmount * 1.18);
    const amountInPaise = Math.round(totalWithGst * 100);

    const receipt = `rcpt_${Date.now().toString().slice(-8)}`;
    const options = {
      amount: amountInPaise,
      currency: 'INR',
      receipt: receipt,
      notes: {
        planId: 'custom',
        planName: String(planName || 'Credits Top-Up'),
        baseAmount: String(baseAmount),
        credits: String(creditAmount),
        bonusCredits: '0'
      }
    };

    const order = await razorpay.orders.create(options);
    const tenantId = req.user.tenant_id;
    if (turso) {
      await turso.execute({
        sql: `INSERT INTO payment_orders (order_id, tenant_id, amount_paise, base_amount, credits, bonus_credits, plan_id, status)
              VALUES (?, ?, ?, ?, ?, ?, ?, 'created')`,
        args: [order.id, tenantId, order.amount, baseAmount, creditAmount, 0, 'custom']
      });
    } else {
      db.prepare(`INSERT INTO payment_orders (order_id, tenant_id, amount_paise, base_amount, credits, bonus_credits, plan_id, status)
                  VALUES (?, ?, ?, ?, ?, ?, ?, 'created')`)
        .run(order.id, tenantId, order.amount, baseAmount, creditAmount, 0, 'custom');
    }
    console.log(`[Razorpay] Created live order ${order.id} for ₹${totalWithGst} (${amountInPaise} paise)`);
    res.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
      receipt: order.receipt
    });
  } catch (err) {
    console.error('[Razorpay] Order creation error:', err);
    res.status(500).json({
      error: 'Failed to initiate Razorpay order',
      details: err.message
    });
  }
});

// Cryptographically Verify Razorpay Signature and Credit Wallet
app.post('/api/billing/verify-payment', authenticateToken, async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ error: 'Missing Razorpay signature verification parameters' });
    }

    if (!razorpay || !process.env.RAZORPAY_KEY_SECRET) {
      return res.status(503).json({ error: 'Payments are not configured' });
    }
    const secret = process.env.RAZORPAY_KEY_SECRET;
    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      console.error('[Razorpay] Signature mismatch for order:', razorpay_order_id);
      return res.status(400).json({
        success: false,
        verified: false,
        error: 'Razorpay payment signature verification failed. Untrusted request.'
      });
    }

    // Payment authentic & verified!
    // Fetch the authoritative order amount from Razorpay (do not trust client-supplied credits)
    let order;
    try {
      order = await razorpay.orders.fetch(razorpay_order_id);
    } catch (fetchErr) {
      console.error('[Razorpay] Authoritative order lookup failed:', fetchErr.message);
      return res.status(502).json({ error: 'Could not verify payment order; no credits were applied' });
    }
    if (!order || order.id !== razorpay_order_id || order.status !== 'paid' || order.currency !== 'INR') {
      return res.status(400).json({ error: 'Payment order is not paid or could not be verified' });
    }

    const paidAmountINR = order.amount / 100;
    const tenantId = req.user.tenant_id;
    let paymentOrder;
    if (turso) {
      const storedOrder = await turso.execute({ sql: 'SELECT * FROM payment_orders WHERE order_id = ? AND tenant_id = ?', args: [razorpay_order_id, tenantId] });
      paymentOrder = storedOrder.rows[0];
    } else {
      paymentOrder = db.prepare('SELECT * FROM payment_orders WHERE order_id = ? AND tenant_id = ?').get(razorpay_order_id, tenantId);
    }
    if (!paymentOrder || paymentOrder.status !== 'created') {
      return res.status(409).json({ error: 'Payment order is not available for this workspace or was already credited' });
    }
    const noteBaseAmount = Number(paymentOrder.base_amount);
    const noteCredits = Number(paymentOrder.credits);
    const expectedTotalPaise = Math.round(noteBaseAmount * 1.18 * 100);
    if (!Number.isFinite(noteBaseAmount) || !Number.isFinite(noteCredits) || noteCredits < noteBaseAmount || order.amount !== expectedTotalPaise) {
      return res.status(400).json({ error: 'Payment order does not match a valid server-authorized package' });
    }
    const topupAmount = noteBaseAmount;
    const payment = await razorpay.payments.fetch(razorpay_payment_id);
    if (!payment || payment.order_id !== order.id || payment.status !== 'captured' || payment.amount !== order.amount) {
      return res.status(400).json({ error: 'Captured payment does not match the verified order' });
    }
    // This is the server-owned conversion policy; order notes are not trusted for credit amounts.
    const creditsToAdd = noteCredits;

    // 1. Credit wallet in database for the authenticated tenant
    const txId = `razorpay_${razorpay_payment_id}`;
    const invoiceId = `INV-${Date.now().toString().slice(-6)}`;
    if (turso) {
      let tx;
      try {
        tx = await turso.transaction('write');
        const existingPayment = await tx.execute({ sql: 'SELECT payment_id FROM payment_orders WHERE order_id = ?', args: [razorpay_order_id] });
        if (existingPayment.rows[0]?.payment_id) {
          await tx.rollback();
          return res.status(409).json({ error: 'This payment has already been credited' });
        }
        await tx.execute({ sql: `INSERT OR IGNORE INTO billing (id, tenant_id, balance_credits, balance_inr) VALUES (?, ?, 0, 0)`, args: [`b_${tenantId}`, tenantId] });
        await tx.execute({ sql: 'UPDATE billing SET balance_credits = balance_credits + ?, balance_inr = balance_inr + ? WHERE tenant_id = ?', args: [creditsToAdd, topupAmount, tenantId] });
        await tx.execute({
          sql: `INSERT INTO transactions (id, tenant_id, type, amount, credits, description, invoice_id, status) VALUES (?, ?, 'topup', ?, ?, ?, ?, 'success')`,
          args: [txId, tenantId, topupAmount, creditsToAdd, `Credits Top-Up (Razorpay: ${razorpay_payment_id})`, invoiceId]
        });
        await tx.execute({ sql: `UPDATE payment_orders SET status = 'credited', payment_id = ? WHERE order_id = ? AND tenant_id = ?`, args: [razorpay_payment_id, razorpay_order_id, tenantId] });
        await tx.commit();
      } catch (ledgerError) {
        if (tx) await tx.rollback().catch(() => {});
        throw ledgerError;
      }
      const updated = await turso.execute({ sql: 'SELECT * FROM billing WHERE tenant_id = ?', args: [tenantId] });
      const updatedBilling = updated.rows[0];
      return res.json({ success: true, verified: true, paymentId: razorpay_payment_id, orderId: razorpay_order_id, invoiceId, creditsAdded: creditsToAdd, newBalance: updatedBilling?.balance_credits, billing: updatedBilling });
    }
    db.exec('BEGIN IMMEDIATE');
    try {
      const priorTransaction = db.prepare('SELECT id FROM transactions WHERE id = ?').get(txId);
      if (priorTransaction) {
        db.exec('ROLLBACK');
        return res.status(409).json({ error: 'This payment has already been credited' });
      }

      const existingRow = db.prepare('SELECT id FROM billing WHERE tenant_id = ?').get(tenantId);
      if (existingRow) {
        db.prepare('UPDATE billing SET balance_credits = balance_credits + ?, balance_inr = balance_inr + ? WHERE tenant_id = ?').run(
          creditsToAdd, topupAmount, tenantId
        );
      } else {
        db.prepare('INSERT INTO billing (id, tenant_id, balance_credits, balance_inr) VALUES (?, ?, ?, ?)')
          .run(`b_${tenantId}`, tenantId, creditsToAdd, topupAmount);
      }
      const desc = `Credits Top-Up (Razorpay: ${razorpay_payment_id})`;

      db.prepare(`
        INSERT INTO transactions (id, tenant_id, type, amount, credits, description, invoice_id, status)
        VALUES (?, ?, 'topup', ?, ?, ?, ?, 'success')
      `).run(txId, tenantId, topupAmount, creditsToAdd, desc, invoiceId);
      db.exec('COMMIT');
    } catch (ledgerError) {
      db.exec('ROLLBACK');
      throw ledgerError;
    }

    const updatedBilling = db.prepare('SELECT * FROM billing WHERE tenant_id = ?').get(tenantId)
      || db.prepare("SELECT * FROM billing WHERE id = 'b-1'").get();

    console.log(`[Razorpay] Successfully verified and credited ${creditsToAdd} credits for payment ${razorpay_payment_id}`);
    res.json({
      success: true,
      verified: true,
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
      invoiceId: invoiceId,
      creditsAdded: creditsToAdd,
      newBalance: updatedBilling?.balance_credits,
      billing: updatedBilling
    });
  } catch (err) {
    console.error('[Razorpay] Payment verification error:', err);
    res.status(500).json({ error: 'Internal payment verification error', details: err.message });
  }
});

// Razorpay Webhook Endpoint
app.post('/api/billing/webhook', (req, res) => {
  return res.status(503).json({ error: 'Webhook processing is not configured' });
});

app.post('/api/billing/topup', authenticateToken, (req, res) => {
  return res.status(410).json({ error: 'Direct wallet top-ups are disabled; use verified payment checkout.' });
});

app.get('/api/billing/transactions', authenticateToken, (req, res) => {
  const tenantId = req.user.tenant_id;
  if (turso) return turso.execute({ sql: 'SELECT * FROM transactions WHERE tenant_id = ? ORDER BY created_at DESC LIMIT 500', args: [tenantId] })
    .then(result => res.json(result.rows)).catch(() => res.status(503).json({ error: 'Transactions are temporarily unavailable.' }));
  const txs = db.prepare('SELECT * FROM transactions WHERE tenant_id = ? ORDER BY created_at DESC LIMIT 500').all(tenantId);
  res.json(txs);
});

app.get('/api/billing/usage', authenticateToken, (req, res) => {
  const tenantId = req.user.tenant_id;
  if (turso) return turso.execute({ sql: 'SELECT COUNT(*) as count, SUM(duration_seconds) as total_seconds, SUM(cost) as total_cost FROM calls WHERE tenant_id = ?', args: [tenantId] })
    .then(result => {
      const calls = result.rows[0] || {};
      res.json({ totalCalls: Number(calls.count || 0), totalMinutes: Math.ceil(Number(calls.total_seconds || 0) / 60), totalSpent: Number(calls.total_cost || 0), avgCallLength: Number(calls.count) > 0 ? `${Math.floor((Number(calls.total_seconds) / Number(calls.count)) / 60)}:${String(Math.floor((Number(calls.total_seconds) / Number(calls.count)) % 60)).padStart(2, '0')}` : '0:00' });
    }).catch(() => res.status(503).json({ error: 'Usage data is temporarily unavailable.' }));
  const calls = db.prepare('SELECT COUNT(*) as count, SUM(duration_seconds) as total_seconds, SUM(cost) as total_cost FROM calls WHERE tenant_id = ?').get(tenantId);
  res.json({
    totalCalls: calls.count || 0,
    totalMinutes: Math.ceil((calls.total_seconds || 0) / 60),
    totalSpent: calls.total_cost || 0,
    avgCallLength: calls.count > 0 ? `${Math.floor((calls.total_seconds / calls.count) / 60)}:${String((calls.total_seconds / calls.count) % 60).padStart(2, '0')}` : "0:00"
  });
});

// Do Not Call (DND) Registry
app.get('/api/dnc', authenticateToken, (req, res) => {
  const tenantId = req.user.tenant_id;
  if (turso) return turso.execute({ sql: 'SELECT * FROM dnc_registry WHERE tenant_id = ? ORDER BY added_at DESC', args: [tenantId] })
    .then(result => res.json(result.rows)).catch(() => res.status(503).json({ error: 'DNC list is temporarily unavailable.' }));
  const dncList = db.prepare('SELECT * FROM dnc_registry WHERE tenant_id = ? ORDER BY added_at DESC').all(tenantId);
  res.json(dncList);
});

app.post('/api/dnc', authenticateToken, async (req, res) => {
  const { phone, reason } = req.body;
  if (!String(phone || '').trim()) return res.status(400).json({ error: 'Phone is required.' });
  const tenantId = req.user.tenant_id;
  const id = `dnc_${crypto.randomUUID()}`;

  if (turso) {
    await turso.execute({ sql: 'INSERT INTO dnc_registry (id, tenant_id, phone, reason) VALUES (?, ?, ?, ?)', args: [id, tenantId, phone.trim(), reason || 'Customer opt-out'] });
    return res.json({ success: true, id });
  }

  db.prepare('INSERT INTO dnc_registry (id, tenant_id, phone, reason) VALUES (?, ?, ?, ?)').run(id, tenantId, phone.trim(), reason || 'Customer opt-out');
  res.json({ success: true, id });
});

app.delete('/api/dnc/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const tenantId = req.user.tenant_id;
  if (turso) {
    const result = await turso.execute({ sql: 'DELETE FROM dnc_registry WHERE id = ? AND tenant_id = ?', args: [id, tenantId] });
    return res.json({ success: true, deleted: Number(result.rowsAffected || 0) > 0 });
  }
  const result = db.prepare('DELETE FROM dnc_registry WHERE id = ? AND tenant_id = ?').run(id, tenantId);
  res.json({ success: true, deleted: result.changes > 0 });
});

// Developer API Webhook Ping Test
app.post('/api/developers/test-webhook', authenticateToken, (req, res) => {
  return res.status(503).json({ error: 'Webhook delivery is not implemented; no request was sent.' });
});

// Settings & Profile
app.get('/api/settings', authenticateToken, (req, res) => {
  const tenantId = req.user.tenant_id;
  if (turso) return turso.execute({ sql: 'SELECT key, value FROM tenant_settings WHERE tenant_id = ?', args: [tenantId] })
    .then(result => res.json(Object.fromEntries(result.rows.map(row => [row.key, row.value]))))
    .catch(() => res.status(503).json({ error: 'Settings are temporarily unavailable.' }));
  const settingsRows = db.prepare('SELECT key, value FROM tenant_settings WHERE tenant_id = ?').all(tenantId);
  const settings = {};
  for (const row of settingsRows) {
    settings[row.key] = row.value;
  }
  res.json(settings);
});

app.post('/api/settings', authenticateToken, async (req, res) => {
  const tenantId = req.user.tenant_id;
  const updates = req.body;
  if (!updates || typeof updates !== 'object' || Array.isArray(updates)) return res.status(400).json({ error: 'Settings object is required.' });
  if (turso) {
    const tx = await turso.transaction('write');
    try {
      for (const [key, value] of Object.entries(updates)) {
        await tx.execute({ sql: 'INSERT INTO tenant_settings (tenant_id, key, value) VALUES (?, ?, ?) ON CONFLICT(tenant_id, key) DO UPDATE SET value = excluded.value', args: [tenantId, key, String(value)] });
      }
      await tx.commit();
    } catch (error) {
      await tx.rollback().catch(() => {});
      throw error;
    }
    return res.json({ success: true });
  }
  for (const [key, value] of Object.entries(updates)) {
    db.prepare('INSERT INTO tenant_settings (tenant_id, key, value) VALUES (?, ?, ?) ON CONFLICT(tenant_id, key) DO UPDATE SET value = excluded.value').run(tenantId, key, String(value));
  }
  res.json({ success: true });
});

// ==========================================
// WHATSAPP AUTOMATION & BROCHURE CATALOG API
// ==========================================

// Deliver WhatsApp Brochure / Digital Catalog on call closing
app.post('/api/whatsapp/send-brochure', authenticateToken, async (req, res) => {
  try {
    const {
      recipientPhone,
      leadId,
      leadName = 'Customer',
      businessName = 'Sairam Jewellers',
      employeeName = 'Jagan',
      catalogUrl = 'https://sairamjewellers.com/catalog.pdf',
      offerDetails = 'Exclusive zero GST and zero making charges offer'
    } = req.body;

    if (!recipientPhone || !leadId) return res.status(400).json({ error: 'An explicit workspace lead and recipient number are required.' });
    const tenantId = req.user.tenant_id;
    const lead = turso
      ? (await turso.execute({ sql: 'SELECT id, phone, name FROM leads WHERE id = ? AND tenant_id = ?', args: [leadId, tenantId] })).rows[0]
      : db.prepare('SELECT id, phone, name FROM leads WHERE id = ? AND tenant_id = ?').get(leadId, tenantId);
    if (!lead || String(lead.phone).replace(/[\s()-]/g, '') !== String(recipientPhone).replace(/[\s()-]/g, '')) {
      return res.status(404).json({ error: 'Lead/recipient not found in this workspace.' });
    }
    if (!whatsappClient.isLiveConfigured) return res.status(503).json({ error: 'WhatsApp delivery is not configured; no message was sent.' });

    const deliveryResult = await whatsappClient.sendBrochureCatalog({
      recipientPhone,
      leadName,
      businessName,
      employeeName,
      catalogUrl,
      offerDetails
    });

    res.json({
      success: Boolean(deliveryResult.success),
      message: deliveryResult.status === 'sent' ? 'WhatsApp message accepted by provider.' : 'WhatsApp delivery was not confirmed.',
      data: deliveryResult
    });
  } catch (err) {
    console.error('[WhatsApp Send Error]:', err);
    res.status(500).json({ error: err.message });
  }
});

// WhatsApp API Status & Diagnostics
app.get('/api/whatsapp/status', (req, res) => {
  res.json({
    status: whatsappClient.isLiveConfigured ? 'live_meta_cloud_api' : 'not_configured',
    liveConfigured: whatsappClient.isLiveConfigured,
    phoneNumberId: whatsappClient.phoneId ? 'configured' : 'not_configured',
    supportedFeatures: [
      'Interactive Catalog PDF Attachment',
      'Instant Quick Reply Buttons',
      'Pre-approved HSM Template Routing',
      '2-Way Multi-LLM Chat Continuation (Groq/Gemini/Mistral)',
      'Sub-200ms Instant Sandbox Delivery'
    ]
  });
});

// Meta WhatsApp Webhook Verification
app.get('/api/whatsapp/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  const VERIFY_TOKEN = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN;

  if (VERIFY_TOKEN && mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('[WhatsApp Webhook Verified Successfully]');
    return res.status(200).send(challenge);
  }
  return res.sendStatus(403);
});

// Meta WhatsApp Incoming Event & Message Webhook
app.post('/api/whatsapp/webhook', async (req, res) => {
  try {
    const appSecret = process.env.WHATSAPP_APP_SECRET;
    const signature = req.headers['x-hub-signature-256'];
    if (!appSecret || !signature || !req.rawBody) return res.status(401).json({ error: 'Webhook signature verification is not configured.' });
    const expected = `sha256=${crypto.createHmac('sha256', appSecret).update(req.rawBody).digest('hex')}`;
    const expectedBuffer = Buffer.from(expected);
    const suppliedBuffer = Buffer.from(String(signature));
    if (expectedBuffer.length !== suppliedBuffer.length || !crypto.timingSafeEqual(expectedBuffer, suppliedBuffer)) {
      return res.status(401).json({ error: 'Invalid webhook signature.' });
    }
    const body = req.body;
    if (body.object === 'whatsapp_business_account') {
      const entry = body.entry?.[0];
      const changes = entry?.changes?.[0];
      const value = changes?.value;
      const message = value?.messages?.[0];

      if (message) {
        const from = message.from;
        const text = message.text?.body || message.interactive?.button_reply?.title || '';
        console.log(`[WhatsApp Incoming]: From ${from}: "${text}"`);

        // If user tapped "View Catalog" or "Get Directions", respond automatically
        // using our multi-provider LLM manager
      }
      return res.status(200).send('EVENT_RECEIVED');
    }
    return res.sendStatus(404);
  } catch (err) {
    console.error('[WhatsApp Webhook Error]:', err);
    return res.sendStatus(500);
  }
});

// Voice Engine Direct Model Test Endpoints (Sarvam & Cartesia)
app.post('/api/voice/test-sarvam', authenticateToken, async (req, res) => {
  if (!sarvam.apiKey) return res.status(503).json({ error: 'Sarvam speech is not configured.' });
  try {
    const { text, language } = req.body;
    const result = await sarvam.synthesizeSpeech({
      text: text || 'Namaskaram! Nenu Sai Meadows nunchi matladutunnanu.',
      targetLanguageCode: language ? `${language}-IN` : 'te-IN'
    });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/voice/test-cartesia', authenticateToken, async (req, res) => {
  if (!cartesia.apiKey) return res.status(503).json({ error: 'Cartesia speech is not configured.' });
  try {
    const { text, language } = req.body;
    const result = await cartesia.synthesizeSpeech({
      text: text || 'Hello! Thank you for inquiring about our luxury apartments.',
      language: language || 'en'
    });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// SPA Fallback: send index.html for non-API GET requests with cache-busting
app.use((req, res, next) => {
  if (req.method === 'GET' && !req.path.startsWith('/api') && !req.path.startsWith('/ws')) {
    // If the request is for a missing static asset or file, return 404 rather than index.html
    // to prevent MIME type syntax errors in browser dynamic imports
    if (req.path.startsWith('/assets/') || path.extname(req.path)) {
      return res.status(404).type('text/plain').send('Asset not found');
    }

    const indexFile = path.join(distPath, 'index.html');
    if (fs.existsSync(indexFile)) {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      return res.sendFile(indexFile);
    }
  }
  next();
});

const PORT = process.env.PORT || 8080;
const isMainScript = process.argv[1]?.endsWith('server.js') || process.env.IS_DOCKER;

if (isMainScript || !process.env.VERCEL) {
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`[Sarvam Voice Engine] Production Server running on http://0.0.0.0:${PORT}`);
    console.log(`[Sarvam Audio Gateway] WebSocket endpoint active at ws://0.0.0.0:${PORT}/ws`);
  });
}

export default app;
export { app, server };
