import React from "react";
import { PrismaClient } from "@prisma/client";
import { DollarSign, Package, ShoppingCart, TrendingUp } from "lucide-react";

const prisma = new PrismaClient();

export default async function AdminOverview() {
  const [totalProducts, totalOrders, orders] = await Promise.all([
    prisma.product.count(),
    prisma.order.count(),
    prisma.order.findMany({
      include: { user: true },
      orderBy: { createdAt: 'desc' },
      take: 5
    })
  ]);

  const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Dashboard Overview</h1>
          <p className="text-nova-silver">Real-time metrics and system status.</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div className="glass-panel p-6 rounded-2xl border border-white/10 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-nova-blue/10 rounded-full blur-[40px] -mr-10 -mt-10 group-hover:bg-nova-blue/20 transition-all" />
          <div className="flex items-center justify-between mb-4 relative z-10">
            <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
              <DollarSign className="w-6 h-6 text-nova-blue" />
            </div>
            <span className="text-green-400 flex items-center gap-1 text-sm"><TrendingUp className="w-3 h-3" /> +12.5%</span>
          </div>
          <h3 className="text-nova-silver mb-1 relative z-10">Total Revenue</h3>
          <p className="text-3xl font-bold text-white relative z-10">${totalRevenue.toFixed(2)}</p>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-white/10 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-nova-amber/10 rounded-full blur-[40px] -mr-10 -mt-10 group-hover:bg-nova-amber/20 transition-all" />
          <div className="flex items-center justify-between mb-4 relative z-10">
            <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
              <ShoppingCart className="w-6 h-6 text-nova-amber" />
            </div>
            <span className="text-green-400 flex items-center gap-1 text-sm"><TrendingUp className="w-3 h-3" /> +8.2%</span>
          </div>
          <h3 className="text-nova-silver mb-1 relative z-10">Total Orders</h3>
          <p className="text-3xl font-bold text-white relative z-10">{totalOrders}</p>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-white/10 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-[40px] -mr-10 -mt-10 group-hover:bg-purple-500/20 transition-all" />
          <div className="flex items-center justify-between mb-4 relative z-10">
            <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
              <Package className="w-6 h-6 text-purple-400" />
            </div>
            <span className="text-nova-silver text-sm">Active</span>
          </div>
          <h3 className="text-nova-silver mb-1 relative z-10">Products</h3>
          <p className="text-3xl font-bold text-white relative z-10">{totalProducts}</p>
        </div>
      </div>

      {/* Recent Orders */}
      <h2 className="text-xl font-bold text-white mb-6">Recent Orders</h2>
      <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-white/5 border-b border-white/10">
            <tr>
              <th className="p-4 text-nova-silver font-medium">Order ID</th>
              <th className="p-4 text-nova-silver font-medium">Customer</th>
              <th className="p-4 text-nova-silver font-medium">Date</th>
              <th className="p-4 text-nova-silver font-medium">Status</th>
              <th className="p-4 text-nova-silver font-medium text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {orders.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-nova-silver">No orders found.</td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order.id} className="hover:bg-white/5 transition-colors">
                  <td className="p-4 text-white font-mono text-sm">{order.id.slice(-8)}</td>
                  <td className="p-4 text-white">{order.user.name || order.user.email}</td>
                  <td className="p-4 text-nova-silver">{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td className="p-4">
                    <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full border border-green-500/20">
                      {order.status}
                    </span>
                  </td>
                  <td className="p-4 text-right text-white font-medium">${order.totalAmount.toFixed(2)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
