import pg from 'pg';

const { Pool } = pg;

function required(name, value) {
  if (!value) throw new Error(`Missing required env var: ${name}`);
  return value;
}

export function createPool() {
  // Prefer DATABASE_URL if provided (works well with managed Postgres too).
  const connectionString = process.env.DATABASE_URL;
  if (connectionString) {
    return new Pool({
      connectionString,
      ssl: process.env.PGSSLMODE === 'require' ? { rejectUnauthorized: false } : undefined
    });
  }

  // Fallback to discrete PG* vars (nice for local Postgres on the same EC2 box).
  const host = required('PGHOST', process.env.PGHOST);
  const port = Number(process.env.PGPORT || 5432);
  const user = required('PGUSER', process.env.PGUSER);
  const password = required('PGPASSWORD', process.env.PGPASSWORD);
  const database = required('PGDATABASE', process.env.PGDATABASE);

  return new Pool({ host, port, user, password, database });
}

