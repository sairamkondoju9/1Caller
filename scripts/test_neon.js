import 'dotenv/config';
import pg from 'pg';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error('DATABASE_URL is required to test a Neon connection.');

async function testConnection() {
  const client = new pg.Client({ connectionString });
  try {
    await client.connect();
    const res = await client.query('SELECT version()');
    console.log('Successfully connected to Neon Postgres:');
    console.log(res.rows[0].version);

    // Check existing tables
    const tablesRes = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    console.log('Public tables in Neon DB:', tablesRes.rows.map(r => r.table_name));
    await client.end();
  } catch (err) {
    console.error('Neon connection failed:', err);
  }
}

testConnection();
