export type BusinessEvent = 
  | 'OrderCreated'
  | 'OrderValidated'
  | 'InventoryReserved'
  | 'InventoryReleased'
  | 'PaymentStarted'
  | 'PaymentSucceeded'
  | 'PaymentFailed'
  | 'OrderCompleted'
  | 'OrderCancelled'
  | 'ShipmentCreated'
  | 'ShipmentDelivered'
  | 'RefundCreated'
  // Add others as needed
;
