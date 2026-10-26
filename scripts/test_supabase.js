import pg from 'pg';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import 'dotenv/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function testSupabaseConnection() {
  const databaseUrl = process.env.DATABASE_URL;

  console.log('================================================================');
  console.log('   SUPABASE / POSTGRESQL CONNECTION CHECK                       ');
  console.log('================================================================\n');

  if (!databaseUrl || !databaseUrl.startsWith('postgres')) {
    console.log('[Notice] DATABASE_URL is not configured.');
    console.log('\nTo connect your free Supabase database:');
    console.log('1. Go to https://supabase.com and create a free project (no credit card needed).');
    console.log('2. Navigate to Project Settings -> Database -> Connection String (URI).');
    console.log('3. Set the URI as DATABASE_URL in your local environment or deployment secret settings:');
    console.log("   Set DATABASE_URL via your deployment's secret settings; do not print its value.");
    console.log('4. Run: node scripts/test_supabase.js');
    return;
  }

  console.log('[1/3] Connecting to Supabase Cloud Database at:', databaseUrl.split('@')[1] || 'cluster');
  const pool = new pg.Pool({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false }
  });

  try {
    const tStart = Date.now();
    const res = await pool.query('SELECT NOW() as current_time, version()');
    const latency = Date.now() - tStart;

    console.log(`[PASS] Supabase PostgreSQL Connected in ${latency} ms!`);
    console.log(`[INFO] PostgreSQL Version: ${res.rows[0].version.split('on')[0]}`);

    console.log('\n[2/3] Checking optional schema migration...');
    const schemaSqlPath = path.join(__dirname, 'supabase_schema.sql');
    if (fs.existsSync(schemaSqlPath)) {
      const sql = fs.readFileSync(schemaSqlPath, 'utf8');
      if (process.argv.includes('--apply-schema')) {
        await pool.query(sql);
        console.log('[PASS] Supabase schema applied.');
      } else {
        console.log('[INFO] No schema changes applied. Pass --apply-schema only for an intentional migration.');
      }
    }

    console.log('\n[3/3] Running Query Benchmark...');
    const tenantRes = await pool.query('SELECT * FROM tenants LIMIT 1');
    const callsRes = await pool.query('SELECT COUNT(*) as count FROM calls');
    console.log(`[PASS] Active Tenant: "${tenantRes.rows[0]?.name || 'default'}"`);
    console.log(`[PASS] Total CDR Call Logs: ${callsRes.rows[0]?.count || 0}`);

    console.log('\n================================================================');
    console.log('  STATUS: SUPABASE CONNECTION CHECK COMPLETE                    ');
    console.log('================================================================');
  } catch (err) {
    console.error('\n[ERROR] Supabase connection check failed:', err.message);
    process.exitCode = 1;
    console.log('\nTroubleshooting tips:');
    console.log('1. Ensure your Supabase password does not contain unescaped special characters.');
    console.log('2. Confirm your Supabase project status is Active in the dashboard.');
  } finally {
    await pool.end();
  }
}

testSupabaseConnection();
