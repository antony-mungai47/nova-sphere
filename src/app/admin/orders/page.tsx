import React from "react";
import { prisma } from "@/lib/prisma";
import { OrderActions } from "./order-actions";


export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    include: {
      user: true,
      items: {
        include: { product: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-white mb-2">Order Management</h1>
      <p className="text-slate-300 mb-8">View and manage all customer orders.</p>

      <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-white/5 border-b border-white/10">
            <tr>
              <th className="p-4 text-slate-300 font-medium">Order ID</th>
              <th className="p-4 text-slate-300 font-medium">Customer</th>
              <th className="p-4 text-slate-300 font-medium">Date</th>
              <th className="p-4 text-slate-300 font-medium">Status</th>
              <th className="p-4 text-slate-300 font-medium">Items</th>
              <th className="p-4 text-slate-300 font-medium text-right">Total</th>
              <th className="p-4 text-slate-300 font-medium text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {orders.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-slate-300">No orders found.</td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order.id} className="hover:bg-white/5 transition-colors">
                  <td className="p-4 text-white font-mono text-sm">{order.id.slice(-8)}</td>
                  <td className="p-4 text-white">{order.user.name || order.user.email}</td>
                  <td className="p-4 text-slate-300">{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 text-xs rounded-full border ${
                      order.status === 'PENDING' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/20' :
                      order.status === 'CAPTURED' ? 'bg-emerald-500/20 text-emerald-500 border-emerald-500/20' :
                      'bg-cta-primary/20 text-cta-primary border-cta-primary/20'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="p-4 text-slate-300 text-sm">{order.items.reduce((sum, item) => sum + item.quantity, 0)} items</td>
                  <td className="p-4 text-right text-white font-medium">${order.totalAmount.toFixed(2)}</td>
                  <td className="p-4 text-center">
                    <OrderActions orderId={order.id} currentStatus={order.status} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
