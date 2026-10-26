import { db } from './db.js';

// Safe column migrations
try { db.exec("ALTER TABLE calls ADD COLUMN outcome TEXT DEFAULT 'completed'"); } catch (e) {}
try { db.exec("ALTER TABLE calls ADD COLUMN channel TEXT DEFAULT 'Instant'"); } catch (e) {}
try { db.exec("ALTER TABLE calls ADD COLUMN captured TEXT DEFAULT '{}'"); } catch (e) {}
try { db.exec("ALTER TABLE calls ADD COLUMN badge TEXT DEFAULT ''"); } catch (e) {}
try { db.exec("ALTER TABLE calls ADD COLUMN speed_to_lead TEXT DEFAULT '—'"); } catch (e) {}

// 1. Delete all fake QEA calls and old mock calls
db.exec("DELETE FROM calls WHERE id LIKE 'qea%' OR id IN ('call-101', 'call-102')");

// 2. Set up Jagan as the primary AI employee
db.exec("DELETE FROM employees WHERE id = 'emp-jagan' OR id = 'emp-1'");
const jaganSteps = JSON.stringify([
  "Greet warmly and introduce as Jagan from Sairam Jewellers in Jillelaguda",
  "Mention the special Christmas offer: No GST, No Making charges on all Gold and Silver jewellery",
  "Ask what they are looking for (Gold jewellery, Silver, or Diamond)",
  "Offer store visit or send brochure details on WhatsApp"
]);

db.prepare(`
  INSERT INTO employees (id, tenant_id, name, type, primary_language, voice, industry, opening_greeting, prompt_text, call_steps, variables, p50_slo, status)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`).run(
  'emp-jagan',
  'default',
  'Jagan',
  'instant_lead',
  'te',
  'P09 Great Telugu (Cartesia Sonic-2 / Sarvam Bulbul V4)',
  'Jewellery Shop Sales Executive',
  'Namaskaram! Nenu Sairam Jewellers nunchi Jagan matladutunnanu. Ma Christmas offer no GST no making charges gurinchi enquiry chesaru kada?',
  'i have my jewellery shop so we are running offers for this christmas no gst no making charges on all of our jewellery silver and gold located in jillelaguda',
  jaganSteps,
  JSON.stringify(['jewellery_type', 'budget', 'visit_date', 'whatsapp_confirmed']),
  413,
  'ready'
);

// 3. Insert the 3 REAL calls from Outpero screenshot
db.prepare(`
  INSERT OR REPLACE INTO calls (id, tenant_id, employee_id, employee_name, contact_name, phone, direction, channel, status, outcome, sentiment, badge, captured, duration_seconds, cost, speed_to_lead, summary, p50_ms, p95_ms, carrier, created_at)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`).run(
  'call_0537e41c',
  'default',
  'emp-jagan',
  'Jagan',
  'Jagan',
  'Web call',
  'outbound',
  'Instant',
  'completed',
  'Callback',
  'Neutral',
  'Technical Issue',
  '{}',
  0,
  0,
  '—',
  'No summary',
  410,
  820,
  'WebRTC Direct',
  '2026-10-24 17:00:00'
);

db.prepare(`
  INSERT OR REPLACE INTO calls (id, tenant_id, employee_id, employee_name, contact_name, phone, direction, channel, status, outcome, sentiment, badge, captured, duration_seconds, cost, speed_to_lead, summary, p50_ms, p95_ms, carrier, created_at)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`).run(
  'call_8243302c',
  'default',
  'emp-jagan',
  'Jagan',
  '+918919112039',
  '+918919112039',
  'outbound',
  'Instant',
  'completed',
  'Qualified',
  'Neutral',
  'Agent ended the call',
  JSON.stringify({ jewellery_type: 'gold', send_whatsapp: true }),
  90,
  10.20,
  '—',
  'The caller expressed interest in gold jewellery and confirmed WhatsApp details for store visit.',
  413,
  815,
  'Exotel Primary',
  '2026-10-24 16:47:00'
);

db.prepare(`
  INSERT OR REPLACE INTO calls (id, tenant_id, employee_id, employee_name, contact_name, phone, direction, channel, status, outcome, sentiment, badge, captured, duration_seconds, cost, speed_to_lead, summary, p50_ms, p95_ms, carrier, created_at)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`).run(
  'call_6fc9d161',
  'default',
  'emp-jagan',
  'Jagan',
  '+918919112039',
  '+918919112039',
  'outbound',
  'Instant',
  'completed',
  'Voicemail',
  'Neutral',
  'Voicemail',
  JSON.stringify({ jewellery_type: null, budget: null }),
  4,
  3.40,
  '—',
  'Reached voicemail; caller unavailable.',
  412,
  825,
  'Exotel Primary',
  '2026-10-24 16:43:00'
);

// 4. Update billing balance to ₹36.40 (matches 5-6 min left)
db.prepare("UPDATE billing SET balance_credits = 36.40, balance_inr = 36.40 WHERE id = 'b-1'").run();

console.log('Database successfully cleaned and real metrics synchronized!');
console.log('Remaining calls count:', db.prepare('SELECT count(*) as count FROM calls').get().count);
console.log('Calls list:', db.prepare('SELECT id, contact_name, phone, outcome, duration_seconds, cost, created_at FROM calls').all());
console.log('Employees:', db.prepare('SELECT id, name, industry, status FROM employees').all());
