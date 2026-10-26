import { createClient } from '@libsql/client';

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

async function testTurso() {
  if (!url || !authToken) {
    throw new Error('TURSO_DATABASE_URL and TURSO_AUTH_TOKEN must be configured in the environment.');
  }

  console.log('Connecting to Turso...');
  const client = createClient({ url, authToken });
  try {
    const res = await client.execute('SELECT 1 + 1 as result');
    console.log('Turso Connection SUCCESSFUL!');
    console.log('Result:', res.rows[0]);

    const tables = await client.execute(`
      SELECT name FROM sqlite_schema
      WHERE type='table' AND name NOT LIKE 'sqlite_%'
    `);
    console.log('Current tables in Turso:', tables.rows.map(r => r.name));
  } catch (err) {
    console.error('Turso connection failed:', err.message);
    process.exitCode = 1;
  }
}

testTurso();
