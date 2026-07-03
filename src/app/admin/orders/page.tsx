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
      <p className="text-nova-silver mb-8">View and manage all customer orders.</p>

      <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-white/5 border-b border-white/10">
            <tr>
              <th className="p-4 text-nova-silver font-medium">Order ID</th>
              <th className="p-4 text-nova-silver font-medium">Customer</th>
              <th className="p-4 text-nova-silver font-medium">Date</th>
              <th className="p-4 text-nova-silver font-medium">Status</th>
              <th className="p-4 text-nova-silver font-medium">Items</th>
              <th className="p-4 text-nova-silver font-medium text-right">Total</th>
              <th className="p-4 text-nova-silver font-medium text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {orders.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-nova-silver">No orders found.</td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order.id} className="hover:bg-white/5 transition-colors">
                  <td className="p-4 text-white font-mono text-sm">{order.id.slice(-8)}</td>
                  <td className="p-4 text-white">{order.user.name || order.user.email}</td>
                  <td className="p-4 text-nova-silver">{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 text-xs rounded-full border ${
                      order.status === 'PENDING' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/20' :
                      order.status === 'CAPTURED' ? 'bg-nova-emerald/20 text-nova-emerald border-nova-emerald/20' :
                      'bg-nova-blue/20 text-nova-blue border-nova-blue/20'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="p-4 text-nova-silver text-sm">{order.items.reduce((sum, item) => sum + item.quantity, 0)} items</td>
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
