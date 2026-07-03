import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Image from "next/image";
import { Clock, History, Gavel, User as UserIcon } from "lucide-react";
import { AuctionLiveView } from "./AuctionLiveView";
import { auth } from "@clerk/nextjs/server";

export const dynamic = "force-dynamic";

export default async function AuctionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { userId } = await auth();

  const auction = await prisma.auction.findUnique({
    where: { id },
    include: {
      product: {
        include: { images: true }
      },
      bids: {
        include: { user: true },
        orderBy: { amount: "desc" }
      }
    }
  });

  if (!auction) {
    notFound();
  }

  const primaryImage = auction.product.images.find(img => img.isPrimary) || auction.product.images[0];
  const isEndingSoon = new Date(auction.endTime).getTime() - new Date().getTime() < 86400000;
  const hasEnded = new Date() > auction.endTime;
  const winningBid = auction.bids[0];
  
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        
        {/* Left Column - Image */}
        <div className="space-y-6">
          <div className="glass-panel relative aspect-square w-full overflow-hidden flex items-center justify-center p-8 bg-black/40">
            {primaryImage ? (
              <Image 
                src={primaryImage.url} 
                alt={auction.product.name} 
                fill 
                className="object-contain p-8"
                priority
              />
            ) : (
              <div className="w-full h-full bg-nova-slate/20 flex items-center justify-center">
                <span className="text-nova-silver">No image available</span>
              </div>
            )}
            {hasEnded && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm z-10">
                <span className="text-white text-3xl font-bold tracking-widest uppercase border-4 border-white/20 px-8 py-4 rotate-12">
                  Auction Ended
                </span>
              </div>
            )}
          </div>
          
          <div className="glass-panel p-6">
            <h3 className="text-lg font-bold text-white mb-4">Product Details</h3>
            <p className="text-nova-silver leading-relaxed whitespace-pre-line mb-6">
              {auction.product.description}
            </p>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-nova-slate">Brand</p>
                <p className="font-medium text-white">{auction.product.brand}</p>
              </div>
              <div>
                <p className="text-nova-slate">Category</p>
                <p className="font-medium text-white">{auction.product.category}</p>
              </div>
              <div>
                <p className="text-nova-slate">SKU</p>
                <p className="font-medium text-white font-mono">{auction.product.sku}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Bidding & Info */}
        <AuctionLiveView 
          auctionId={auction.id}
          productName={auction.product.name}
          initialHighestBid={auction.bids[0]?.amount.toNumber() || auction.baseAmount.toNumber()}
          initialHighestBidderId={auction.bids[0]?.userId || null}
          initialEndTime={auction.endTime.toISOString()}
          initialBidHistory={auction.bids.map(b => ({
            id: b.id,
            bidderId: b.userId,
            bidderName: b.user.name || "Anonymous User",
            amount: b.amount.toNumber(),
            timestamp: b.createdAt.toISOString()
          }))}
          startingBid={auction.baseAmount.toNumber()}
          status={auction.status}
          userId={userId}
        />
        
      </div>
    </div>
  );
}
