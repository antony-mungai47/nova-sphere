import { prisma } from "@/lib/prisma";
import { OrderStatus } from "@prisma/client";

export class OrderRepository {
  static async createOrder(data: any) {
    return prisma.order.create({ data });
  }

  static async findById(id: string) {
    return prisma.order.findUnique({
      where: { id },
      include: { items: true }
    });
  }

  static async updateStatus(id: string, status: OrderStatus) {
    return prisma.order.update({
      where: { id },
      data: { status }
    });
  }

  static async findByUserId(userId: string) {
    return prisma.order.findMany({
      where: { userId },
      include: { items: true },
      orderBy: { createdAt: "desc" }
    });
  }

  static async findMany(args: any) {
    return prisma.order.findMany(args);
  }

  static async deleteMany(args: any) {
    return prisma.order.deleteMany(args);
  }
}
