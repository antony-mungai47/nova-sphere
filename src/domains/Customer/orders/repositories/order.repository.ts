import { prisma } from "@/lib/prisma";

export const OrderRepository = {
  ...prisma.order,
};
