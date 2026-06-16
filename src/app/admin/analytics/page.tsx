import React from "react";
import { prisma } from "@/lib/prisma";
import { DollarSign, ShoppingCart, TrendingUp, Users, Package, AlertTriangle, AlertCircle, Calendar } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function AdminAnalyticsPage() {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(today.getDate() - 7);
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(today.getDate() - 30);

  const [orders, customers, products] = await Promise.all([
    prisma.order.findMany({ 
      include: { orderItems: { include: { product: true } } }
    }),
    prisma.user.findMany({
      include: { orders: true }
    }),
    prisma.product.findMany()
  ]);

  // Revenue Calculations
  const lifetimeRevenue = orders.filter(o => o.status === 'PAID' || o.status === 'DELIVERED').reduce((sum, o) => sum + o.totalAmount, 0);
  const todayRevenue = orders.filter(o => o.createdAt >= today && (o.status === 'PAID' || o.status === 'DELIVERED')).reduce((sum, o) => sum + o.totalAmount, 0);
  const last7DaysRevenue = orders.filter(o => o.createdAt >= sevenDaysAgo && (o.status === 'PAID' || o.status === 'DELIVERED')).reduce((sum, o) => sum + o.totalAmount, 0);
  const last30DaysRevenue = orders.filter(o => o.createdAt >= thirtyDaysAgo && (o.status === 'PAID' || o.status === 'DELIVERED')).reduce((sum, o) => sum + o.totalAmount, 0);

  // Order Counts
  const pendingOrders = orders.filter(o => o.status === 'PENDING').length;
  const processingOrders = orders.filter(o => o.status === 'PROCESSING').length;
  const completedOrders = orders.filter(o => o.status === 'DELIVERED' || o.status === 'PAID').length;
  const cancelledOrders = orders.filter(o => o.status === 'CANCELLED').length;

  // Customer Counts
  const totalCustomers = customers.length;
  const newCustomers = customers.filter(c => c.createdAt >= thirtyDaysAgo).length;
  const returningCustomers = customers.filter(c => c.orders.length > 1).length;

  // Inventory
  const totalProducts = products.length;
  const outOfStock = products.filter(p => p.stock === 0).length;
  const lowStock = products.filter(p => p.stock > 0 && p.stock <= 10).length;

  // Best Sellers (Simple aggregation)
  const productSales: Record<string, {name: string, count: number}> = {};
  orders.forEach(order => {
    if (order.status !== 'CANCELLED') {
      order.orderItems.forEach(item => {
        if (!productSales[item.productId]) {
          productSales[item.productId] = { name: item.product.name, count: 0 };
        }
        productSales[item.productId].count += item.quantity;
      });
    }
  });
  
  const bestSellers = Object.values(productSales)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Analytics Dashboard</h1>
          <p className="text-nova-silver">Real-time business performance and metrics.</p>
        </div>
      </div>

      {/* Revenue Section */}
      <h2 className="text-xl font-bold text-white mb-4">Revenue</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="glass-panel p-6 rounded-2xl border border-white/10">
          <div className="flex items-center gap-3 mb-2">
            <DollarSign className="w-5 h-5 text-nova-blue" />
            <h3 className="text-nova-silver">Today</h3>
          </div>
          <p className="text-3xl font-bold text-white">${todayRevenue.toFixed(2)}</p>
        </div>
        <div className="glass-panel p-6 rounded-2xl border border-white/10">
          <div className="flex items-center gap-3 mb-2">
            <Calendar className="w-5 h-5 text-nova-blue" />
            <h3 className="text-nova-silver">Last 7 Days</h3>
          </div>
          <p className="text-3xl font-bold text-white">${last7DaysRevenue.toFixed(2)}</p>
        </div>
        <div className="glass-panel p-6 rounded-2xl border border-white/10">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-5 h-5 text-nova-blue" />
            <h3 className="text-nova-silver">Last 30 Days</h3>
          </div>
          <p className="text-3xl font-bold text-white">${last30DaysRevenue.toFixed(2)}</p>
        </div>
        <div className="glass-panel p-6 rounded-2xl border border-white/10">
          <div className="flex items-center gap-3 mb-2">
            <DollarSign className="w-5 h-5 text-nova-emerald" />
            <h3 className="text-nova-silver">Lifetime Revenue</h3>
          </div>
          <p className="text-3xl font-bold text-white">${lifetimeRevenue.toFixed(2)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Orders Section */}
        <div className="glass-panel p-6 rounded-2xl border border-white/10">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><ShoppingCart className="w-5 h-5 text-nova-amber" /> Orders</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-white/5 pb-2">
              <span className="text-nova-silver">Pending</span>
              <span className="text-white font-bold">{pendingOrders}</span>
            </div>
            <div className="flex justify-between items-center border-b border-white/5 pb-2">
              <span className="text-nova-silver">Processing</span>
              <span className="text-white font-bold">{processingOrders}</span>
            </div>
            <div className="flex justify-between items-center border-b border-white/5 pb-2">
              <span className="text-nova-silver">Completed</span>
              <span className="text-nova-emerald font-bold">{completedOrders}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-nova-silver">Cancelled</span>
              <span className="text-red-400 font-bold">{cancelledOrders}</span>
            </div>
          </div>
        </div>

        {/* Customers Section */}
        <div className="glass-panel p-6 rounded-2xl border border-white/10">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><Users className="w-5 h-5 text-purple-400" /> Customers</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-white/5 pb-2">
              <span className="text-nova-silver">Total Customers</span>
              <span className="text-white font-bold">{totalCustomers}</span>
            </div>
            <div className="flex justify-between items-center border-b border-white/5 pb-2">
              <span className="text-nova-silver">New (30 Days)</span>
              <span className="text-white font-bold">{newCustomers}</span>
            </div>
            <div className="flex justify-between items-center border-b border-white/5 pb-2">
              <span className="text-nova-silver">Returning</span>
              <span className="text-nova-blue font-bold">{returningCustomers}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-nova-silver">Retention Rate</span>
              <span className="text-white font-bold">{totalCustomers > 0 ? ((returningCustomers / totalCustomers) * 100).toFixed(1) : 0}%</span>
            </div>
          </div>
        </div>

        {/* Inventory Section */}
        <div className="glass-panel p-6 rounded-2xl border border-white/10">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><Package className="w-5 h-5 text-gray-300" /> Inventory</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-white/5 pb-2">
              <span className="text-nova-silver">Total Products</span>
              <span className="text-white font-bold">{totalProducts}</span>
            </div>
            <div className="flex justify-between items-center border-b border-white/5 pb-2">
              <span className="flex items-center gap-2 text-nova-silver"><AlertTriangle className="w-4 h-4 text-nova-amber" /> Low Stock</span>
              <span className="text-nova-amber font-bold">{lowStock}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-2 text-nova-silver"><AlertCircle className="w-4 h-4 text-red-400" /> Out of Stock</span>
              <span className="text-red-400 font-bold">{outOfStock}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="glass-panel p-6 rounded-2xl border border-white/10">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><TrendingUp className="w-5 h-5 text-nova-emerald" /> Top Best Sellers</h2>
        {bestSellers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="p-3 text-nova-silver font-medium">Product Name</th>
                  <th className="p-3 text-nova-silver font-medium text-right">Units Sold</th>
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
          <p className="text-nova-silver text-sm py-4">No sales data available yet.</p>
        )}
      </div>

    </div>
  );
}
