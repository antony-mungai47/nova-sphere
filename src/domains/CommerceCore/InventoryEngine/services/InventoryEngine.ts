import { IInventoryEngine, IInventoryEventBus, InventoryAdjustedEvent } from '../contracts/IInventoryEngine';
import { PrismaInventoryRepository } from '../repositories/PrismaInventoryRepository';

export class InventoryEngine implements IInventoryEngine {
  private repository: PrismaInventoryRepository;
  private eventBus: IInventoryEventBus;

  constructor(repository: PrismaInventoryRepository, eventBus: IInventoryEventBus) {
    this.repository = repository;
    this.eventBus = eventBus;
  }

  async checkAvailability(productId: string, warehouseId: string, requestedQuantity: number): Promise<boolean> {
    const inventory = await this.repository.getInventory(productId, warehouseId);
    if (!inventory) return false;
    return (inventory.quantity - inventory.reserved) >= requestedQuantity;
  }

  async getAvailableStock(productId: string, warehouseId: string): Promise<number> {
    const inventory = await this.repository.getInventory(productId, warehouseId);
    if (!inventory) return 0;
    return inventory.quantity - inventory.reserved;
  }

  async reserveStock(productId: string, warehouseId: string, orderId: string, quantity: number, performedBy: string): Promise<void> {
    await this.repository.ensureInventoryExists(productId, warehouseId);
    await this.repository.reserveStockAtomic(productId, warehouseId, orderId, quantity, performedBy);
    await this.emitAdjustedEvent(productId, warehouseId, 'Reservation Created', orderId, 'SYSTEM');
  }

  async commitReservation(productId: string, warehouseId: string, orderId: string, quantity: number, performedBy: string): Promise<void> {
    await this.repository.commitReservationAtomic(productId, warehouseId, orderId, quantity, performedBy);
    await this.emitAdjustedEvent(productId, warehouseId, 'Reservation Committed', orderId, 'SYSTEM');
  }

  async releaseReservation(productId: string, warehouseId: string, orderId: string, quantity: number, performedBy: string): Promise<void> {
    await this.repository.releaseReservationAtomic(productId, warehouseId, orderId, quantity, performedBy);
    await this.emitAdjustedEvent(productId, warehouseId, 'Reservation Released', orderId, 'SYSTEM');
  }

  async adjustStock(
    productId: string,
    warehouseId: string,
    delta: number,
    reason: string,
    performedBy: string,
    source: string,
    notes?: string
  ): Promise<void> {
    if (delta === 0) return;
    await this.repository.ensureInventoryExists(productId, warehouseId);
    await this.repository.adjustStockAtomic(productId, warehouseId, delta, reason, performedBy, source, notes);
    await this.emitAdjustedEvent(productId, warehouseId, reason, undefined, source);
  }

  private async emitAdjustedEvent(productId: string, warehouseId: string, reason: string, referenceId: string | undefined, source: string): Promise<void> {
    const inventory = await this.repository.getInventory(productId, warehouseId);
    if (!inventory) return;

    const event: InventoryAdjustedEvent = {
      productId,
      warehouseId,
      newAvailableQuantity: inventory.quantity - inventory.reserved,
      newReservedQuantity: inventory.reserved,
      totalQuantity: inventory.quantity,
      timestamp: new Date(),
      reason,
      referenceId,
      source
    };

    await this.eventBus.publishInventoryAdjusted(event);
  }
}
