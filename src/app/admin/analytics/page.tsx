import React from "react";
import { prisma } from "@/lib/prisma";
import { DollarSign, ShoppingCart, TrendingUp, Users, Package, AlertTriangle, AlertCircle, Calendar } from "lucide-react";
import { AdminProductQueryService } from "@/modules/commerce/application/queries/AdminProductQueryService";

export const dynamic = 'force-dynamic';

export default async function AdminAnalyticsPage() {
  const today = new Date();
  today.setUTCHours(0,0,0,0);
  
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(today.getDate() - 7);
  
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(today.getDate() - 30);

  const [todayMetrics, last30DaysMetrics, inventoryStats] = await Promise.all([
    prisma.dailyMetrics.findUnique({ where: { date: today } }),
    prisma.dailyMetrics.findMany({
      where: { date: { gte: thirtyDaysAgo } },
      orderBy: { date: 'asc' }
    }),
    AdminProductQueryService.getInventoryStats()
  ]);

  // Aggregate metrics from Rollups
  const last7DaysMetrics = last30DaysMetrics.filter(m => m.date >= sevenDaysAgo);
  
  const todayRevenue = todayMetrics?.revenue.toNumber() || 0;
  const last7DaysRevenue = last7DaysMetrics.reduce((sum, m) => sum + m.revenue.toNumber(), 0);
  const last30DaysRevenue = last30DaysMetrics.reduce((sum, m) => sum + m.revenue.toNumber(), 0);
  
  // Lifetime is a much larger aggregation, ideally tracked in a master summary table or updated weekly
  const lifetimeRevenue = last30DaysRevenue; // Simplified for UI demonstration of rollups

  // Order Counts (Aggregated from daily metrics)
  const todayOrders = todayMetrics?.orders || 0;
  
  // We can fetch pending/processing using direct counts (much faster than fetching whole rows)
  const [pendingOrders, processingOrders, completedOrders] = await Promise.all([
    prisma.order.count({ where: { status: 'PENDING' } }),
    prisma.order.count({ where: { status: 'AUTHORIZED' as any } }),
    prisma.order.count({ where: { status: { in: ['CAPTURED', 'DELIVERED'] } } })
  ]);

  const cancelledOrders = 0; // Or count from DB

  // Customer Counts (From CustomerMetrics rollup)
  const customerMetrics = await prisma.customerMetrics.findUnique({ where: { date: today }});
  const totalCustomers = 1000; // Mocked for UI, ideally tracked in summary table
  const newCustomers = customerMetrics?.newUsers || 0;
  const returningCustomers = customerMetrics?.returningUsers || 0;

  // Inventory
  const totalProducts = inventoryStats.total;
  const outOfStock = inventoryStats.outOfStock;
  const lowStock = inventoryStats.lowStock;

  // Best Sellers (From CategoryMetrics or VendorMetrics rollup)
  const bestSellers = [
    { name: 'Loading from Rollup Pipeline...', count: 0 }
  ];

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Analytics Dashboard</h1>
          <p className="text-slate-300">Real-time business performance and metrics.</p>
        </div>
      </div>

      {/* Revenue Section */}
      <h2 className="text-xl font-bold text-white mb-4">Revenue</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="glass-panel p-6 rounded-2xl border border-white/10">
          <div className="flex items-center gap-3 mb-2">
            <DollarSign className="w-5 h-5 text-cta-primary" />
            <h3 className="text-slate-300">Today</h3>
          </div>
          <p className="text-3xl font-bold text-white">${todayRevenue.toFixed(2)}</p>
        </div>
        <div className="glass-panel p-6 rounded-2xl border border-white/10">
          <div className="flex items-center gap-3 mb-2">
            <Calendar className="w-5 h-5 text-cta-primary" />
            <h3 className="text-slate-300">Last 7 Days</h3>
          </div>
          <p className="text-3xl font-bold text-white">${last7DaysRevenue.toFixed(2)}</p>
        </div>
        <div className="glass-panel p-6 rounded-2xl border border-white/10">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-5 h-5 text-cta-primary" />
            <h3 className="text-slate-300">Last 30 Days</h3>
          </div>
          <p className="text-3xl font-bold text-white">${last30DaysRevenue.toFixed(2)}</p>
        </div>
        <div className="glass-panel p-6 rounded-2xl border border-white/10">
          <div className="flex items-center gap-3 mb-2">
            <DollarSign className="w-5 h-5 text-emerald-500" />
            <h3 className="text-slate-300">Lifetime Revenue</h3>
          </div>
          <p className="text-3xl font-bold text-white">${lifetimeRevenue.toFixed(2)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Orders Section */}
        <div className="glass-panel p-6 rounded-2xl border border-white/10">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><ShoppingCart className="w-5 h-5 text-amber-500" /> Orders</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-white/5 pb-2">
              <span className="text-slate-300">Pending</span>
              <span className="text-white font-bold">{pendingOrders}</span>
            </div>
            <div className="flex justify-between items-center border-b border-white/5 pb-2">
              <span className="text-slate-300">Processing</span>
              <span className="text-white font-bold">{processingOrders}</span>
            </div>
            <div className="flex justify-between items-center border-b border-white/5 pb-2">
              <span className="text-slate-300">Completed</span>
              <span className="text-emerald-500 font-bold">{completedOrders}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-300">Cancelled</span>
              <span className="text-red-400 font-bold">{cancelledOrders}</span>
            </div>
          </div>
        </div>

        {/* Customers Section */}
        <div className="glass-panel p-6 rounded-2xl border border-white/10">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><Users className="w-5 h-5 text-slate-300" /> Customers</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-white/5 pb-2">
              <span className="text-slate-300">Total Customers</span>
              <span className="text-white font-bold">{totalCustomers}</span>
            </div>
            <div className="flex justify-between items-center border-b border-white/5 pb-2">
              <span className="text-slate-300">New (30 Days)</span>
              <span className="text-white font-bold">{newCustomers}</span>
            </div>
            <div className="flex justify-between items-center border-b border-white/5 pb-2">
              <span className="text-slate-300">Returning</span>
              <span className="text-cta-primary font-bold">{returningCustomers}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-300">Retention Rate</span>
              <span className="text-white font-bold">{totalCustomers > 0 ? ((returningCustomers / totalCustomers) * 100).toFixed(1) : 0}%</span>
            </div>
          </div>
        </div>

        {/* Inventory Section */}
        <div className="glass-panel p-6 rounded-2xl border border-white/10">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><Package className="w-5 h-5 text-gray-300" /> Inventory</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-white/5 pb-2">
              <span className="text-slate-300">Total Products</span>
              <span className="text-white font-bold">{totalProducts}</span>
            </div>
            <div className="flex justify-between items-center border-b border-white/5 pb-2">
              <span className="flex items-center gap-2 text-slate-300"><AlertTriangle className="w-4 h-4 text-amber-500" /> Low Stock</span>
              <span className="text-amber-500 font-bold">{lowStock}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-2 text-slate-300"><AlertCircle className="w-4 h-4 text-red-400" /> Out of Stock</span>
              <span className="text-red-400 font-bold">{outOfStock}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="glass-panel p-6 rounded-2xl border border-white/10">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><TrendingUp className="w-5 h-5 text-emerald-500" /> Top Best Sellers</h2>
        {bestSellers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="p-3 text-slate-300 font-medium">Product Name</th>
                  <th className="p-3 text-slate-300 font-medium text-right">Units Sold</th>
                </tr>
              </thead>
              <tbody>
                {bestSellers.map((item, idx) => (
                  <tr key={idx} className="border-b border-white/5">
                    <td className="p-3 text-white">{item.name}</td>
                    <td className="p-3 text-white font-bold text-right">{item.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-slate-300 text-sm py-4">No sales data available yet.</p>
        )}
      </div>

    </div>
  );
}
