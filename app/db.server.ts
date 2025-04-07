
import pkg from 'pg';
const {Pool} = pkg;
import { getEnvVar } from './env.server';
import { TokenData } from "./session.server";

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

export interface User {
  id: number;
  user_id: string; // HCB User ID
  name: string | null;
  email: string | null;
  access_token: string | null;
  refresh_token: string | null;
  token_expires_at: Date | null; // pg driver returns Date object for TIMESTAMPTZ
  // Add other user fields if you have them
}

export async function findOrCreateUser(
  hcbUserId: string,
  name?: string,
  email?: string,
  tokenData?: TokenData, // Add tokenData as optional param
): Promise<User> {
  // Convert expires_at (milliseconds) to a Date object for TIMESTAMPTZ
  const expiresAtDate = tokenData?.expires_at
    ? new Date(tokenData.expires_at)
    : null;

  const result = await query(
    `INSERT INTO users (user_id, name, email, access_token, refresh_token, token_expires_at)
     VALUES ($1, $2, $3, $4, $5, $6)
     ON CONFLICT (user_id) DO UPDATE SET
       name = COALESCE($2, users.name),
       email = COALESCE($3, users.email),
       -- Always update tokens if provided, otherwise keep existing
       access_token = COALESCE($4, users.access_token),
       refresh_token = COALESCE($5, users.refresh_token),
       token_expires_at = COALESCE($6, users.token_expires_at)
     RETURNING id, user_id, name, email, access_token, refresh_token, token_expires_at`,
    [
      hcbUserId,
      name,
      email,
      tokenData?.access_token,
      tokenData?.refresh_token,
      expiresAtDate, // Pass the Date object or null
    ],
  );
  return result.rows[0];
}

export async function updateUserTokens(
  userId: number,
  tokenData: TokenData,
): Promise<void> {
  const expiresAtDate = new Date(tokenData.expires_at);
  await query(
    `UPDATE users
     SET access_token = $1, refresh_token = $2, token_expires_at = $3
     WHERE id = $4`,
    [tokenData.access_token, tokenData.refresh_token, expiresAtDate, userId],
  );
}

export async function getUserById(id: number): Promise<User | null> {
  const result = await query(
    "SELECT id, user_id, name, email, access_token, refresh_token, token_expires_at FROM users WHERE id = $1",
    [id],
  );
  return result.rows[0] || null;
}
