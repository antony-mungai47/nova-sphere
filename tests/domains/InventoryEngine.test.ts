import { InventoryEngine } from '@/domains/CommerceCore/InventoryEngine/services/InventoryEngine';
import { PrismaInventoryRepository } from '@/domains/CommerceCore/InventoryEngine/repositories/PrismaInventoryRepository';
import { IInventoryEventBus } from '@/domains/CommerceCore/InventoryEngine/contracts/IInventoryEngine';
import { mockDeep, mockReset } from 'jest-mock-extended';

describe('InventoryEngine', () => {
  const mockRepo = mockDeep<PrismaInventoryRepository>();
  const mockEventBus = mockDeep<IInventoryEventBus>();
  
  let engine: InventoryEngine;

  beforeEach(() => {
    mockReset(mockRepo);
    mockReset(mockEventBus);
    engine = new InventoryEngine(mockRepo, mockEventBus);
  });

  describe('checkAvailability', () => {
    it('returns true if sufficient stock is available', async () => {
      mockRepo.getInventory.mockResolvedValue({
        id: '1',
        productId: 'PROD_1',
        warehouseId: 'WH_1',
        quantity: 10,
        reserved: 2,
        location: 'A1',
        updatedAt: new Date()
      });

      const result = await engine.checkAvailability('PROD_1', 'WH_1', 5);
      expect(result).toBe(true);
      expect(mockRepo.getInventory).toHaveBeenCalledWith('PROD_1', 'WH_1');
    });

    it('returns false if requested quantity exceeds available stock (quantity - reserved)', async () => {
      mockRepo.getInventory.mockResolvedValue({
        id: '1',
        productId: 'PROD_1',
        warehouseId: 'WH_1',
        quantity: 10,
        reserved: 8,
        location: 'A1',
        updatedAt: new Date()
      });

      const result = await engine.checkAvailability('PROD_1', 'WH_1', 5);
      expect(result).toBe(false);
    });

    it('returns false if inventory record does not exist', async () => {
      mockRepo.getInventory.mockResolvedValue(null);

      const result = await engine.checkAvailability('PROD_1', 'WH_1', 1);
      expect(result).toBe(false);
    });
  });

  describe('reserveStock', () => {
    it('ensures inventory exists, calls atomic reserve, and emits an event', async () => {
      mockRepo.ensureInventoryExists.mockResolvedValue();
      mockRepo.reserveStockAtomic.mockResolvedValue();
      mockEventBus.emit.mockResolvedValue();

      mockRepo.getInventory.mockResolvedValue({
        id: '1',
        productId: 'PROD_1',
        warehouseId: 'WH_1',
        quantity: 10,
        reserved: 3,
        location: 'A1',
        updatedAt: new Date()
      });

      await engine.reserveStock('PROD_1', 'WH_1', 'ORDER_1', 3, 'user_123');

      expect(mockRepo.ensureInventoryExists).toHaveBeenCalledWith('PROD_1', 'WH_1');
      expect(mockRepo.reserveStockAtomic).toHaveBeenCalledWith('PROD_1', 'WH_1', 'ORDER_1', 3, 'user_123');
      expect(mockEventBus.publishInventoryAdjusted).toHaveBeenCalledWith(expect.objectContaining({
        productId: 'PROD_1',
        warehouseId: 'WH_1',
        reason: 'Reservation Created',
        referenceId: 'ORDER_1'
      }));
    });
  });
});
