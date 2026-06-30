import React from "react";
import { prisma } from "@/lib/prisma";
import { FolderTree, Package, DollarSign } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  // Aggregate category data from products
  const categoryStats = await prisma.product.groupBy({
    by: ['category'],
    _count: {
      id: true,
    },
    _sum: {
      stock: true,
    },
    _avg: {
      price: true,
    }
  });

  const categories = categoryStats.map(stat => ({
    name: stat.category,
    productCount: stat._count.id,
    totalStock: stat._sum.stock || 0,
    avgPrice: stat._avg.price || 0
  })).sort((a, b) => b.productCount - a.productCount);

  const totalCategories = categories.length;

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Category Intelligence</h1>
        <p className="text-nova-silver">Live distribution metrics mapped from the product catalog.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="glass-panel p-6 rounded-2xl border border-white/10 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-nova-blue/10 flex items-center justify-center border border-nova-blue/20">
            <FolderTree className="w-6 h-6 text-nova-blue" />
          </div>
          <div>
            <h3 className="text-nova-silver text-sm font-medium">Active Categories</h3>
            <p className="text-2xl font-bold text-white">{totalCategories}</p>
          </div>
        </div>
      </div>

      <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-white/5 border-b border-white/10">
            <tr>
              <th className="p-4 text-nova-silver font-medium">Category Name</th>
              <th className="p-4 text-nova-silver font-medium text-center">Products Linked</th>
              <th className="p-4 text-nova-silver font-medium text-center">Total Inventory Volume</th>
              <th className="p-4 text-nova-silver font-medium text-right">Avg. Product Price</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {categories.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-8 text-center text-nova-silver">No categories found in catalog.</td>
              </tr>
            ) : (
              categories.map((cat, idx) => (
                <tr key={idx} className="hover:bg-white/5 transition-colors">
                  <td className="p-4 text-white font-medium flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-nova-blue"></span>
                    {cat.name}
                  </td>
                  <td className="p-4 text-center">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/5 rounded-full text-sm text-white border border-white/10">
                      <Package className="w-3 h-3 text-nova-silver" /> {cat.productCount}
                    </span>
                  </td>
                  <td className="p-4 text-center text-white">{cat.totalStock} units</td>
                  <td className="p-4 text-right text-nova-emerald font-medium">${cat.avgPrice.toFixed(2)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
