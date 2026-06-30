"use server";
import { CouponRepository } from "@/domains/Commerce/pricing/repositories/coupon.repository";

import { revalidatePath } from "next/cache";
import { isAdmin } from "@/lib/auth";

export async function createCoupon(code: string, discountPercent: number) {
  const authorized = await isAdmin();
  if (!authorized) throw new Error("Unauthorized");

  if (!code || discountPercent <= 0 || discountPercent > 100) {
    throw new Error("Invalid coupon data");
  }

  await CouponRepository.create({
    data: {
      code: code.toUpperCase(),
      discountPercent,
      isActive: true,
    }
  });

  revalidatePath("/admin/marketing");
  return { success: true };
}

export async function toggleCouponActive(id: string, isActive: boolean) {
  const authorized = await isAdmin();
  if (!authorized) throw new Error("Unauthorized");

  await CouponRepository.update({
    where: { id },
    data: { isActive }
  });

  revalidatePath("/admin/marketing");
  return { success: true };
}
