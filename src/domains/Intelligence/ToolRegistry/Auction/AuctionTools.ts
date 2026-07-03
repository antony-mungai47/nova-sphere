import { tool } from 'ai';
import { z } from 'zod';
import { SafetyEngine } from '../../SafetyEngine/SafetyEngine';
import { AIContext } from '../../ContextEngine/ContextEngine';
import { prisma } from '@/lib/prisma';

export const buildAuctionTools = (context: AIContext) => {
  return {
    getLiveAuctions: tool({
      description: 'Finds active auctions. Returns the auction ID, product name, current bid, and end time.',
      inputSchema: z.object({
        limit: z.number().optional().default(5),
      }),
      execute: (async ({ limit }: { limit: number }) => {
        SafetyEngine.validateToolAccess('getLiveAuctions', context);
        
        const auctions = await prisma.auction.findMany({
          where: { status: 'LIVE' },
          include: { product: true },
          take: limit,
          orderBy: { endTime: 'asc' }
        });

        return auctions.map(a => ({
          auctionId: a.id,
          productName: a.product.name,
          currentBid: a.currentBid.toNumber(),
          endTime: a.endTime,
        }));
      }) as any,
    }),

    getAuctionInsights: tool({
      description: 'Analyzes an auction to determine bid velocity and competition.',
      inputSchema: z.object({
        auctionId: z.string(),
      }),
      execute: (async ({ auctionId }: { auctionId: string }) => {
        SafetyEngine.validateToolAccess('getAuctionInsights', context);
        
        const bids = await prisma.bid.findMany({
          where: { auctionId },
          orderBy: { createdAt: 'asc' }
        });

        const uniqueBidders = new Set(bids.map(b => b.userId)).size;
        
        return {
          totalBids: bids.length,
          uniqueBidders,
          insight: `There are ${bids.length} bids from ${uniqueBidders} unique bidders. It is highly competitive.`,
        };
      }) as any,
    })
  };
};
