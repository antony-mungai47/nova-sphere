export interface IInventoryEngine {
  /**
   * Checks if the requested quantity is available (quantity - reserved >= requestedQuantity)
   */
  checkAvailability(productId: string, warehouseId: string, requestedQuantity: number): Promise<boolean>;

  /**
   * Retrieves the current stock snapshot for a product.
   */
  getAvailableStock(productId: string, warehouseId: string): Promise<number>;

  /**
   * Reserves stock for an ongoing transaction (e.g., checkout).
   * @throws Error if insufficient stock
   */
  reserveStock(productId: string, warehouseId: string, orderId: string, quantity: number, performedBy: string): Promise<void>;

  /**
   * Commits a previous reservation, deducting both the quantity and the reservation.
   * Typically called upon successful payment.
   */
  commitReservation(productId: string, warehouseId: string, orderId: string, quantity: number, performedBy: string): Promise<void>;

  /**
   * Releases a reservation back to available pool.
   * Typically called upon checkout timeout or failed payment.
   */
  releaseReservation(productId: string, warehouseId: string, orderId: string, quantity: number, performedBy: string): Promise<void>;

  /**
   * Directly adjusts the available stock (e.g., restock, damage).
   */
  adjustStock(
    productId: string,
    warehouseId: string,
    delta: number,
    reason: string,
    performedBy: string,
    source: string,
    notes?: string
  ): Promise<void>;
}

export interface InventoryAdjustedEvent {
  productId: string;
  warehouseId: string;
  newAvailableQuantity: number;
  newReservedQuantity: number;
  totalQuantity: number;
  timestamp: Date;
  reason: string;
  referenceId?: string;
  source: string;
}

export interface IInventoryEventBus {
  publishInventoryAdjusted(event: InventoryAdjustedEvent): Promise<void>;
}
