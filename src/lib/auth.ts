import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { UserRole } from "@prisma/client";

/**
 * Get the current user's role from the database.
 * Returns null if user is not authenticated or not found in DB.
 */
export async function getUserRole(): Promise<UserRole | null> {
  const { userId } = await auth();
  if (!userId) return null;

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: { role: true },
  });

  return user?.role ?? null;
}

/**
 * Check if the current user has one of the allowed roles.
 */
export async function hasRole(...allowedRoles: UserRole[]): Promise<boolean> {
  const role = await getUserRole();
  if (!role) return false;
  return allowedRoles.includes(role);
}

/**
 * Check if the current user is an admin (SUPER_ADMIN, ADMIN, or STAFF).
 */
export async function isAdmin(): Promise<boolean> {
  return hasRole(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.STAFF);
}

/**
 * Check if the current user is a super admin.
 */
export async function isSuperAdmin(): Promise<boolean> {
  return hasRole(UserRole.SUPER_ADMIN);
}
