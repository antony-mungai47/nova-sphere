import React from 'react';
import { prisma } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

export const dynamic = "force-dynamic";

export default async function VendorDashboard() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!user) {
    redirect('/login');
  }

  // Query actual data
  const products = await prisma.product.findMany({
    where: { ownerTenantId: user.id },
    select: { id: true, name: true, price: true, stock: true }
  });

  const productIds = products.map(p => p.id);

  const orderItems = await prisma.orderItem.findMany({
    where: { productId: { in: productIds } },
    include: { order: true }
  });

  const totalRevenue = orderItems.reduce((acc, item) => {
    if (item.order.status !== 'CANCELLED' && item.order.status !== 'FAILED') {
      return acc + (Number(item.price) * item.quantity);
    }
    return acc;
  }, 0);

  const pendingOrdersCount = new Set(
    orderItems
      .filter(item => item.order.status === 'CREATED')
      .map(item => item.orderId)
  ).size;

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6 text-white">Vendor Center</h1>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-[#1a1f2e] border border-white/10 p-6 rounded-xl shadow-lg">
          <h2 className="text-nova-silver text-sm uppercase tracking-wide">Total Revenue</h2>
          <p className="text-4xl font-semibold mt-2 text-white">${totalRevenue.toFixed(2)}</p>
        </div>
        <div className="bg-[#1a1f2e] border border-white/10 p-6 rounded-xl shadow-lg">
          <h2 className="text-nova-silver text-sm uppercase tracking-wide">My Products</h2>
          <p className="text-4xl font-semibold mt-2 text-white">{products.length}</p>
        </div>
        <div className="bg-[#1a1f2e] border border-white/10 p-6 rounded-xl shadow-lg">
          <h2 className="text-nova-silver text-sm uppercase tracking-wide">Open Orders</h2>
          <p className="text-3xl font-bold text-white">{pendingOrdersCount}</p>
        </div>
        <div className="bg-[#1a1f2e] border border-white/10 p-6 rounded-xl shadow-lg">
          <h2 className="text-nova-silver text-sm uppercase tracking-wide">Health Score</h2>
          <p className="text-4xl font-semibold mt-2 text-green-500">100/100</p>
        </div>
      </div>
      
      <div className="bg-[#1a1f2e] border border-white/10 rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-white mb-4">Recent Order Items</h2>
        {orderItems.length === 0 ? (
          <p className="text-nova-silver">No orders yet.</p>
        ) : (
          <table className="w-full text-left text-sm text-nova-silver">
            <thead className="bg-black/30 text-white uppercase font-bold text-xs">
              <tr>
                <th className="px-4 py-3">Order ID</th>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Quantity</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {orderItems.slice(0, 5).map(item => {
                const p = products.find(prod => prod.id === item.productId);
                return (
                  <tr key={item.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3">{item.orderId.slice(-6)}</td>
                    <td className="px-4 py-3 text-white">{p?.name || 'Unknown'}</td>
                    <td className="px-4 py-3">{item.quantity}</td>
                    <td className="px-4 py-3">${Number(item.price).toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <span className="bg-nova-blue/20 text-nova-blue px-2 py-1 rounded-full text-xs font-bold border border-nova-blue/30 uppercase">
                        {item.order.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
