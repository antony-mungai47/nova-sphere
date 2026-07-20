import React from 'react';
import { prisma } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

export const dynamic = "force-dynamic";

export default async function VendorOrdersPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!user) redirect('/login');

  const products = await prisma.product.findMany({
    where: { ownerTenantId: user.id },
    select: { id: true, name: true }
  });
  
  const productIds = products.map(p => p.id);

  const orderItems = await prisma.orderItem.findMany({
    where: { productId: { in: productIds } },
    include: { order: { include: { user: true } } },
    orderBy: { order: { createdAt: 'desc' } }
  });

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-white mb-8">Order Management</h1>

      <div className="bg-[#1a1f2e] border border-white/10 rounded-xl shadow-lg p-6">
        {orderItems.length === 0 ? (
          <p className="text-nova-silver">No orders have been placed for your products yet.</p>
        ) : (
          <table className="w-full text-left text-sm text-nova-silver">
            <thead className="bg-black/30 text-white uppercase font-bold text-xs">
              <tr>
                <th className="px-4 py-3">Order ID</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Qty</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {orderItems.map(item => {
                const prod = products.find(p => p.id === item.productId);
                return (
                  <tr key={item.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3 font-medium text-white">{item.orderId.slice(-8)}</td>
                    <td className="px-4 py-3">{new Date(item.order.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-white">{prod?.name}</td>
                    <td className="px-4 py-3">{item.order.user.email}</td>
                    <td className="px-4 py-3">{item.quantity}</td>
                    <td className="px-4 py-3 font-medium text-white">
                      ${(Number(item.price) * item.quantity).toFixed(2)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase border ${
                        item.order.status === 'DELIVERED' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                        item.order.status === 'PENDING' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                        'bg-nova-blue/20 text-nova-blue border-nova-blue/30'
                      }`}>
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
