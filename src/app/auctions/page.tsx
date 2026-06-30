import { prisma } from "@/lib/prisma";
import Image from "next/image";
import Link from "next/link";
import { Gavel, Clock } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AuctionsPage() {
  const auctions = await prisma.auction.findMany({
    where: { status: "ACTIVE" },
    include: {
      product: {
        include: { images: true }
      },
      _count: {
        select: { bids: true }
      }
    },
    orderBy: { endTime: "asc" }
  });

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-12">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <Gavel className="w-8 h-8 text-nova-blue" />
            Nova Sphere Auctions
          </h1>
          <p className="text-nova-silver text-lg">Bid on exclusive, limited-edition, and rare items.</p>
        </div>
      </div>

      {auctions.length === 0 ? (
        <div className="glass-panel p-12 text-center border-dashed border-2 border-white/20">
          <Gavel className="w-12 h-12 text-nova-silver mx-auto mb-4 opacity-50" />
          <h3 className="text-2xl font-bold text-white mb-2">No Active Auctions</h3>
          <p className="text-nova-silver">Check back later for new premium items.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {auctions.map((auction) => {
            const primaryImage = auction.product.images.find(img => img.isPrimary) || auction.product.images[0];
            const isEndingSoon = new Date(auction.endTime).getTime() - new Date().getTime() < 86400000; // less than 24h

            return (
              <Link key={auction.id} href={`/auctions/${auction.id}`} className="group h-full">
                <div className="glass-panel glass-panel-glow h-full flex flex-col overflow-hidden transition-all duration-300 transform group-hover:-translate-y-1">
                  {/* Image Container */}
                  <div className="relative aspect-square bg-black/40 p-6 flex items-center justify-center">
                    {primaryImage ? (
                      <Image 
                        src={primaryImage.url} 
                        alt={auction.product.name} 
                        fill 
                        className="object-contain p-4 group-hover:scale-105 transition-transform duration-500" 
                      />
                    ) : (
                      <div className="w-full h-full bg-nova-slate/20 rounded-xl" />
                    )}
                    
                    {/* Badges */}
                    <div className="absolute top-4 left-4 flex flex-col gap-2">
                      <span className="bg-nova-blue text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                        AUCTION
                      </span>
                      {isEndingSoon && (
                        <span className="bg-nova-amber text-black text-xs font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
                          <Clock className="w-3 h-3" /> ENDING SOON
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Content Container */}
                  <div className="p-6 flex flex-col flex-grow">
                    <h3 className="text-lg font-bold text-white mb-2 line-clamp-2 group-hover:text-nova-blue transition-colors">
                      {auction.product.name}
                    </h3>
                    
                    <div className="mt-auto pt-4 flex items-end justify-between border-t border-white/10">
                      <div>
                        <p className="text-xs text-nova-silver mb-1">Current Bid</p>
                        <p className="text-xl font-bold text-white">
                          ${auction.currentBid > 0 ? auction.currentBid.toFixed(2) : auction.startingBid.toFixed(2)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-nova-silver mb-1">{auction._count.bids} Bids</p>
                        <p className="text-sm font-medium text-nova-emerald flex items-center gap-1 justify-end">
                          <Clock className="w-4 h-4" />
                          {new Date(auction.endTime).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
