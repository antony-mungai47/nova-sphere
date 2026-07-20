import React from "react";
import { prisma } from "@/lib/prisma";
import { DollarSign, TrendingUp, RefreshCw, Landmark, Receipt, FileText } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function FinancialsDashboard() {
  const [
    allOrders,
    transactions,
    recentRefunds
  ] = await Promise.all([
    prisma.order.findMany({
      where: { status: { in: ["CAPTURED", "SHIPPED", "DELIVERED", "REFUNDED"] } },
      select: { totalAmount: true, status: true, tax: true, shippingCost: true, discount: true }
    }),
    prisma.paymentTransaction.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
      include: { paymentAttempt: { include: { order: true } } }
    }),
    prisma.paymentTransaction.findMany({
      where: { type: "REFUND" },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { paymentAttempt: { include: { order: true } } }
    })
  ]);

  const grossRevenue = allOrders.reduce((sum, order) => sum + order.totalAmount.toNumber(), 0);
  const totalTax = allOrders.reduce((sum, order) => sum + order.tax.toNumber(), 0);
  const totalShipping = allOrders.reduce((sum, order) => sum + order.shippingCost.toNumber(), 0);
  const totalRefunded = allOrders
    .filter(o => o.status === "REFUNDED")
    .reduce((sum, order) => sum + order.totalAmount.toNumber(), 0);
  
  const netRevenue = grossRevenue - totalRefunded - totalTax - totalShipping;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Financial Overview</h1>
          <p className="text-nova-silver">Real-time revenue, taxes, and transaction history.</p>
        </div>
        <button className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white px-4 py-2 rounded-lg border border-white/10 transition-colors">
          <FileText className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-10">
        <div className="glass-panel p-6 rounded-2xl border border-white/10 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-nova-emerald/10 rounded-full blur-[40px] -mr-10 -mt-10 group-hover:bg-nova-emerald/20 transition-all" />
          <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 mb-4 relative z-10">
            <TrendingUp className="w-5 h-5 text-nova-emerald" />
          </div>
          <h3 className="text-nova-silver mb-1 text-sm relative z-10">Gross Revenue</h3>
          <p className="text-2xl font-bold text-white relative z-10">${grossRevenue.toFixed(2)}</p>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-white/10 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-[40px] -mr-10 -mt-10 group-hover:bg-red-500/20 transition-all" />
          <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 mb-4 relative z-10">
            <RefreshCw className="w-5 h-5 text-red-400" />
          </div>
          <h3 className="text-nova-silver mb-1 text-sm relative z-10">Total Refunded</h3>
          <p className="text-2xl font-bold text-white relative z-10">${totalRefunded.toFixed(2)}</p>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-white/10 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-nova-blue/10 rounded-full blur-[40px] -mr-10 -mt-10 group-hover:bg-nova-blue/20 transition-all" />
          <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 mb-4 relative z-10">
            <DollarSign className="w-5 h-5 text-nova-blue" />
          </div>
          <h3 className="text-nova-silver mb-1 text-sm relative z-10">Net Revenue</h3>
          <p className="text-2xl font-bold text-white relative z-10">${netRevenue.toFixed(2)}</p>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-white/10 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-nova-amber/10 rounded-full blur-[40px] -mr-10 -mt-10 group-hover:bg-nova-amber/20 transition-all" />
          <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 mb-4 relative z-10">
            <Landmark className="w-5 h-5 text-nova-amber" />
          </div>
          <h3 className="text-nova-silver mb-1 text-sm relative z-10">Taxes Collected</h3>
          <p className="text-2xl font-bold text-white relative z-10">${totalTax.toFixed(2)}</p>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-white/10 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-[40px] -mr-10 -mt-10 group-hover:bg-amber-500/20 transition-all" />
          <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 mb-4 relative z-10">
            <Receipt className="w-5 h-5 text-amber-400" />
          </div>
          <h3 className="text-nova-silver mb-1 text-sm relative z-10">Shipping Collected</h3>
          <p className="text-2xl font-bold text-white relative z-10">${totalShipping.toFixed(2)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <h2 className="text-xl font-bold text-white mb-6">Ledger / Transactions</h2>
          <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-white/5 border-b border-white/10">
                <tr>
                  <th className="p-4 text-nova-silver text-xs font-medium uppercase tracking-wider">Date</th>
                  <th className="p-4 text-nova-silver text-xs font-medium uppercase tracking-wider">Type</th>
                  <th className="p-4 text-nova-silver text-xs font-medium uppercase tracking-wider">Gateway ID</th>
                  <th className="p-4 text-nova-silver text-xs font-medium uppercase tracking-wider">Status</th>
                  <th className="p-4 text-nova-silver text-xs font-medium uppercase tracking-wider text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-nova-silver">No transactions recorded yet.</td>
                  </tr>
                ) : (
                  transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-white/5 transition-colors">
                      <td className="p-4 text-nova-silver text-sm">{new Date(tx.createdAt).toLocaleDateString()}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 text-xs rounded-full border ${tx.type === 'CHARGE' ? 'bg-nova-emerald/10 text-nova-emerald border-nova-emerald/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                          {tx.type}
                        </span>
                      </td>
                      <td className="p-4 text-nova-silver font-mono text-xs">{tx.providerId || "SIMULATED"}</td>
                      <td className="p-4">
                        <span className="text-nova-silver text-sm">{tx.status}</span>
                      </td>
                      <td className="p-4 text-right text-white font-medium">
                        {tx.type === 'REFUND' ? '-' : ''}${tx.amount.toFixed(2)} {tx.currency}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-bold text-white mb-6">Recent Refunds</h2>
          <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4">
            {recentRefunds.length === 0 ? (
              <p className="text-nova-silver text-sm">No refunds processed recently.</p>
            ) : (
              recentRefunds.map(refund => (
                <div key={refund.id} className="flex items-center justify-between border-b border-white/5 pb-4 last:border-0 last:pb-0">
                  <div>
                    <h4 className="text-white font-medium text-sm">Order #{(refund as any).paymentAttempt?.order?.id?.slice(-8) || "UNKNOWN"}</h4>
                    <p className="text-nova-silver text-xs font-mono">{refund.providerId || "SIMULATED"}</p>
                  </div>
                  <span className="text-red-400 font-bold text-sm">
                    -${refund.amount.toFixed(2)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
