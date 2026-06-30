import React from "react";
import { prisma } from "@/lib/prisma";
import { Gavel, AlertCircle, Ban, Search } from "lucide-react";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

export default async function AdminAuctionsPage() {
  const auctions = await prisma.auction.findMany({
    include: {
      product: true,
      _count: { select: { bids: true } },
      bids: {
        orderBy: { amount: "desc" },
        take: 1,
        include: { user: true }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  const activeAuctions = auctions.filter(a => a.status === "ACTIVE" && new Date(a.endTime) > new Date());
  const endedAuctions = auctions.filter(a => a.status === "ENDED" || new Date(a.endTime) <= new Date());
  const totalVolume = endedAuctions.reduce((sum, a) => sum + (a.bids[0]?.amount || 0), 0);
  
  async function cancelAuction(formData: FormData) {
    "use server";
    const auctionId = formData.get("auctionId") as string;
    await prisma.auction.update({
      where: { id: auctionId },
      data: { status: "CANCELLED" }
    });
    revalidatePath("/admin/auctions");
    revalidatePath("/auctions");
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Auction Moderation</h1>
        <p className="text-nova-silver">Monitor live bids and manage marketplace integrity.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="glass-panel p-6 rounded-2xl border border-white/10">
          <div className="flex items-center gap-3 mb-4 text-nova-silver">
            <Gavel className="w-5 h-5 text-nova-blue" /> Active Auctions
          </div>
          <p className="text-3xl font-bold text-white">{activeAuctions.length}</p>
        </div>
        <div className="glass-panel p-6 rounded-2xl border border-white/10">
          <div className="flex items-center gap-3 mb-4 text-nova-silver">
            <AlertCircle className="w-5 h-5 text-nova-amber" /> Total Volume (Ended)
          </div>
          <p className="text-3xl font-bold text-white">${totalVolume.toFixed(2)}</p>
        </div>
        <div className="glass-panel p-6 rounded-2xl border border-white/10">
          <div className="flex items-center gap-3 mb-4 text-nova-silver">
            <Search className="w-5 h-5 text-nova-emerald" /> Total Bids (All Time)
          </div>
          <p className="text-3xl font-bold text-white">{auctions.reduce((s, a) => s + a._count.bids, 0)}</p>
        </div>
      </div>

      <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden">
        <div className="p-6 border-b border-white/10 bg-white/5">
          <h2 className="text-lg font-bold text-white">All Auctions</h2>
        </div>
        <table className="w-full text-left">
          <thead className="bg-white/5 border-b border-white/10">
            <tr>
              <th className="p-4 text-nova-silver font-medium text-sm">Product</th>
              <th className="p-4 text-nova-silver font-medium text-sm">Current Bid</th>
              <th className="p-4 text-nova-silver font-medium text-sm">Bids</th>
              <th className="p-4 text-nova-silver font-medium text-sm">Status</th>
              <th className="p-4 text-nova-silver font-medium text-sm">End Time</th>
              <th className="p-4 text-nova-silver font-medium text-sm text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {auctions.map((auction) => {
              const isEnded = new Date(auction.endTime) <= new Date();
              const displayStatus = auction.status === "CANCELLED" ? "CANCELLED" : isEnded ? "ENDED" : "ACTIVE";
              
              return (
                <tr key={auction.id} className="hover:bg-white/5 transition-colors group">
                  <td className="p-4">
                    <p className="text-white font-medium line-clamp-1">{auction.product.name}</p>
                    <p className="text-nova-silver text-xs">{auction.product.sku}</p>
                  </td>
                  <td className="p-4 text-white font-mono">
                    ${auction.currentBid.toFixed(2)}
                    {auction.bids[0] && <p className="text-[10px] text-nova-blue mt-1">By: {auction.bids[0].user.name || 'Anon'}</p>}
                  </td>
                  <td className="p-4 text-nova-silver">{auction._count.bids}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 text-xs rounded-full border ${
                      displayStatus === 'ACTIVE' ? 'bg-nova-emerald/20 text-nova-emerald border-nova-emerald/20' : 
                      displayStatus === 'ENDED' ? 'bg-nova-silver/20 text-nova-silver border-nova-silver/20' : 
                      'bg-red-500/20 text-red-400 border-red-500/20'
                    }`}>
                      {displayStatus}
                    </span>
                  </td>
                  <td className="p-4 text-nova-silver text-sm">
                    {new Date(auction.endTime).toLocaleString()}
                  </td>
                  <td className="p-4 text-right">
                    {displayStatus === "ACTIVE" && (
                      <form action={cancelAuction}>
                        <input type="hidden" name="auctionId" value={auction.id} />
                        <button type="submit" className="text-red-400 hover:text-red-300 transition-colors p-2 rounded-lg hover:bg-red-500/10 inline-flex items-center gap-2 text-sm font-medium">
                          <Ban className="w-4 h-4" /> Cancel
                        </button>
                      </form>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
