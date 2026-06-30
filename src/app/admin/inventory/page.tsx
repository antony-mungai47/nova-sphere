import React from "react";
import { prisma } from "@/lib/prisma";
import { InventoryTable } from "./inventory-table";

export const dynamic = "force-dynamic";

export default async function AdminInventoryPage() {
  const products = await prisma.product.findMany({
    select: {
      id: true,
      name: true,
      sku: true,
      stock: true
    },
    orderBy: [
      { stock: 'asc' },
      { name: 'asc' }
    ]
  });

  const lowStockCount = products.filter(p => p.stock > 0 && p.stock < 20).length;
  const outOfStockCount = products.filter(p => p.stock === 0).length;

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Inventory Management</h1>
        <p className="text-nova-silver">Monitor and update product stock levels.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="glass-panel p-6 rounded-2xl border border-white/10">
          <h3 className="text-nova-silver mb-1 text-sm font-medium">Total Tracked Products</h3>
          <p className="text-3xl font-bold text-white">{products.length}</p>
        </div>
        <div className="glass-panel p-6 rounded-2xl border border-nova-amber/20 bg-nova-amber/5">
          <h3 className="text-nova-amber mb-1 text-sm font-medium">Low Stock Alerts</h3>
          <p className="text-3xl font-bold text-nova-amber">{lowStockCount}</p>
        </div>
        <div className="glass-panel p-6 rounded-2xl border border-red-500/20 bg-red-500/5">
          <h3 className="text-red-400 mb-1 text-sm font-medium">Out of Stock</h3>
          <p className="text-3xl font-bold text-red-500">{outOfStockCount}</p>
        </div>
      </div>

      <InventoryTable products={products} />
    </div>
  );
}
