import React from "react";
import { prisma } from "@/lib/prisma";
import { DollarSign, ShoppingCart, TrendingUp, Users } from "lucide-react";

export default async function AdminAnalyticsPage() {
  const [orders, customers, products] = await Promise.all([
    prisma.order.findMany({ select: { totalAmount: true, createdAt: true, status: true } }),
    prisma.user.count(),
    prisma.product.count()
  ]);

  const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
  const averageOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;
  
  const completedOrders = orders.filter(o => o.status === 'DELIVERED' || o.status === 'PAID');
  const completedRevenue = completedOrders.reduce((sum, order) => sum + order.totalAmount, 0);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-white mb-2">Analytics Dashboard</h1>
      <p className="text-nova-silver mb-8">Detailed insights into sales, revenue, and customer metrics.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="glass-panel p-6 rounded-2xl border border-white/10">
          <div className="flex items-center gap-3 mb-2">
            <DollarSign className="w-5 h-5 text-nova-blue" />
            <h3 className="text-nova-silver">Total Revenue</h3>
          </div>
          <p className="text-3xl font-bold text-white">${totalRevenue.toFixed(2)}</p>
          <p className="text-xs text-nova-emerald mt-2 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> Realized: ${completedRevenue.toFixed(2)}
          </p>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-white/10">
          <div className="flex items-center gap-3 mb-2">
            <ShoppingCart className="w-5 h-5 text-nova-amber" />
            <h3 className="text-nova-silver">Total Orders</h3>
          </div>
          <p className="text-3xl font-bold text-white">{orders.length}</p>
          <p className="text-xs text-nova-silver mt-2">
            AOV: ${averageOrderValue.toFixed(2)}
          </p>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-white/10">
          <div className="flex items-center gap-3 mb-2">
            <Users className="w-5 h-5 text-nova-emerald" />
            <h3 className="text-nova-silver">Total Customers</h3>
          </div>
          <p className="text-3xl font-bold text-white">{customers}</p>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-white/10">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-5 h-5 text-purple-400" />
            <h3 className="text-nova-silver">Conversion Rate</h3>
          </div>
          <p className="text-3xl font-bold text-white">{(customers > 0 ? (orders.length / customers) * 100 : 0).toFixed(1)}%</p>
          <p className="text-xs text-nova-silver mt-2">Orders per customer</p>
        </div>
      </div>

      <div className="glass-panel p-6 rounded-2xl border border-white/10">
        <h2 className="text-xl font-bold text-white mb-6">Recent Sales Activity</h2>
        <div className="h-64 flex items-center justify-center border border-white/5 rounded-xl bg-black/20">
          <p className="text-nova-silver text-sm">Detailed charts require an external charting library (e.g., Recharts) which is currently not installed. But the real database metrics above show live aggregate data.</p>
        </div>
      </div>
    </div>
  );
}
