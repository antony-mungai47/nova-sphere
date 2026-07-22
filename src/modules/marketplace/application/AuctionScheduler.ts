import { prisma } from "@/lib/prisma";
import { AuctionService } from "./AuctionService";

export class AuctionScheduler {
  static async expireAuctions(currentTime: Date = new Date()) {
    const expiredAuctions = await prisma.auction.findMany({
      where: {
        status: { in: ["SCHEDULED", "LIVE", "CLOSING"] },
        endTime: { lte: currentTime }
      }
    });

    for (const auction of expiredAuctions) {
      try {
        await AuctionService.close(auction.id);
      } catch (error) {
        console.error(`Failed to close auction ${auction.id}`, error);
        // Retry logic could be handled by a dead-letter queue or subsequent scheduler runs
      }
    }
  }
}
