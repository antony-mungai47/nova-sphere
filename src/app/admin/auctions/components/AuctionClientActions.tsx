"use client";

import React, { useState } from "react";
import { Plus } from "lucide-react";
import { AuctionCreateModal } from "./AuctionCreateModal";

export function AuctionClientActions({ products }: { products: any[] }) {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <button 
        onClick={() => setShowModal(true)}
        className="flex items-center gap-2 bg-nova-blue text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-600 transition-colors"
      >
        <Plus className="w-4 h-4" /> Create Auction
      </button>

      {showModal && (
        <AuctionCreateModal products={products} onClose={() => setShowModal(false)} />
      )}
    </>
  );
}
