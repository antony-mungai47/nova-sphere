import React from "react";
import { ComponentHealth } from "@/modules/operations/services/HealthService";

interface ServiceCardProps {
  title: string;
  provider: ComponentHealth;
}

export default function ServiceCard({ title, provider }: ServiceCardProps) {
  const isConnected = provider.status === "Healthy";
  const isUnavailable = provider.status === "Unavailable";
  const isNotConfigured = provider.status === "Degraded";

  let statusColor = "text-slate-300";
  let dotColor = "bg-slate-300 shadow-[0_0_8px_rgba(156,163,175,0.4)]";
  let borderColor = "border-white/10";

  if (isConnected) {
    statusColor = "text-emerald-500";
    dotColor = "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]";
    borderColor = "border-emerald-500/30";
  } else if (isUnavailable) {
    statusColor = "text-red-500 animate-pulse";
    dotColor = "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)] animate-pulse";
    borderColor = "border-red-500/50";
  } else if (isNotConfigured) {
    statusColor = "text-amber-500";
    dotColor = "bg-amber-500/50";
    borderColor = "border-amber-500/30";
  }

  const formatDate = (d: Date | null) => {
    if (!d) return "—";
    return new Date(d).toISOString().replace("T", " ").substring(0, 16) + " UTC";
  };

  return (
    <div className={`glass-panel p-5 rounded-xl border ${borderColor} transition-colors duration-300`} data-testid={`service-card-${title.toLowerCase().replace(/ /g, '-')}`}>
      <div className="flex justify-between items-start mb-4">
        <h4 className="text-white font-bold">{title}</h4>
        <span className={`w-3 h-3 rounded-full ${dotColor}`}></span>
      </div>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-slate-300">Status</span>
          <span className={`font-bold uppercase text-[10px] sm:text-xs ${statusColor}`}>
            {provider.status}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-300">Last Checked</span>
          <span className={isConnected ? "text-white" : "text-slate-300"}>
            {formatDate(new Date())}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-300">Latency</span>
          <span className={isConnected ? "text-white" : "text-slate-300"}>
            {provider.latencyMs !== undefined ? `${provider.latencyMs} ms` : "—"}
          </span>
        </div>
      </div>
    </div>
  );
}
