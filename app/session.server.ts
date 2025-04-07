// session.server.ts
import { createCookieSessionStorage, redirect } from "@remix-run/node";
import { getEnvVar } from "./env.server";
// Import the DB functions and the User type
import { getUserById, updateUserTokens, User } from "./db.server";

// TokenData remains the same - represents the structure of token info
export type TokenData = {
  access_token: string;
  refresh_token: string;
  expires_at: number; // Milliseconds since epoch
};

export const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "__atlas_session",
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 30, // 30 days for the session cookie itself
    path: "/",
    sameSite: "lax",
    secrets: [getEnvVar("SESSION_SECRET")],
    secure: process.env.NODE_ENV === "production",
  },
});

export async function getSession(request: Request) {
  const cookie = request.headers.get("Cookie");
  return sessionStorage.getSession(cookie);
}

// getUserId remains the same - it reads the ID from the cookie
export async function getUserId(request: Request): Promise<number | null> {
  const session = await getSession(request);
  const userId = session.get("userId");
  return userId || null;
}

// requireUserId remains the same
export async function requireUserId(
  request: Request,
  redirectTo: string = new URL(request.url).pathname,
): Promise<number> {
  const userId = await getUserId(request);
  if (!userId) {
    const searchParams = new URLSearchParams([["redirectTo", redirectTo]]);
    throw redirect(`/?${searchParams}`);
  }
  return userId;
}

// getUser now uses the DB function which includes tokens
export async function getUser(request: Request): Promise<User | null> {
  const userId = await getUserId(request);
  if (!userId) return null;

  // getUserById now fetches the user data including tokens from DB
  return getUserById(userId);
}

/**
 * Creates a user session: Stores userId in the cookie and tokens in the DB.
 */
export async function createUserSession({
  request,
  userId, // The internal DB user ID
  tokenData, // The tokens received from HCB
  remember = false,
  redirectTo,
}: {
  request: Request;
  userId: number;
  tokenData: TokenData;
  remember?: boolean;
  redirectTo: string;
}) {
  // 1. Store tokens in the database
  await updateUserTokens(userId, tokenData); // Use the specific update function

  // 2. Store only the userId in the session cookie
  const session = await getSession(request);
  session.set("userId", userId);

  // 3. Redirect with the session cookie set
  return redirect(redirectTo, {
    headers: {
      "Set-Cookie": await sessionStorage.commitSession(session, {
        maxAge: remember ? 60 * 60 * 24 * 30 : undefined, // Session cookie lifetime
      }),
    },
  });
}

/**
 * Retrieves token data from the database based on the userId in the session.
 */
export async function getTokenData(
  request: Request,
): Promise<TokenData | null> {
  const userId = await getUserId(request);
  if (!userId) {
    return null;
  }

  const user = await getUserById(userId);
  if (
    !user ||
    !user.access_token ||
    !user.refresh_token ||
    !user.token_expires_at
  ) {
    // User not found in DB or tokens are missing
    return null;
  }

  // Convert the Date object from DB back to milliseconds since epoch
  const expiresAtMillis = user.token_expires_at.getTime();

  return {
    access_token: user.access_token,
    refresh_token: user.refresh_token,
    expires_at: expiresAtMillis,
  };
}

// logout remains the same
export async function logout(request: Request) {
  const session = await getSession(request);
  return redirect("/", {
    headers: {
      "Set-Cookie": await sessionStorage.destroySession(session),
    },
  });
}
