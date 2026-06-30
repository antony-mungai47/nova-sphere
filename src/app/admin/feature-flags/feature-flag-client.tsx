"use client";

import React, { useState, useTransition } from "react";
import { FeatureFlag } from "@prisma/client";
import { toggleFeatureFlag, updateFeatureFlagRollout } from "@/domains/Foundation/feature-flags/actions";
import { Search, ShieldAlert, Zap, Globe, MoreVertical, Edit2 } from "lucide-react";

export function FeatureFlagClient({ initialFlags }: { initialFlags: FeatureFlag[] }) {
  const [flags, setFlags] = useState<FeatureFlag[]>(initialFlags);
  const [search, setSearch] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleToggle = (id: string, currentlyEnabled: boolean) => {
    startTransition(async () => {
      // Optimistic update
      setFlags(prev => prev.map(f => f.id === id ? { ...f, enabled: !currentlyEnabled } : f));
      
      const result = await toggleFeatureFlag(id, !currentlyEnabled, "Admin Dashboard Toggle");
      
      if (!result.success) {
        // Revert on failure
        setFlags(prev => prev.map(f => f.id === id ? { ...f, enabled: currentlyEnabled } : f));
        alert("Failed to toggle flag");
      }
    });
  };

  const handleRolloutChange = (id: string, currentRollout: number) => {
    const newRolloutStr = prompt("Enter new rollout percentage (0-100):", currentRollout.toString());
    if (newRolloutStr === null) return;
    
    const newRollout = parseInt(newRolloutStr, 10);
    if (isNaN(newRollout) || newRollout < 0 || newRollout > 100) {
      alert("Invalid percentage");
      return;
    }

    startTransition(async () => {
      setFlags(prev => prev.map(f => f.id === id ? { ...f, rolloutPercentage: newRollout } : f));
      const result = await updateFeatureFlagRollout(id, newRollout, "Admin Dashboard Rollout Update");
      if (!result.success) {
        setFlags(prev => prev.map(f => f.id === id ? { ...f, rolloutPercentage: currentRollout } : f));
        alert("Failed to update rollout");
      }
    });
  };

  const filteredFlags = flags.filter(f => 
    f.name.toLowerCase().includes(search.toLowerCase()) || 
    f.key.toLowerCase().includes(search.toLowerCase()) ||
    f.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-nova-charcoal/50 border border-white/10 rounded-2xl overflow-hidden">
      <div className="p-4 border-b border-white/10 flex items-center justify-between">
        <div className="relative w-96">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-nova-silver" />
          <input 
            type="text" 
            placeholder="Search flags by name, key, or category..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-black/50 border border-white/10 rounded-lg text-white placeholder:text-white/30 focus:outline-none focus:border-nova-blue transition-colors"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white/5 border-b border-white/10 text-xs uppercase tracking-wider text-nova-silver">
              <th className="p-4 font-semibold">Flag</th>
              <th className="p-4 font-semibold">Category</th>
              <th className="p-4 font-semibold">Type</th>
              <th className="p-4 font-semibold text-center">Rollout</th>
              <th className="p-4 font-semibold text-center">Status</th>
              <th className="p-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredFlags.map(flag => (
              <tr key={flag.id} className="hover:bg-white/[0.02] transition-colors">
                <td className="p-4">
                  <div className="flex flex-col">
                    <span className="text-white font-medium">{flag.name}</span>
                    <span className="text-xs text-nova-silver font-mono">{flag.key}</span>
                  </div>
                </td>
                <td className="p-4">
                  <span className="inline-block px-2 py-1 rounded text-xs bg-white/10 text-nova-silver">
                    {flag.category}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    {flag.type === "Kill Switch" as any && <ShieldAlert className="w-4 h-4 text-red-500" />}
                    {flag.type === "Experiment" && <Zap className="w-4 h-4 text-amber-500" />}
                    {flag.type === "Release" && <Globe className="w-4 h-4 text-nova-blue" />}
                    <span className={`text-xs ${flag.type === 'Kill Switch' as any ? 'text-red-400' : 'text-nova-silver'}`}>
                      {flag.type}
                    </span>
                  </div>
                </td>
                <td className="p-4 text-center">
                  <button 
                    onClick={() => handleRolloutChange(flag.id, flag.rolloutPercentage)}
                    disabled={isPending}
                    className="group flex items-center justify-center gap-1 mx-auto text-sm text-nova-silver hover:text-white transition-colors"
                  >
                    {flag.rolloutPercentage}%
                    <Edit2 className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                </td>
                <td className="p-4 text-center">
                  <button 
                    onClick={() => handleToggle(flag.id, flag.enabled)}
                    disabled={isPending}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${flag.enabled ? 'bg-nova-emerald' : 'bg-white/20'} ${isPending ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${flag.enabled ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </td>
                <td className="p-4 text-right">
                  <button className="text-nova-silver hover:text-white transition-colors p-2">
                    <MoreVertical className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
            {filteredFlags.length === 0 && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-nova-silver">
                  No feature flags found matching "{search}"
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
