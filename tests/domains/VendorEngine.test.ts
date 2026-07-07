import { VendorEngine } from '../../src/domains/Marketplace/sellers/services/VendorEngine';
import { VendorOrderSaga } from '../../src/domains/Marketplace/sellers/services/VendorOrderSaga';
import { CommissionEngine } from '../../src/domains/Marketplace/sellers/services/CommissionEngine';
import { VendorWalletService } from '../../src/domains/Marketplace/sellers/services/VendorWalletService';

jest.mock('../../src/lib/prisma', () => ({
  prisma: {
    kYCProfile: { update: jest.fn() },
    tenant: { update: jest.fn(), findUnique: jest.fn() },
    tenantUser: { create: jest.fn() },
    store: { create: jest.fn() },
    vendorWallet: { create: jest.fn(), update: jest.fn(), findUnique: jest.fn() },
    order: { findUnique: jest.fn() },
    vendorOrder: { create: jest.fn() },
    ledgerEntry: { create: jest.fn() },
    outboxEvent: { create: jest.fn() },
    commissionPolicy: { findUnique: jest.fn(), findMany: jest.fn() },
    $transaction: jest.fn((cb) => cb(require('../../src/lib/prisma').prisma))
  }
}));

import { prisma } from '../../src/lib/prisma';

describe('VendorEngine', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('CommissionEngine', () => {
    it('calculates 10% default fee if no policy exists', async () => {
      (prisma.commissionPolicy.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.commissionPolicy.findMany as jest.Mock).mockResolvedValue([]);

      const result = await CommissionEngine.calculateCommission('tenant-1', 100);
      
      expect(result.marketplaceFee).toBe(10);
      expect(result.vendorPayout).toBe(90);
    });

    it('uses tenant-specific policy if exists', async () => {
      (prisma.commissionPolicy.findUnique as jest.Mock).mockResolvedValue({ percentage: 20, fixedFee: 1 });

      const result = await CommissionEngine.calculateCommission('tenant-1', 100);
      
      expect(result.marketplaceFee).toBe(21);
      expect(result.vendorPayout).toBe(79);
    });
  });

  describe('Vendor Lifecycle', () => {
    it('approves tenant and provisions store, wallet, and roles automatically', async () => {
      (prisma.tenant.findUnique as jest.Mock).mockResolvedValue({ name: 'My Store' });

      await VendorEngine.approveTenant('tenant-1', 'user-1');

      expect(prisma.tenant.update).toHaveBeenCalledWith(expect.objectContaining({ data: { status: 'APPROVED' } }));
      expect(prisma.kYCProfile.update).toHaveBeenCalledWith(expect.objectContaining({ data: { status: 'APPROVED' } }));
      expect(prisma.tenantUser.create).toHaveBeenCalledWith(expect.objectContaining({ data: { role: 'OWNER', userId: 'user-1', tenantId: 'tenant-1' } }));
      expect(prisma.store.create).toHaveBeenCalled();
      expect(prisma.vendorWallet.create).toHaveBeenCalled();
    });
  });

  describe('Order Splitting & Ledgers (Saga)', () => {
    it('splits a canonical order into VendorOrders and records ledgers', async () => {
      (prisma.order.findUnique as jest.Mock).mockResolvedValue({
        id: 'order-1',
        currency: 'USD',
        items: [
          { productId: 'p1', price: 50, quantity: 2, product: { ownerTenantId: 'vendor-a' } },
          { productId: 'p2', price: 100, quantity: 1, product: { ownerTenantId: 'vendor-b' } }
        ]
      });

      (prisma.vendorWallet.findUnique as jest.Mock).mockResolvedValue({ id: 'wallet-1' });
      (prisma.commissionPolicy.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.commissionPolicy.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.vendorOrder.create as jest.Mock).mockResolvedValue({ id: 'vo-1' });

      await VendorOrderSaga.splitOrder('order-1');

      // Should create 2 Vendor Orders
      expect(prisma.vendorOrder.create).toHaveBeenCalledTimes(2);

      // Should hit ledger 4 times (Debit Market, Credit Vendor) x 2 Vendors
      expect(prisma.ledgerEntry.create).toHaveBeenCalledTimes(4);

      // Should publish 2 Outbox Events
      expect(prisma.outboxEvent.create).toHaveBeenCalledTimes(2);
      
      // Should increment pending balance for vendors
      expect(prisma.vendorWallet.update).toHaveBeenCalledTimes(2);
    });

    it('throws if a product has no ownerTenantId', async () => {
      (prisma.order.findUnique as jest.Mock).mockResolvedValue({
        id: 'order-2',
        currency: 'USD',
        items: [
          { productId: 'p1', price: 50, quantity: 1, product: { ownerTenantId: null } }
        ]
      });

      await expect(VendorOrderSaga.splitOrder('order-2')).rejects.toThrow(/has no ownerTenantId/);
    });
  });
});
