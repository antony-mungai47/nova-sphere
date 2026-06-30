"use client";

import React, { useState } from "react";
import { updateProductStock } from "./actions";
import { Save, Loader2, AlertTriangle, Check } from "lucide-react";

interface ProductData {
  id: string;
  name: string;
  sku: string;
  stock: number;
}

export function InventoryTable({ products }: { products: ProductData[] }) {
  const [stockState, setStockState] = useState<Record<string, number>>(
    Object.fromEntries(products.map(p => [p.id, p.stock]))
  );
  const [isUpdating, setIsUpdating] = useState<Record<string, boolean>>({});
  const [successStatus, setSuccessStatus] = useState<Record<string, boolean>>({});

  const handleStockChange = (id: string, value: string) => {
    const num = parseInt(value, 10);
    if (!isNaN(num) && num >= 0) {
      setStockState(prev => ({ ...prev, [id]: num }));
    } else if (value === "") {
      setStockState(prev => ({ ...prev, [id]: 0 }));
    }
  };

  const handleSave = async (id: string) => {
    setIsUpdating(prev => ({ ...prev, [id]: true }));
    try {
      await updateProductStock(id, stockState[id]);
      setSuccessStatus(prev => ({ ...prev, [id]: true }));
      setTimeout(() => setSuccessStatus(prev => ({ ...prev, [id]: false })), 2000);
    } catch (e: any) {
      alert("Failed to update stock: " + e.message);
    } finally {
      setIsUpdating(prev => ({ ...prev, [id]: false }));
    }
  };

  return (
    <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden">
      <table className="w-full text-left">
        <thead className="bg-white/5 border-b border-white/10">
          <tr>
            <th className="p-4 text-nova-silver font-medium">SKU</th>
            <th className="p-4 text-nova-silver font-medium">Product Name</th>
            <th className="p-4 text-nova-silver font-medium">Status</th>
            <th className="p-4 text-nova-silver font-medium">Stock Level</th>
            <th className="p-4 text-nova-silver font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {products.map((product) => {
            const currentStock = stockState[product.id];
            const isLow = currentStock < 20;
            const isOut = currentStock === 0;

            return (
              <tr key={product.id} className="hover:bg-white/5 transition-colors">
                <td className="p-4 text-nova-silver font-mono text-sm">{product.sku}</td>
                <td className="p-4 text-white font-medium">{product.name}</td>
                <td className="p-4">
                  {isOut ? (
                    <span className="px-2 py-1 bg-red-500/20 text-red-400 border border-red-500/20 rounded-full text-xs font-medium flex w-fit items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> Out of Stock
                    </span>
                  ) : isLow ? (
                    <span className="px-2 py-1 bg-nova-amber/20 text-nova-amber border border-nova-amber/20 rounded-full text-xs font-medium flex w-fit items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> Low Stock
                    </span>
                  ) : (
                    <span className="px-2 py-1 bg-nova-emerald/20 text-nova-emerald border border-nova-emerald/20 rounded-full text-xs font-medium flex w-fit items-center gap-1">
                      <Check className="w-3 h-3" /> In Stock
                    </span>
                  )}
                </td>
                <td className="p-4">
                  <input
                    type="number"
                    min="0"
                    value={currentStock}
                    onChange={(e) => handleStockChange(product.id, e.target.value)}
                    className="w-24 bg-black/50 border border-white/10 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-nova-blue transition-colors"
                  />
                </td>
                <td className="p-4 text-right">
                  <button
                    onClick={() => handleSave(product.id)}
                    disabled={isUpdating[product.id] || stockState[product.id] === product.stock}
                    className="inline-flex items-center justify-center gap-2 px-4 py-1.5 bg-nova-blue text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:hover:bg-nova-blue transition-colors text-sm font-medium"
                  >
                    {isUpdating[product.id] ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : successStatus[product.id] ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <>
                        <Save className="w-4 h-4" /> Update
                      </>
                    )}
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
