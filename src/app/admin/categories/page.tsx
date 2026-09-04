import React from "react";
import { prisma } from "@/lib/prisma";
import { AdminProductQueryService } from "@/modules/commerce/application/queries/AdminProductQueryService";
import { FolderTree, Package, DollarSign } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const categories = await AdminProductQueryService.getCategoryStats();
  
  categories.sort((a, b) => b.productCount - a.productCount);

  const totalCategories = categories.length;

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Category Intelligence</h1>
        <p className="text-slate-300">Live distribution metrics mapped from the product catalog.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="glass-panel p-6 rounded-2xl border border-white/10 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-cta-primary/10 flex items-center justify-center border border-cta-primary/20">
            <FolderTree className="w-6 h-6 text-cta-primary" />
          </div>
          <div>
            <h3 className="text-slate-300 text-sm font-medium">Active Categories</h3>
            <p className="text-2xl font-bold text-white">{totalCategories}</p>
          </div>
        </div>
      </div>

      <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-white/5 border-b border-white/10">
            <tr>
              <th className="p-4 text-slate-300 font-medium">Category Name</th>
              <th className="p-4 text-slate-300 font-medium text-center">Products Linked</th>
              <th className="p-4 text-slate-300 font-medium text-center">Total Inventory Volume</th>
              <th className="p-4 text-slate-300 font-medium text-right">Avg. Product Price</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {categories.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-8 text-center text-slate-300">No categories found in catalog.</td>
              </tr>
            ) : (
              categories.map((cat, idx) => (
                <tr key={idx} className="hover:bg-white/5 transition-colors">
                  <td className="p-4 text-white font-medium flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-cta-primary"></span>
                    {cat.name}
                  </td>
                  <td className="p-4 text-center">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/5 rounded-full text-sm text-white border border-white/10">
                      <Package className="w-3 h-3 text-slate-300" /> {cat.productCount}
                    </span>
                  </td>
                  <td className="p-4 text-center text-white">{cat.totalStock} units</td>
                  <td className="p-4 text-right text-emerald-500 font-medium">${cat.avgPrice.toFixed(2)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
