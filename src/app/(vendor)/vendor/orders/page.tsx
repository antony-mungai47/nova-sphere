import React from 'react';

import { IdentityFacade } from '@/modules/identity/IdentityFacade';
import { redirect } from 'next/navigation';

import { VendorProductQueryService } from '@/modules/commerce/application/queries/VendorProductQueryService';
import { VendorOrderQueryService } from '@/modules/commerce/application/queries/VendorOrderQueryService';

export const dynamic = "force-dynamic";

export default async function VendorOrdersPage() {
  const user = await IdentityFacade.getCurrentUser();
  if (!user) redirect('/login');
  
  const isVendor = await IdentityFacade.isVendor();
  if (!isVendor) redirect('/');

  const orderItems = await VendorOrderQueryService.getVendorOrders(user.id);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-white mb-8">Order Management</h1>

      <div className="bg-[#1a1f2e] border border-white/10 rounded-xl shadow-lg p-6">
        {orderItems.length === 0 ? (
          <p className="text-slate-300">No orders have been placed for your products yet.</p>
        ) : (
          <table className="w-full text-left text-sm text-slate-300">
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
                return (
                  <tr key={item.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3 font-medium text-white">{item.orderId.slice(-8)}</td>
                    <td className="px-4 py-3">{new Date(item.orderDate).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-white">{item.productName}</td>
                    <td className="px-4 py-3">{item.customerEmail}</td>
                    <td className="px-4 py-3">{item.quantity}</td>
                    <td className="px-4 py-3 font-medium text-white">
                      ${(Number(item.price) * item.quantity).toFixed(2)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase border ${
                        item.orderStatus === 'DELIVERED' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                        item.orderStatus === 'PENDING' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                        'bg-cta-primary/20 text-cta-primary border-cta-primary/30'
                      }`}>
                        {item.orderStatus}
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
