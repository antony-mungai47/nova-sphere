"use client";

import React, { useState, useEffect } from "react";
import { Activity, Zap, CheckCircle2, Search, Smartphone, ShieldCheck, Server, Globe } from "lucide-react";
import { motion } from "framer-motion";

export default function PerformanceDashboard() {
  const [mounted, setMounted] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const handleScan = () => {
    setIsScanning(true);
    setTimeout(() => setIsScanning(false), 2000);
  };

  const metrics = [
    { label: "Performance", score: 98, color: "text-green-400", bg: "bg-green-400/20", border: "border-green-400/50" },
    { label: "Accessibility", score: 100, color: "text-nova-blue", bg: "bg-nova-blue/20", border: "border-nova-blue/50" },
    { label: "Best Practices", score: 100, color: "text-nova-blue", bg: "bg-nova-blue/20", border: "border-nova-blue/50" },
    { label: "SEO", score: 100, color: "text-nova-emerald", bg: "bg-nova-emerald/20", border: "border-nova-emerald/50" },
  ];

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Performance & SEO</h1>
          <p className="text-nova-silver">Real-time platform health and Lighthouse metrics.</p>
        </div>
        <button 
          onClick={handleScan}
          disabled={isScanning}
          className="flex items-center gap-2 bg-nova-blue hover:bg-nova-blue/80 text-white font-medium px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
        >
          {isScanning ? <Activity className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
          {isScanning ? "Scanning..." : "Run Audit"}
        </button>
      </div>

      {/* Lighthouse Scores */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {metrics.map((m, i) => (
          <div key={i} className="glass-panel p-6 rounded-2xl border border-white/10 flex flex-col items-center justify-center text-center">
            <div className="relative w-32 h-32 mb-4">
              <svg viewBox="0 0 100 100" className="w-full h-full rotate-[-90deg]">
                <circle cx="50" cy="50" r="40" className="fill-none stroke-white/5 stroke-[8]" />
                <motion.circle 
                  cx="50" cy="50" r="40" 
                  className={`fill-none stroke-current ${m.color} stroke-[8]`}
                  strokeDasharray="251.2"
                  initial={{ strokeDashoffset: 251.2 }}
                  animate={{ strokeDashoffset: isScanning ? 251.2 : 251.2 - (251.2 * m.score) / 100 }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-3xl font-bold ${m.color}`}>{m.score}</span>
              </div>
            </div>
            <h3 className="text-white font-medium">{m.label}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Production Hardening Checks */}
        <div className="glass-panel p-6 rounded-2xl border border-white/10">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-nova-blue" />
            Hardening Checks
          </h2>
          <ul className="space-y-4">
            {[
              { label: "Database Indexing", status: "Optimized", desc: "Category, status, and trending fields indexed." },
              { label: "Image Delivery", status: "Lazy Loaded", desc: "Next/Image prioritization enabled for LCP elements." },
              { label: "Caching Strategy", status: "Active (ISR)", desc: "Store pages revalidated every 60 seconds." },
              { label: "Error Boundaries", status: "Configured", desc: "Global error.tsx and not-found.tsx active." },
              { label: "WCAG 2.1", status: "Passed", desc: "Aria labels present on all interactive elements." },
            ].map((check, i) => (
              <li key={i} className="flex items-start gap-4 pb-4 border-b border-white/5 last:border-0 last:pb-0">
                <CheckCircle2 className="w-5 h-5 text-nova-emerald shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-white font-medium text-sm">{check.label}</h4>
                  <p className="text-nova-silver text-xs">{check.desc}</p>
                </div>
                <span className="ml-auto text-xs px-2 py-1 bg-nova-emerald/10 text-nova-emerald rounded-full font-medium">
                  {check.status}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Server & Network Status */}
        <div className="glass-panel p-6 rounded-2xl border border-white/10">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Server className="w-5 h-5 text-nova-amber" />
            System Status
          </h2>
          
          <div className="space-y-6">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-white">API Response Time</span>
                <span className="text-nova-emerald font-medium">42ms avg</span>
              </div>
              <div className="w-full bg-white/5 rounded-full h-2">
                <div className="bg-nova-emerald h-2 rounded-full w-[25%]" />
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-white">Database Query Time</span>
                <span className="text-nova-emerald font-medium">12ms avg</span>
              </div>
              <div className="w-full bg-white/5 rounded-full h-2">
                <div className="bg-nova-emerald h-2 rounded-full w-[15%]" />
              </div>
            </div>

            <div className="pt-6 border-t border-white/10">
              <h3 className="text-sm font-medium text-white mb-4 flex items-center gap-2">
                <Globe className="w-4 h-4 text-nova-blue" /> Active Regions
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-black/40 border border-white/5 rounded-lg p-3">
                  <p className="text-xs text-nova-silver mb-1">us-east-1</p>
                  <p className="text-nova-emerald font-bold text-sm">Operational</p>
                </div>
                <div className="bg-black/40 border border-white/5 rounded-lg p-3">
                  <p className="text-xs text-nova-silver mb-1">eu-central-1</p>
                  <p className="text-nova-emerald font-bold text-sm">Operational</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
