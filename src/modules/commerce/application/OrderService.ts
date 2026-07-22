import { OrderRepository } from "../infrastructure/repositories/OrderRepository";
import { OrderStatus } from "@prisma/client";

export class OrderService {
  static async persistOrder(data: any) {
    return OrderRepository.createOrder(data);
  }

  static async changeOrderState(id: string, status: OrderStatus) {
    return OrderRepository.updateStatus(id, status);
  }

  static async getOrder(id: string) {
    return OrderRepository.findById(id);
  }

  static async getUserOrders(userId: string) {
    return OrderRepository.findByUserId(userId);
  }

  static async getOrders(args: any) {
    return OrderRepository.findMany(args);
  }

  static async deleteOrders(args: any) {
    return OrderRepository.deleteMany(args);
  }
}
