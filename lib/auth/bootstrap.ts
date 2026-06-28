import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth/password";

const defaultAdmin = {
  username: "admin",
  password: "admin123",
  fullName: "System Administrator",
  role: "admin"
} as const;

export async function ensureDefaultAdminUser() {
  const existingAdmin = await prisma.user.findUnique({
    where: {
      username: defaultAdmin.username
    },
    select: {
      id: true
    }
  });

  if (existingAdmin) {
    return;
  }

  const passwordHash = await hashPassword(defaultAdmin.password);

  await prisma.user.upsert({
    where: {
      username: defaultAdmin.username
    },
    update: {},
    create: {
      username: defaultAdmin.username,
      passwordHash,
      fullName: defaultAdmin.fullName,
      role: defaultAdmin.role
    }
  });
}

export const defaultAdminCredentials = {
  username: defaultAdmin.username,
  password: defaultAdmin.password
} as const;
