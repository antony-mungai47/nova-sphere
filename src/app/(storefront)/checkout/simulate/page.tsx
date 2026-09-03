import React from 'react';
import { prisma } from "@/lib/prisma";
import { redirect } from 'next/navigation';
import { CreditCard, ShieldCheck, Lock } from 'lucide-react';
import { AnimatedButton } from '@/shared/components/ui/animated-button';

export default async function SimulateCheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ orderId?: string }>;
}) {
  const resolvedParams = await searchParams;
  const orderId = resolvedParams.orderId;

  if (!orderId) {
    redirect('/store');
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: {
        include: { 
          product: {
            include: { images: true }
          }
        }
      },
      user: true
    }
  });

  if (!order || order.status === 'CAPTURED') {
    redirect('/checkout/success');
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white/5 border border-white/10 rounded-3xl overflow-hidden glass-panel">
        <div className="p-8 border-b border-white/10 bg-gradient-to-r from-nova-blue/10 to-transparent flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1 flex items-center gap-2">
              <Lock className="w-5 h-5 text-green-400" /> Secure Checkout Simulation
            </h1>
            <p className="text-nova-silver text-sm">TEST MODE - No actual payment will be processed.</p>
          </div>
          <div className="text-right">
            <p className="text-nova-silver text-sm">Amount Due</p>
            <p className="text-3xl font-bold text-white">${order.totalAmount.toFixed(2)}</p>
          </div>
        </div>

        <div className="p-8 grid md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-white font-medium mb-4 text-lg">Order Summary</h3>
            <div className="space-y-4 mb-6">
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/5 rounded-lg overflow-hidden border border-white/10 relative">
                      <img src={item.product.images?.[0]?.url || ''} alt={item.product.name as string} className="object-cover w-full h-full" />
                    </div>
                    <div>
                      <p className="text-white text-sm line-clamp-1">{item.product.name}</p>
                      <p className="text-nova-silver text-xs">Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <p className="text-white font-medium">${(item.price.toNumber() * item.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>
            
            <div className="border-t border-white/10 pt-4 space-y-2">
              <div className="flex justify-between text-sm text-nova-silver">
                <span>Subtotal</span>
                <span>${order.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-nova-silver">
                <span>Tax</span>
                <span>${order.tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-nova-silver">
                <span>Shipping</span>
                <span>${order.shippingCost.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="bg-black/50 p-6 rounded-2xl border border-white/5">
            <h3 className="text-white font-medium mb-4 text-lg">Test Payment Info</h3>
            
            <div className="space-y-4 mb-8">
              <div className="p-4 bg-white/5 rounded-xl border border-white/10 flex items-center gap-3">
                <CreditCard className="text-nova-blue w-6 h-6" />
                <div>
                  <p className="text-white text-sm font-medium">Test Card ending in 4242</p>
                  <p className="text-nova-silver text-xs">Exp: 12/28 • CVC: ***</p>
                </div>
              </div>
              <p className="text-xs text-nova-silver text-center flex items-center justify-center gap-1">
                <ShieldCheck className="w-3 h-3 text-green-400" /> Encrypted and Secure
              </p>
            </div>

            <form action="/api/checkout/simulate-webhook" method="POST">
              <input type="hidden" name="orderId" value={order.id} />
              <div className="mb-4">
                <label className="text-nova-silver text-sm block mb-2">Simulate Scenario:</label>
                <select name="scenario" className="w-full bg-black/50 border border-white/10 text-white rounded-lg p-2 text-sm focus:outline-none focus:ring-1 focus:ring-nova-blue">
                  <option value="success">Success</option>
                  <option value="payment_declined">Payment Declined</option>
                  <option value="stripe_timeout">Stripe Timeout</option>
                  <option value="database_deadlock">Database Deadlock</option>
                  <option value="duplicate_webhook">Duplicate Webhook</option>
                </select>
              </div>
              <button 
                type="submit"
                className="w-full relative inline-flex items-center justify-center px-8 py-3 text-sm font-medium transition-colors rounded-full overflow-hidden focus:outline-none focus:ring-2 focus:ring-nova-blue focus:ring-offset-2 focus:ring-offset-background bg-nova-blue text-white hover:bg-blue-600 shadow-[0_0_20px_rgba(59,130,246,0.5)]"
              >
                Pay ${order.totalAmount.toFixed(2)}
              </button>
            </form>
            <p className="text-center text-xs text-nova-silver mt-4">
              By clicking "Pay", you agree to our Terms of Service.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
