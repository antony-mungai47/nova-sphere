import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { UserRole } from "@prisma/client";

export class IdentityService {
  /**
   * Synchronize a user from Clerk to Prisma (used by Webhooks & Backfill)
   */
  static async syncUser(clerkId: string, email: string, firstName?: string, lastName?: string) {
    const name = `${firstName || ''} ${lastName || ''}`.trim() || "User";
    
    return prisma.user.upsert({
      where: { clerkId },
      update: { email, name },
      create: { clerkId, email, name, role: UserRole.CUSTOMER },
    });
  }

  /**
   * Soft-delete / anonymize a user (used by Webhooks)
   * Prevents breaking foreign key constraints on orders, reviews, and audit logs.
   */
  static async deleteUser(clerkId: string) {
    try {
      const user = await prisma.user.findUnique({ where: { clerkId } });
      if (!user) return false;
      
      await prisma.user.update({
        where: { clerkId },
        data: {
          email: `deleted-${user.id}@anonymized.local`,
          name: "Deleted User",
          role: UserRole.CUSTOMER,
        },
      });
      return true;
    } catch (e) {
      // Record may not exist or DB error
      return false;
    }
  }

  /**
   * Get the full Prisma User object for the currently authenticated user
   */
  static async getCurrentUser() {
    const { userId } = await auth();
    if (!userId) return null;
    return IdentityService.getUserByClerkId(userId);
  }

  /**
   * Fetch a Prisma User by their Clerk ID
   */
  static async getUserByClerkId(clerkId: string) {
    return prisma.user.findUnique({
      where: { clerkId },
    });
  }

  /**
   * Get the current user's role from the database.
   */
  static async getUserRole(): Promise<UserRole | null> {
    const user = await IdentityService.getCurrentUser();
    return user?.role ?? null;
  }

  /**
   * Check if the current user is authenticated (valid Clerk session).
   */
  static async isAuthenticated(): Promise<boolean> {
    const { userId } = await auth();
    return !!userId;
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
   * Check if the current user is an Admin (SUPER_ADMIN, ADMIN, or STAFF).
   */
  static async isAdmin(): Promise<boolean> {
    return IdentityService.hasRole(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.STAFF);
  }

  /**
   * Check if the current user is a Vendor (has an associated TenantUser record).
   */
  static async isVendor(): Promise<boolean> {
    const user = await IdentityService.getCurrentUser();
    if (!user) return false;
    const tenantUser = await prisma.tenantUser.findFirst({
      where: { userId: user.id }
    });
    return !!tenantUser;
  }

  /**
   * Check if the current user is a Customer.
   */
  static async isCustomer(): Promise<boolean> {
    return IdentityService.hasRole(UserRole.CUSTOMER);
  }

  /**
   * Check if the current user is a Super Admin.
   */
  static async isSuperAdmin(): Promise<boolean> {
    return IdentityService.hasRole(UserRole.SUPER_ADMIN);
  }

  /**
   * Get or create user - maintained for legacy checkout compat.
   * Prefer the webhook + getCurrentUser flow going forward.
   */
  static async getOrCreateUser() {
    const { userId } = await auth();
    const user = await currentUser();

    if (!userId || !user) {
      return null;
    }

    return IdentityService.syncUser(
      userId, 
      user.emailAddresses[0]?.emailAddress || '',
      user.firstName || '',
      user.lastName || ''
    );
  }
}
