import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

/**
 * Builds a valid PostgreSQL connection string.
 * dotenv does NOT expand ${VAR} — use separate DB_* vars or a full DATABASE_URL.
 */
function getDatabaseUrl() {
  const { DATABASE_URL, DB_HOST, DB_USER, DB_PASSWORD, DB_PORT, DB_NAME } = process.env;

  // Use DATABASE_URL only if it is a real URL (not an unexpanded template)
  if (DATABASE_URL && !DATABASE_URL.includes('${')) {
    return DATABASE_URL;
  }

  if (DB_HOST && DB_USER && DB_NAME) {
    const port = DB_PORT || '5432';
    const password = encodeURIComponent(DB_PASSWORD ?? '');
    return `postgresql://${DB_USER}:${password}@${DB_HOST}:${port}/${DB_NAME}`;
  }

  throw new Error(
    'Database not configured. Set DATABASE_URL or DB_HOST, DB_USER, DB_PASSWORD, DB_NAME in .env'
  );
}

/**
 * PostgreSQL connection pool — reuse connections across requests.
 */
const pool = new Pool({
  connectionString: getDatabaseUrl(),
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

pool.on('error', (err) => {
  console.error('Unexpected PostgreSQL pool error:', err);
});

export default pool;
