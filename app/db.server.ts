import { PrismaClient } from '@prisma/client';
import { TokenData } from "./session.server";

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
let prisma: PrismaClient;

if (process.env.NODE_ENV === "production") {
  prisma = new PrismaClient();
} else {
  if (!global.__db__) {
    global.__db__ = new PrismaClient();
  }
  prisma = global.__db__;
  prisma.$connect();
}

export interface User {
  id: number;
  user_id: string; // HCB User ID
  name: string | null;
  email: string | null;
  access_token: string | null;
  refresh_token: string | null;
  token_expires_at: Date | null;
}

export async function findOrCreateUser(
  hcbUserId: string,
  name?: string,
  email?: string,
  tokenData?: TokenData,
): Promise<User> {
  // Convert expires_at (milliseconds) to a Date object
  const expiresAtDate = tokenData?.expires_at
    ? new Date(tokenData.expires_at)
    : null;

  // Check if user exists
  const existingUser = await prisma.user.findUnique({
    where: { user_id: hcbUserId },
  });

  if (existingUser) {
    // Update existing user
    return prisma.user.update({
      where: { user_id: hcbUserId },
      data: {
        name: name ?? existingUser.name,
        email: email ?? existingUser.email,
        access_token: tokenData?.access_token ?? existingUser.access_token,
        refresh_token: tokenData?.refresh_token ?? existingUser.refresh_token,
        token_expires_at: expiresAtDate ?? existingUser.token_expires_at,
      },
    });
  } else {
    // Create new user
    return prisma.user.create({
      data: {
        user_id: hcbUserId,
        name,
        email,
        access_token: tokenData?.access_token,
        refresh_token: tokenData?.refresh_token,
        token_expires_at: expiresAtDate,
      },
    });
  }
}

export async function updateUserTokens(
  userId: number,
  tokenData: TokenData,
): Promise<void> {
  const expiresAtDate = new Date(tokenData.expires_at);
  await prisma.user.update({
    where: { id: userId },
    data: {
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      token_expires_at: expiresAtDate,
    },
  });
}

export async function getUserById(id: number): Promise<User | null> {
  return prisma.user.findUnique({
    where: { id },
  });
}

export { prisma };
