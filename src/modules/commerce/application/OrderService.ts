import { OrderRepository } from "../infrastructure/repositories/OrderRepository";
import { OrderStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export class OrderService {
  static async persistOrder(data: any) {
    return OrderRepository.createOrder(data);
  }

  static async changeOrderState(id: string, status: OrderStatus, tenantId: string = "default", expectedVersion: number = 0) {
    return OrderRepository.updateStatus(id, tenantId, expectedVersion, status, prisma);
  }

  static async getOrder(id: string, tenantId: string = "default") {
    return OrderRepository.findById(id, tenantId);
  }

  static async getUserOrders(userId: string) {
    return prisma.order.findMany({ where: { userId } });
  }

  static async getOrders(args: any) {
    return prisma.order.findMany(args);
  }

  static async deleteOrders(args: any) {
    return prisma.order.deleteMany(args);
  }
}
