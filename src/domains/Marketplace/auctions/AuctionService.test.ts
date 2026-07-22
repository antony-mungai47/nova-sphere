import { AuctionService } from "./AuctionService";
import { prisma } from "@/lib/prisma";
import { pusherServer } from "@/lib/pusherServer";
import { inngest } from "@/lib/inngest/client";

jest.mock("@/lib/prisma", () => ({
  prisma: {
    $transaction: jest.fn((callback) => callback(prisma)),
    auction: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    bid: {
      create: jest.fn(),
    }
  }
}));

jest.mock("@/lib/pusherServer", () => ({
  pusherServer: {
    trigger: jest.fn(),
  }
}));

jest.mock("@/lib/inngest/client", () => ({
  inngest: {
    send: jest.fn(),
  }
}));

describe("AuctionService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("validateBid", () => {
    it("throws if auction is not LIVE", async () => {
      const auction = { status: "SCHEDULED" };
      await expect(AuctionService.validateBid(auction, "user1", 100)).rejects.toThrow("This auction is not active.");
    });

    it("throws if bid is placed after endTime", async () => {
      const auction = { status: "LIVE", startTime: new Date("2020-01-01"), endTime: new Date("2021-01-01"), currentBid: 50, baseAmount: 50 };
      await expect(AuctionService.validateBid(auction, "user1", 100)).rejects.toThrow("This auction is not currently accepting bids.");
    });

    it("throws if user is already highest bidder", async () => {
      const auction = { status: "LIVE", startTime: new Date("2020-01-01"), endTime: new Date("2030-01-01"), highestBidderId: "user1", currentBid: 50, baseAmount: 50 };
      await expect(AuctionService.validateBid(auction, "user1", 100)).rejects.toThrow("You are already the highest bidder.");
    });

    it("throws if bid is below minimum increment", async () => {
      const auction = { status: "LIVE", startTime: new Date("2020-01-01"), endTime: new Date("2030-01-01"), currentBid: 100, baseAmount: 50 };
      await expect(AuctionService.validateBid(auction, "user1", 100)).rejects.toThrow("Your bid must be at least $101.00");
    });
  });

  describe("placeBid", () => {
    it("places a valid bid and extends auction if within anti-sniping threshold", async () => {
      const now = new Date();
      const endTime = new Date(now.getTime() + 2 * 60 * 1000); // 2 minutes remaining

      (prisma.auction.findUnique as jest.Mock).mockResolvedValue({
        id: "auction1",
        status: "LIVE",
        startTime: new Date(now.getTime() - 100000),
        endTime,
        highestBidderId: "prevUser",
        currentBid: 100,
        baseAmount: 50,
        antiSnipingEnabled: true,
        extensionMinutes: 5,
        extensionThreshold: 5,
      });

      await AuctionService.placeBid("auction1", "user1", 150);

      expect(prisma.bid.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ amount: 150, userId: "user1" })
      });

      expect(prisma.auction.update).toHaveBeenCalledWith({
        where: { id: "auction1" },
        data: expect.objectContaining({
          currentBid: 150,
          highestBidderId: "user1",
          endTime: expect.any(Date), // Extended
        })
      });

      // We need to wait for setImmediate to flush
      await new Promise(setImmediate);

      expect(pusherServer.trigger).toHaveBeenCalledWith('auction-auction1', 'bid-placed', expect.any(Object));
      expect(inngest.send).toHaveBeenCalledWith(expect.objectContaining({ name: "AuctionBidPlaced" }));
      expect(inngest.send).toHaveBeenCalledWith(expect.objectContaining({ name: "AuctionOutbid" }));
      expect(inngest.send).toHaveBeenCalledWith(expect.objectContaining({ name: "AuctionExtended" }));
    });
  });

  describe("buyNow", () => {
    it("instantly closes auction and marks AWAITING_PAYMENT", async () => {
      (prisma.auction.findUnique as jest.Mock).mockResolvedValue({
        id: "auction2",
        status: "LIVE",
        buyNowPrice: 500,
      });

      await AuctionService.buyNow("auction2", "winnerUser");

      expect(prisma.bid.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ amount: 500, userId: "winnerUser" })
      });

      expect(prisma.auction.update).toHaveBeenCalledWith({
        where: { id: "auction2" },
        data: expect.objectContaining({
          status: "SETTLED",
          highestBidderId: "winnerUser",
          currentBid: 500,
        })
      });
    });
  });
});
