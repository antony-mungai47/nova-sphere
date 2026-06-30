import Link from "next/link";
import Image from "next/image";
import { Gavel, Clock, ArrowRight } from "lucide-react";

export function AuctionHighlights({ auctions }: { auctions: any[] }) {
  if (!auctions || auctions.length === 0) return null;

  return (
    <section className="py-24 bg-black/20 border-y border-white/5 relative overflow-hidden">
      {/* Decorative gradient */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[500px] bg-[var(--color-primary)] opacity-5 blur-[200px] pointer-events-none" />
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20 text-xs font-bold text-[var(--color-primary)] uppercase tracking-wider mb-4">
              <Gavel className="w-3 h-3" /> Live Bidding
            </div>
            <h2 className="text-3xl md:text-5xl font-black text-foreground tracking-tight">
              Premium Auctions
            </h2>
          </div>
          <Link href="/auctions" className="text-[var(--color-primary)] hover:text-[var(--color-primary)]/80 font-medium flex items-center gap-2 group">
            View All Auctions
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {auctions.map((auction) => {
            const primaryImage = auction.product.images?.find((img: any) => img.isPrimary) || auction.product.images?.[0];
            const isEndingSoon = new Date(auction.endTime).getTime() - new Date().getTime() < 86400000;

            return (
              <Link key={auction.id} href={`/auctions/${auction.id}`} className="group h-full">
                <div className="glass-panel h-full flex flex-col overflow-hidden transition-all duration-300 transform group-hover:-translate-y-1 hover:shadow-[var(--shadow-glow-primary)]">
                  <div className="relative aspect-square bg-black/40 p-6 flex items-center justify-center">
                    {primaryImage ? (
                      <Image 
                        src={primaryImage.url} 
                        alt={auction.product.name} 
                        fill 
                        className="object-contain p-4 group-hover:scale-105 transition-transform duration-500" 
                      />
                    ) : (
                      <div className="w-full h-full bg-white/5 rounded-xl" />
                    )}
                    
                    <div className="absolute top-4 left-4 flex flex-col gap-2">
                      {isEndingSoon && (
                        <span className="bg-[var(--color-accent)] text-black text-[10px] font-bold px-2 py-1 rounded shadow-lg flex items-center gap-1 uppercase">
                          <Clock className="w-3 h-3" /> Ending Soon
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-5 flex flex-col flex-grow bg-surface/50 backdrop-blur-sm">
                    <h3 className="text-sm font-bold text-foreground mb-1 line-clamp-2 group-hover:text-[var(--color-primary)] transition-colors">
                      {auction.product.name}
                    </h3>
                    
                    <div className="mt-auto pt-4 flex items-end justify-between">
                      <div>
                        <p className="text-[10px] text-[var(--color-muted)] uppercase font-semibold">Current Bid</p>
                        <p className="text-lg font-black text-foreground">
                          ${auction.currentBid > 0 ? auction.currentBid.toFixed(2) : auction.startingBid.toFixed(2)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-medium text-[var(--color-muted)] flex items-center gap-1 justify-end">
                          <Clock className="w-3 h-3" />
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
      </div>
    </section>
  );
}
