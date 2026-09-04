"use client";

import React, { useState } from "react";
import { createCoupon, toggleCouponActive } from "./actions";
import { Plus, Tag, ToggleLeft, ToggleRight, Loader2 } from "lucide-react";

export function CouponManager({ coupons }: { coupons: any[] }) {
  const [code, setCode] = useState("");
  const [discount, setDiscount] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [toggling, setToggling] = useState<string | null>(null);

  const handleCreate = async () => {
    if (!code || !discount) return;
    setIsCreating(true);
    try {
      await createCoupon(code, parseFloat(discount));
      setCode("");
      setDiscount("");
    } catch (e: any) {
      alert(e.message);
    } finally {
      setIsCreating(false);
    }
  };

  const handleToggle = async (id: string, current: boolean) => {
    setToggling(id);
    try {
      await toggleCouponActive(id, !current);
    } catch (e: any) {
      alert(e.message);
    } finally {
      setToggling(null);
    }
  };

  return (
    <div>
      <div className="glass-panel p-6 rounded-2xl border border-white/10 mb-8 flex flex-col md:flex-row gap-4 items-end">
        <div className="flex-1 w-full">
          <label className="block text-slate-300 text-sm mb-2">Coupon Code</label>
          <input 
            type="text" 
            placeholder="e.g. SUMMER20" 
            value={code} 
            onChange={e => setCode(e.target.value.toUpperCase())}
            className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cta-primary"
          />
        </div>
        <div className="w-full md:w-32">
          <label className="block text-slate-300 text-sm mb-2">Discount %</label>
          <input 
            type="number" 
            min="1" 
            max="100" 
            placeholder="20" 
            value={discount} 
            onChange={e => setDiscount(e.target.value)}
            className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cta-primary"
          />
        </div>
        <button 
          onClick={handleCreate}
          disabled={!code || !discount || isCreating}
          className="w-full md:w-auto h-[50px] px-6 bg-cta-primary text-white rounded-xl font-medium hover:bg-orange- transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isCreating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
          Create
        </button>
      </div>

      <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-white/5 border-b border-white/10">
            <tr>
              <th className="p-4 text-slate-300 font-medium">Coupon Code</th>
              <th className="p-4 text-slate-300 font-medium text-center">Discount</th>
              <th className="p-4 text-slate-300 font-medium text-center">Status</th>
              <th className="p-4 text-slate-300 font-medium text-right">Toggle</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {coupons.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-8 text-center text-slate-300">No coupons found.</td>
              </tr>
            ) : (
              coupons.map(c => (
                <tr key={c.id} className="hover:bg-white/5 transition-colors">
                  <td className="p-4 text-white font-mono font-bold flex items-center gap-2">
                    <Tag className="w-4 h-4 text-cta-primary" /> {c.code}
                  </td>
                  <td className="p-4 text-center text-emerald-500 font-medium">{c.discountValue}% OFF</td>
                  <td className="p-4 text-center">
                    <span className={`px-2 py-1 text-xs rounded-full border ${c.isActive ? 'bg-emerald-500/20 text-emerald-500 border-emerald-500/20' : 'bg-white/5 text-slate-300 border-white/10'}`}>
                      {c.isActive ? "ACTIVE" : "INACTIVE"}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button 
                      onClick={() => handleToggle(c.id, c.isActive)}
                      disabled={toggling === c.id}
                      className="text-slate-300 hover:text-white transition-colors disabled:opacity-50"
                    >
                      {toggling === c.id ? <Loader2 className="w-6 h-6 animate-spin" /> : 
                       c.isActive ? <ToggleRight className="w-8 h-8 text-emerald-500" /> : <ToggleLeft className="w-8 h-8" />}
                    </button>
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
