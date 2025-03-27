
import pkg from 'pg';
const {Pool} = pkg;
import { getEnvVar } from './env.server';

let pool;

function getPool() {
  if (!pool) {
    pool = new Pool({
      connectionString: getEnvVar('DATABASE_URL'),
    });
  }
  return pool;
}

export async function query(text: string, params: any[] = []) {
  const client = await getPool().connect();
  try {
    return await client.query(text, params);
  } finally {
    client.release();
  }
}

export async function findOrCreateUser(hcbUserId: string, name?: string, email?: string) {
  const result = await query(
    'INSERT INTO users (user_id, name, email) VALUES ($1, $2, $3) ON CONFLICT (user_id) DO UPDATE SET name = COALESCE($2, users.name), email = COALESCE($3, users.email) RETURNING id, user_id, name, email',
    [hcbUserId, name, email]
  );
  return result.rows[0];
}

export async function getUserById(id: number) {
  const result = await query('SELECT * FROM users WHERE id = $1', [id]);
  return result.rows[0] || null;
}
