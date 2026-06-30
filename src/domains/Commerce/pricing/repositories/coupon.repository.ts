import { prisma } from "@/lib/prisma";

export const CouponRepository = {
  ...prisma.coupon,
};
