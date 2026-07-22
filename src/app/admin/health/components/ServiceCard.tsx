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

  let statusColor = "text-nova-silver";
  let dotColor = "bg-nova-silver shadow-[0_0_8px_rgba(156,163,175,0.4)]";
  let borderColor = "border-white/10";

  if (isConnected) {
    statusColor = "text-nova-emerald";
    dotColor = "bg-nova-emerald shadow-[0_0_8px_rgba(16,185,129,0.8)]";
    borderColor = "border-nova-emerald/30";
  } else if (isUnavailable) {
    statusColor = "text-red-500 animate-pulse";
    dotColor = "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)] animate-pulse";
    borderColor = "border-red-500/50";
  } else if (isNotConfigured) {
    statusColor = "text-nova-amber";
    dotColor = "bg-nova-amber/50";
    borderColor = "border-nova-amber/30";
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
          <span className="text-nova-silver">Status</span>
          <span className={`font-bold uppercase text-[10px] sm:text-xs ${statusColor}`}>
            {provider.status}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-nova-silver">Last Checked</span>
          <span className={isConnected ? "text-white" : "text-nova-silver"}>
            {formatDate(new Date())}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-nova-silver">Latency</span>
          <span className={isConnected ? "text-white" : "text-nova-silver"}>
            {provider.latencyMs !== undefined ? `${provider.latencyMs} ms` : "—"}
          </span>
        </div>
      </div>
    </div>
  );
}
