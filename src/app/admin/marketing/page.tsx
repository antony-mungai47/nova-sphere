import React from "react";
import { prisma } from "@/lib/prisma";
import { CouponManager } from "./coupon-manager";
import { Tag, TrendingUp, AlertCircle } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminMarketingPage() {
  const coupons = await prisma.coupon.findMany({
    orderBy: { createdAt: 'desc' }
  });

  const activeCount = coupons.filter(c => c.isActive).length;
  const totalCount = coupons.length;

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Marketing & Promotions</h1>
        <p className="text-nova-silver">Create and manage discount codes to drive sales.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="glass-panel p-6 rounded-2xl border border-white/10 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-nova-emerald/10 flex items-center justify-center border border-nova-emerald/20">
            <TrendingUp className="w-6 h-6 text-nova-emerald" />
          </div>
          <div>
            <h3 className="text-nova-silver text-sm font-medium">Active Campaigns</h3>
            <p className="text-2xl font-bold text-white">{activeCount}</p>
          </div>
        </div>
        <div className="glass-panel p-6 rounded-2xl border border-white/10 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-nova-blue/10 flex items-center justify-center border border-nova-blue/20">
            <Tag className="w-6 h-6 text-nova-blue" />
          </div>
          <div>
            <h3 className="text-nova-silver text-sm font-medium">Total Coupons</h3>
            <p className="text-2xl font-bold text-white">{totalCount}</p>
          </div>
        </div>
      </div>

      <CouponManager coupons={coupons} />
    </div>
  );
}
