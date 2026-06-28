import { cookies } from "next/headers";
import { cache } from "react";
import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";
import { AUTH_COOKIE_NAME, SESSION_DURATION_MS } from "@/lib/auth/constants";

type SessionUser = {
  id: string;
  username: string;
  fullName: string;
  role: string;
};

type AuthSession = {
  user: SessionUser;
  expiresAt: Date;
};

function getExpiryDate() {
  return new Date(Date.now() + SESSION_DURATION_MS);
}

export async function createSession(userId: string) {
  const token = randomBytes(32).toString("hex");
  const expiresAt = getExpiryDate();

  await prisma.session.create({
    data: {
      token,
      userId,
      expiresAt
    }
  });

  const cookieStore = await cookies();
  cookieStore.set(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt
  });
}

export async function clearSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  if (token) {
    await prisma.session.deleteMany({
      where: { token }
    });
  }

  cookieStore.set(AUTH_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: new Date(0)
  });
}

export const getCurrentSession = cache(async (): Promise<AuthSession | null> => {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  const session = await prisma.session.findUnique({
    where: { token },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          fullName: true,
          role: true
        }
      }
    }
  });

  if (!session) {
    return null;
  }

  if (session.expiresAt <= new Date()) {
    await prisma.session.delete({
      where: { id: session.id }
    });
    return null;
  }

  return {
    user: session.user,
    expiresAt: session.expiresAt
  };
});

export async function requireUser() {
  const session = await getCurrentSession();

  if (!session) {
    throw new Error("Unauthorized");
  }

  return session.user;
}
