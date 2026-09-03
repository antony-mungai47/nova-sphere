import { Prisma } from "@prisma/client";
import { prisma as defaultPrisma } from "../../../../lib/prisma";
import { OrderRepository } from "../../infrastructure/repositories/OrderRepository";

export interface CreateOrderCommand {
  userId: string;
  tenantId: string;
  items: { productId: string; quantity: number; price: number }[];
  totalAmount: number;
  subtotal: number;
  tax: number;
  shippingCost: number;
  discount: number;
  currency: string;
  idempotencyKey?: string;
  traceId?: string;
}

export interface CancelOrderCommand {
  orderId: string;
  tenantId: string;
  expectedVersion: number;
  reason?: string;
  traceId?: string;
}

export interface CompleteOrderCommand {
  orderId: string;
  tenantId: string;
  expectedVersion: number;
  traceId?: string;
}

export class OrderCommandService {
  static async createOrder(cmd: CreateOrderCommand, providedTx?: Prisma.TransactionClient) {
    const execute = async (tx: Prisma.TransactionClient) => {
      // 1. Idempotency Check
      if (cmd.idempotencyKey) {
        const existing = await tx.order.findUnique({
          where: { idempotencyKey: cmd.idempotencyKey }
        });
        if (existing) return existing;
      }

      // 2. Create Order
      const order = await OrderRepository.createOrder({
        user: { connect: { id: cmd.userId } },
        tenantId: cmd.tenantId,
        idempotencyKey: cmd.idempotencyKey,
        totalAmount: cmd.totalAmount,
        subtotal: cmd.subtotal,
        tax: cmd.tax,
        shippingCost: cmd.shippingCost,
        discount: cmd.discount,
        currency: cmd.currency,
        status: "PENDING",
        version: 1,
        items: {
          create: cmd.items
        },
        timelines: {
          create: [{
            status: "PENDING",
            message: "Order created",
            actor: "SYSTEM"
          }]
        }
      }, tx);

      // 3. Outbox Event
      await tx.domainEventOutbox.create({
        data: {
          eventType: "order.created",
          aggregateId: order.id,
          aggregateType: "Order",
          payload: { orderId: order.id, tenantId: cmd.tenantId, traceId: cmd.traceId }
        }
      });

      return order;
    };

    return providedTx ? execute(providedTx) : defaultPrisma.$transaction(execute);
  }

  static async cancelOrder(cmd: CancelOrderCommand, providedTx?: Prisma.TransactionClient) {
    const execute = async (tx: Prisma.TransactionClient) => {
      const order = await OrderRepository.findById(cmd.orderId, cmd.tenantId, tx);
      if (!order) throw new Error("Order not found or tenant mismatch");

      // State transition rule
      if (order.status !== "PENDING") {
        throw new Error(`Illegal state transition: Cannot cancel order from ${order.status}`);
      }

      // Optimistic update
      await OrderRepository.updateStatus(cmd.orderId, cmd.tenantId, cmd.expectedVersion, "CANCELLED", tx);

      // Timeline
      await tx.orderTimeline.create({
        data: {
          orderId: cmd.orderId,
          status: "CANCELLED",
          previousState: "PENDING",
          newState: "CANCELLED",
          reason: cmd.reason,
          actor: "SYSTEM"
        }
      });

      // Outbox Event (triggers saga)
      await tx.domainEventOutbox.create({
        data: {
          eventType: "order.cancelled",
          aggregateId: order.id,
          aggregateType: "Order",
          payload: { orderId: order.id, tenantId: cmd.tenantId, traceId: cmd.traceId }
        }
      });

      return true;
    };

    return providedTx ? execute(providedTx) : defaultPrisma.$transaction(execute);
  }

  static async completeOrder(cmd: CompleteOrderCommand, providedTx?: Prisma.TransactionClient) {
    const execute = async (tx: Prisma.TransactionClient) => {
      const order = await OrderRepository.findById(cmd.orderId, cmd.tenantId, tx);
      if (!order) throw new Error("Order not found or tenant mismatch");

      // State transition rule
      if (order.status !== "PENDING") {
        throw new Error(`Illegal state transition: Cannot complete order from ${order.status}`);
      }

      // Optimistic update
      await OrderRepository.updateStatus(cmd.orderId, cmd.tenantId, cmd.expectedVersion, "DELIVERED", tx);

      // Timeline
      await tx.orderTimeline.create({
        data: {
          orderId: cmd.orderId,
          status: "DELIVERED",
          previousState: "PENDING",
          newState: "DELIVERED",
          actor: "SYSTEM"
        }
      });

      // Outbox Event
      await tx.domainEventOutbox.create({
        data: {
          eventType: "order.completed",
          aggregateId: order.id,
          aggregateType: "Order",
          payload: { orderId: order.id, tenantId: cmd.tenantId, traceId: cmd.traceId }
        }
      });

      return true;
    };

    return providedTx ? execute(providedTx) : defaultPrisma.$transaction(execute);
  }
}
