import { IdentityService } from "./services/IdentityService";

/**
 * IdentityFacade
 * 
 * This acts as the runtime switch during Phase U1 migration.
 * All inline Clerk/Prisma calls across the codebase are being routed here.
 * Once U1 is fully verified, this facade can be bypassed to use IdentityService directly.
 */
export class IdentityFacade {
  static async getCurrentUser() {
    return IdentityService.getCurrentUser();
  }

  static async getUserRole() {
    return IdentityService.getUserRole();
  }

  static async isAuthenticated() {
    return IdentityService.isAuthenticated();
  }

  static async hasRole(...roles: any[]) {
    return IdentityService.hasRole(...roles);
  }

  static async isAdmin() {
    return IdentityService.isAdmin();
  }

  static async isVendor() {
    return IdentityService.isVendor();
  }

  static async isCustomer() {
    return IdentityService.isCustomer();
  }

  static async getOrCreateUser() {
    return IdentityService.getOrCreateUser();
  }
}
