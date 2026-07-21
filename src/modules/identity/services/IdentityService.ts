import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { UserRole } from "@prisma/client";

export class IdentityService {
  /**
   * Get the current user's role from the database.
   * Returns null if user is not authenticated or not found in DB.
   */
  static async getUserRole(): Promise<UserRole | null> {
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
  static async hasRole(...allowedRoles: UserRole[]): Promise<boolean> {
    const role = await IdentityService.getUserRole();
    if (!role) return false;
    return allowedRoles.includes(role);
  }

  /**
   * Check if the current user is an admin (SUPER_ADMIN, ADMIN, or STAFF).
   */
  static async isAdmin(): Promise<boolean> {
    return IdentityService.hasRole(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.STAFF);
  }

  /**
   * Check if the current user is a super admin.
   */
  static async isSuperAdmin(): Promise<boolean> {
    return IdentityService.hasRole(UserRole.SUPER_ADMIN);
  }
}
