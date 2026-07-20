"use client";

import React, { useState } from "react";
import { createAuctionAction } from "@/domains/Marketplace/auctions/admin-actions";

export function AuctionCreateModal({ products, onClose }: { products: any[]; onClose: () => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const result = await createAuctionAction(formData);
    
    if (!result.success) {
      setError(result.error || "Unknown error occurred.");
      setLoading(false);
    } else {
      onClose();
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-[#1a1f2e] border border-white/10 rounded-2xl w-full max-w-lg p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
        <h2 className="text-2xl font-bold text-white mb-6">Create Auction</h2>
        
        {error && (
          <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-3 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-sm">
          <div>
            <label className="block text-nova-silver mb-1">Product</label>
            <select name="productId" required className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-nova-blue">
              <option value="">Select a product...</option>
              {products.map(p => (
                <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-nova-silver mb-1">Base Bid ($)</label>
              <input type="number" step="0.01" name="baseAmount" required className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-nova-blue" />
            </div>
            <div>
              <label className="block text-nova-silver mb-1">Reserve Price</label>
              <input type="number" step="0.01" name="reservePrice" className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-nova-blue" />
            </div>
            <div>
              <label className="block text-nova-silver mb-1">Buy Now Price</label>
              <input type="number" step="0.01" name="buyNowPrice" className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-nova-blue" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-nova-silver mb-1">Start Time (Optional)</label>
              <input type="datetime-local" name="startTime" className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-nova-blue" />
            </div>
            <div>
              <label className="block text-nova-silver mb-1">End Time</label>
              <input type="datetime-local" name="endTime" required className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-nova-blue" />
            </div>
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-white/10 mt-6">
            <button type="button" onClick={onClose} className="px-5 py-2.5 text-nova-silver hover:text-white transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="px-5 py-2.5 bg-nova-blue text-white rounded-lg font-medium hover:bg-blue-600 transition-colors disabled:opacity-50">
              {loading ? "Creating..." : "Create Auction"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
