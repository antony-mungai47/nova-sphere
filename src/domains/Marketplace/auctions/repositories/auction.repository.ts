import { prisma } from "@/lib/prisma";

export const AuctionRepository = {
  ...prisma.auction,
  getActiveAuctions: async (take: number = 4) => {
    return prisma.auction.findMany({
      where: { status: "LIVE" },
      include: {
        product: {
          include: { images: true }
        }
      },
      orderBy: { endTime: "asc" },
      take
    });
  },

};
