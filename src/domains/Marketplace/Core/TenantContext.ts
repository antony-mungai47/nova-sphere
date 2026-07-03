import { prisma } from '@/lib/prisma';

export class TenantContext {
  private tenantId: string;

  constructor(tenantId: string) {
    if (!tenantId) {
      throw new Error('[TenantContext] tenantId is required to access marketplace domains.');
    }
    this.tenantId = tenantId;
  }

  get id() {
    return this.tenantId;
  }

  /**
   * Automatically scopes any prisma operation to the tenant ID.
   * This is a simplified boundary. In a larger system, this would
   * wrap Prisma queries using Prisma Client Extensions.
   */
  public withTenant<T>(whereClause: T): T & { ownerTenantId: string } {
    return {
      ...whereClause,
      ownerTenantId: this.tenantId,
    };
  }
}
