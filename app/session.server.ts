import { createCookieSessionStorage, redirect } from "@remix-run/node";
import { getEnvVar } from "./env.server";
import { getUserById } from "./db.server";

export type TokenData = {
  access_token: string;
  refresh_token: string;
  expires_at: number;
};

export const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "__atlas_session",
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 30, // 30 days
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

export async function getUserId(request: Request): Promise<number | null> {
  const session = await getSession(request);
  const userId = session.get("userId");
  return userId || null;
}

export async function requireUserId(
  request: Request,
  redirectTo: string = new URL(request.url).pathname
) {
  const userId = await getUserId(request);
  if (!userId) {
    const searchParams = new URLSearchParams([["redirectTo", redirectTo]]);
    throw redirect(`/?${searchParams}`);
  }
  return userId;
}

export async function getUser(request: Request) {
  const userId = await getUserId(request);
  if (!userId) return null;
  
  return getUserById(userId);
}

export async function createUserSession({
  request,
  userId,
  tokenData,
  remember = false,
  redirectTo,
}: {
  request: Request;
  userId: number;
  tokenData: TokenData;
  remember?: boolean;
  redirectTo: string;
}) {
  const session = await getSession(request);
  session.set("userId", userId);
  session.set("tokenData", tokenData);
  
  return redirect(redirectTo, {
    headers: {
      "Set-Cookie": await sessionStorage.commitSession(session, {
        maxAge: remember
          ? 60 * 60 * 24 * 30 // 30 days
          : undefined,
      }),
    },
  });
}

export async function getTokenData(request: Request): Promise<TokenData | null> {
  const session = await getSession(request);
  return session.get("tokenData") || null;
}

export async function logout(request: Request) {
  const session = await getSession(request);
  return redirect("/", {
    headers: {
      "Set-Cookie": await sessionStorage.destroySession(session),
    },
  });
}
