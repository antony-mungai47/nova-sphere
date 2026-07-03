import React from "react";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { format } from "date-fns";

export default async function InvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const order = await prisma.order.findUnique({
    where: { id: resolvedParams.id },
    include: {
      user: true,
      items: {
        include: { product: true }
      }
    }
  });

  if (!order) return notFound();

  return (
    <div className="bg-white min-h-screen p-8 text-black font-sans">
      <div className="max-w-4xl mx-auto border border-gray-200 p-12 shadow-sm bg-white">
        {/* Header */}
        <div className="flex justify-between items-start border-b border-gray-200 pb-8 mb-8">
          <div>
            <h1 className="text-3xl font-black tracking-widest text-black uppercase mb-1">NOVA SPHERE</h1>
            <p className="text-gray-500 text-sm">MARKETPLACE INC.</p>
            <div className="mt-4 text-sm text-gray-600 space-y-1">
              <p>123 Future Way, Suite 400</p>
              <p>San Francisco, CA 94107</p>
              <p>billing@novasphere.com</p>
            </div>
          </div>
          <div className="text-right">
            <h2 className="text-4xl font-bold text-gray-200 mb-2 uppercase tracking-wider">Invoice</h2>
            <div className="text-sm text-gray-600 space-y-1">
              <p><span className="font-semibold text-gray-800">Invoice #:</span> {order.id.slice(-10).toUpperCase()}</p>
              <p><span className="font-semibold text-gray-800">Date:</span> {format(new Date(order.createdAt), "MMM dd, yyyy")}</p>
              {order.stripeSessionId && (
                <p><span className="font-semibold text-gray-800">Transaction ID:</span> {order.stripeSessionId.slice(0, 16)}...</p>
              )}
            </div>
          </div>
        </div>

        {/* Bill To */}
        <div className="mb-10">
          <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-3">Billed To</h3>
          <div className="text-sm text-gray-600 space-y-1">
            <p className="font-semibold text-gray-900 text-base">{order.user.name || "Customer"}</p>
            <p>{order.user.email}</p>
          </div>
        </div>

        {/* Line Items */}
        <table className="w-full mb-10 text-sm text-left">
          <thead>
            <tr className="border-b border-gray-300 text-gray-800">
              <th className="py-3 font-semibold uppercase tracking-wider text-xs">Description</th>
              <th className="py-3 font-semibold uppercase tracking-wider text-xs text-center w-24">Qty</th>
              <th className="py-3 font-semibold uppercase tracking-wider text-xs text-right w-32">Unit Price</th>
              <th className="py-3 font-semibold uppercase tracking-wider text-xs text-right w-32">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {order.items.map((item) => (
              <tr key={item.id}>
                <td className="py-4">
                  <p className="font-medium text-gray-900">{item.product.name}</p>
                  <p className="text-gray-500 text-xs mt-1">SKU: {item.product.sku}</p>
                </td>
                <td className="py-4 text-center text-gray-700">{item.quantity}</td>
                <td className="py-4 text-right text-gray-700">${item.price.toFixed(2)}</td>
                <td className="py-4 text-right font-medium text-gray-900">${(item.price.toNumber() * item.quantity).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="flex justify-end">
          <div className="w-64 space-y-3 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>${order.subtotal.toFixed(2)}</span>
            </div>
            {order.discount.toNumber() > 0 && (
              <div className="flex justify-between text-red-600">
                <span>Discount</span>
                <span>-${order.discount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-gray-600">
              <span>Shipping</span>
              <span>{order.shippingCost.toNumber() > 0 ? `$${order.shippingCost.toFixed(2)}` : 'Free'}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Tax (8%)</span>
              <span>${order.tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg text-gray-900 border-t border-gray-300 pt-3 mt-3">
              <span>Total</span>
              <span>${order.totalAmount.toFixed(2)} {order.currency}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-gray-200 text-center text-xs text-gray-500">
          <p className="mb-2">Thank you for your business.</p>
          <p>Payment Status: <span className="font-bold text-gray-800">{order.status}</span></p>
          <p className="mt-4 no-print text-blue-600 hover:underline cursor-pointer" onClick={() => {/* Will be converted to client component or handled via JS */}}>
            <button className="px-4 py-2 bg-black text-white rounded mt-4" onClick={() => window.print()}>Print Invoice</button>
          </p>
        </div>
      </div>
    </div>
  );
}
