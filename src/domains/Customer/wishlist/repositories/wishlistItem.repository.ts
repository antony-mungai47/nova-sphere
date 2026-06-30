import { prisma } from "@/lib/prisma";

export const WishlistItemRepository = {
  ...prisma.wishlistItem,
};
