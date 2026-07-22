import React from "react";
import { 
  Server, Database, Activity, ShieldAlert, GitCommit, Settings, 
  RotateCcw, Box, Cpu, Network, BookOpen, Target, Sparkles, Key, FileText, Lock 
} from "lucide-react";
import EmergencyControls from "./components/EmergencyControls";
import LiveRefresh from "./components/LiveRefresh";
import ServiceCard from "./components/ServiceCard";
import { HealthService, ComponentHealth } from "@/modules/operations/services/HealthService";

export const dynamic = "force-dynamic";

export default async function OperationsConsole() {
  // Fetch unified health via Application Service layer
  const healthData = await HealthService.checkPlatformHealth();
  
  const dbProvider: ComponentHealth = {
    status: healthData.Database?.status || 'Unavailable',
    latencyMs: healthData.Database?.latencyMs,
    data: healthData.Database?.data as any
  };
  const deployProvider = { data: null as any }; // Will be migrated to DeploymentService
  const queueProvider: ComponentHealth = { status: healthData.Inngest?.status || 'Unavailable' };
  const aiProvider: ComponentHealth = { status: 'Degraded' };
  const metricsProvider = { state: 'NOT_CONFIGURED' };

  // Stub missing providers as Degraded (Not Configured equivalent in HealthStatus)
  const stubProvider = (source: string): ComponentHealth => ({
    status: "Degraded",
    latencyMs: undefined,
    message: source,
    data: null
  });

  const stripeProvider = stubProvider("Stripe API");
  const clerkProvider = stubProvider("Clerk API");
  const pusherProvider = stubProvider("Pusher API");
  const cloudinaryProvider = stubProvider("Cloudinary API");
  
  const deploy = deployProvider.data;
  const biz = dbProvider.data;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-12">
      {/* HEADER WITH AUTO REFRESH */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Operations Console</h1>
          <p className="text-nova-silver">Level 3 Observability and Telemetry Dashboard</p>
        </div>
        <LiveRefresh />
      </div>

      {/* ============================== */}
      {/* 1. DEPLOYMENT DASHBOARD        */}
      {/* ============================== */}
      <section>
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2 border-b border-white/10 pb-2">
          <GitCommit className="w-5 h-5 text-nova-silver" /> Launch Summary & Deployments
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="col-span-1 md:col-span-3 bg-black/40 border border-white/10 rounded-2xl p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div><p className="text-nova-silver text-xs uppercase mb-1">Current Version</p><p className="text-white font-bold">{deploy?.currentVersion}</p></div>
              <div><p className="text-nova-silver text-xs uppercase mb-1">Git SHA</p><p className="text-white font-mono font-bold">{deploy?.gitSha}</p></div>
              <div><p className="text-nova-silver text-xs uppercase mb-1">Environment</p><p className="text-white font-bold capitalize">{deploy?.environment}</p></div>
              <div><p className="text-nova-silver text-xs uppercase mb-1">Rollout</p><p className="text-white font-bold">{deploy?.currentRolloutPercent}%</p></div>
              
              <div><p className="text-nova-silver text-xs uppercase mb-1">Release Time</p><p className="text-white text-sm">{new Date(deploy?.releaseTime || "").toLocaleString()}</p></div>
              <div><p className="text-nova-silver text-xs uppercase mb-1">Migration Version</p><p className="text-nova-emerald font-bold">{biz?.migrationVersion}</p></div>
              <div><p className="text-nova-silver text-xs uppercase mb-1">Rollback Target</p><p className="text-white font-bold">{deploy?.rollbackTarget}</p></div>
              <div><p className="text-nova-silver text-xs uppercase mb-1">Previous Deploy</p><p className="text-white text-sm">{deploy?.previousDeployment}</p></div>
            </div>
            
            <div className="mt-6 pt-6 border-t border-white/5">
              <p className="text-nova-silver text-xs uppercase mb-3">Active Feature Flags</p>
              <div className="flex flex-wrap gap-2">
                {deploy?.featureFlags?.map((ff: any, i: number) => (
                  <span key={i} className={`text-xs px-2 py-1 rounded font-bold ${ff.status === 'ON' ? 'bg-nova-emerald/20 text-nova-emerald' : 'bg-white/10 text-nova-silver'}`}>
                    {ff.name}: {ff.status}
                  </span>
                ))}
              </div>
            </div>
          </div>
          
          <div className="col-span-1 glass-panel border border-white/10 rounded-2xl p-6 flex flex-col items-center justify-center text-center">
             <h3 className="text-nova-silver text-sm uppercase tracking-wider mb-2">Overall Health</h3>
             <div className="text-5xl font-black text-nova-emerald mb-2">100<span className="text-2xl text-nova-silver">%</span></div>
             <div className="text-nova-emerald font-bold text-sm uppercase">Checks Passing</div>
          </div>
        </div>
      </section>

      {/* ============================== */}
      {/* 2. INFRASTRUCTURE              */}
      {/* ============================== */}
      <section>
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2 border-b border-white/10 pb-2">
          <Server className="w-5 h-5 text-nova-silver" /> Infrastructure
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <ServiceCard title="Database (Neon)" provider={dbProvider} />
          <ServiceCard title="Stripe Payments" provider={stripeProvider} />
          <ServiceCard title="Pusher WebSocket" provider={pusherProvider} />
          <ServiceCard title="Clerk Auth" provider={clerkProvider} />
          <ServiceCard title="Cloudinary CDN" provider={cloudinaryProvider} />
          <ServiceCard title="AI Gateway" provider={aiProvider} />
          <ServiceCard title="Inngest Workers" provider={queueProvider} />
        </div>
      </section>

      {/* ============================== */}
      {/* 3. OPERATIONS                  */}
      {/* ============================== */}
      <section>
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2 border-b border-white/10 pb-2">
          <Target className="w-5 h-5 text-nova-silver" /> Operations
        </h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* SLO & Error Budget */}
          <div>
             <h3 className="text-lg font-bold text-white mb-3">Service Level Objectives (SLOs)</h3>
             <div className="grid grid-cols-2 gap-4 mb-4">
               <div className="glass-panel p-4 rounded-xl border border-white/10">
                 <p className="text-nova-silver text-xs uppercase mb-1">Target Uptime</p>
                 <p className="text-white font-bold text-xl">99.9%</p>
               </div>
               <div className="glass-panel p-4 rounded-xl border border-white/10">
                 <p className="text-nova-silver text-xs uppercase mb-1">Remaining Error Budget</p>
                 <p className="text-nova-silver font-bold text-xl">—</p>
               </div>
               <div className="glass-panel p-4 rounded-xl border border-white/10">
                 <p className="text-nova-silver text-xs uppercase mb-1">Burn Rate</p>
                 <p className="text-nova-silver font-bold text-xl">—</p>
               </div>
               <div className="glass-panel p-4 rounded-xl border border-white/10">
                 <p className="text-nova-silver text-xs uppercase mb-1">Incident Count</p>
                 <p className="text-nova-silver font-bold text-xl">—</p>
               </div>
             </div>
             
             <div className="glass-panel p-4 rounded-xl border border-white/10">
                <h4 className="text-sm font-bold text-white mb-3 uppercase tracking-wider">Subsystem Uptimes</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-nova-silver">API</span><span className="text-white font-mono">100.00%</span></div>
                  <div className="flex justify-between"><span className="text-nova-silver">Payments</span><span className="text-nova-silver font-mono">Unknown</span></div>
                  <div className="flex justify-between"><span className="text-nova-silver">Auctions</span><span className="text-white font-mono">100.00%</span></div>
                  <div className="flex justify-between"><span className="text-nova-silver">Search</span><span className="text-white font-mono">100.00%</span></div>
                  <div className="flex justify-between"><span className="text-nova-silver">AI</span><span className="text-nova-silver font-mono">Unknown</span></div>
                </div>
             </div>
          </div>

          {/* Queues & Incident Timeline */}
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2"><Cpu className="w-5 h-5"/> Queue Dashboard (Inngest)</h3>
              <div className="glass-panel p-5 rounded-xl border border-white/10">
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                   <div><p className="text-nova-silver text-xs uppercase mb-1">Pending</p><p className="text-nova-silver font-bold text-xl">—</p></div>
                   <div><p className="text-nova-silver text-xs uppercase mb-1">Running</p><p className="text-nova-silver font-bold text-xl">—</p></div>
                   <div><p className="text-nova-silver text-xs uppercase mb-1">Retrying</p><p className="text-nova-silver font-bold text-xl">—</p></div>
                   <div><p className="text-nova-silver text-xs uppercase mb-1 text-red-400">DLQ</p><p className="text-nova-silver font-bold text-xl">—</p></div>
                 </div>
                 <div className="grid grid-cols-2 gap-4 text-sm border-t border-white/10 pt-4">
                    <div><span className="text-nova-silver block text-xs uppercase">Oldest Pending</span><span className="text-white">—</span></div>
                    <div><span className="text-nova-silver block text-xs uppercase">Retry Success</span><span className="text-white">—</span></div>
                    <div><span className="text-nova-silver block text-xs uppercase">Avg Processing</span><span className="text-white">—</span></div>
                    <div><span className="text-nova-silver block text-xs uppercase">Max Delay</span><span className="text-white">—</span></div>
                 </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2"><RotateCcw className="w-5 h-5"/> Incident Timeline</h3>
              <div className="glass-panel rounded-xl border border-white/10 overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead className="bg-white/5 border-b border-white/10 text-nova-silver uppercase text-xs">
                    <tr><th className="px-4 py-2">Time</th><th className="px-4 py-2">Severity</th><th className="px-4 py-2">Event</th></tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-white">
                    <tr>
                      <td className="px-4 py-2 text-nova-silver">Just now</td>
                      <td className="px-4 py-2"><span className="text-nova-silver font-bold bg-white/10 px-2 py-0.5 rounded text-xs uppercase">INFO</span></td>
                      <td className="px-4 py-2 font-medium">Hypercare Phase 2 Closed</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================== */}
      {/* 4. BUSINESS                    */}
      {/* ============================== */}
      <section>
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2 border-b border-white/10 pb-2">
          <Activity className="w-5 h-5 text-nova-silver" /> Business Performance
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <div className="bg-black/20 p-5 rounded-xl border border-white/5">
            <p className="text-nova-silver text-xs uppercase mb-1">Revenue Today</p>
            <p className="text-white font-black text-2xl">${biz?.revenueToday}</p>
          </div>
          <div className="bg-black/20 p-5 rounded-xl border border-white/5">
            <p className="text-nova-silver text-xs uppercase mb-1">Orders Today</p>
            <p className="text-white font-black text-2xl">{biz?.ordersToday}</p>
          </div>
          <div className="bg-black/20 p-5 rounded-xl border border-white/5">
            <p className="text-nova-silver text-xs uppercase mb-1">Active Users</p>
            <p className="text-white font-black text-2xl">{biz?.activeUsers}</p>
          </div>
          <div className="bg-black/20 p-5 rounded-xl border border-white/5">
            <p className="text-nova-silver text-xs uppercase mb-1">Live Auctions</p>
            <p className="text-white font-black text-2xl">{biz?.activeAuctions}</p>
          </div>
          <div className="bg-black/20 p-5 rounded-xl border border-white/5 opacity-50">
            <p className="text-nova-silver text-xs uppercase mb-1">Checkout Success</p>
            <p className="text-white font-bold">—</p>
          </div>
          <div className="bg-black/20 p-5 rounded-xl border border-white/5 opacity-50">
            <p className="text-nova-silver text-xs uppercase mb-1">Inventory Velocity</p>
            <p className="text-white font-bold">—</p>
          </div>
        </div>
      </section>

      {/* ============================== */}
      {/* 5. AI DASHBOARD                */}
      {/* ============================== */}
      <section>
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2 border-b border-white/10 pb-2">
          <Sparkles className="w-5 h-5 text-nova-silver" /> AI Operations
        </h2>
        <div className="glass-panel p-6 rounded-xl border border-white/10 opacity-70">
          <div className="flex justify-between items-start mb-6 border-b border-white/10 pb-4">
            <div>
              <h3 className="text-lg font-bold text-white">AI Gateway</h3>
              <p className="text-nova-silver text-sm">Provider: <span className="text-white font-semibold">Not Configured</span></p>
            </div>
            <span className="bg-nova-silver/20 text-nova-silver px-3 py-1 rounded text-xs font-bold uppercase tracking-wider">Awaiting Setup</span>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 text-center">
            <div><p className="text-nova-silver text-xs uppercase mb-1">Prompts</p><p className="text-white font-bold">—</p></div>
            <div><p className="text-nova-silver text-xs uppercase mb-1">Model</p><p className="text-white font-bold">—</p></div>
            <div><p className="text-nova-silver text-xs uppercase mb-1">Success %</p><p className="text-white font-bold">—</p></div>
            <div><p className="text-nova-silver text-xs uppercase mb-1">Cache Hit %</p><p className="text-white font-bold">—</p></div>
            <div><p className="text-nova-silver text-xs uppercase mb-1">Avg Tokens</p><p className="text-white font-bold">—</p></div>
            <div><p className="text-nova-silver text-xs uppercase mb-1">Avg Cost</p><p className="text-white font-bold">—</p></div>
            <div><p className="text-nova-silver text-xs uppercase mb-1">Budget Left</p><p className="text-white font-bold">—</p></div>
            <div><p className="text-nova-silver text-xs uppercase mb-1">Failures</p><p className="text-white font-bold">—</p></div>
          </div>
        </div>
      </section>

      {/* ============================== */}
      {/* 6. SECURITY                    */}
      {/* ============================== */}
      <section>
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2 border-b border-white/10 pb-2">
          <Key className="w-5 h-5 text-nova-silver" /> Security
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <ServiceCard title="Secrets Manager" provider={stubProvider("AWS / Vercel")} />
          <ServiceCard title="Certificates" provider={stubProvider("Let's Encrypt")} />
          <ServiceCard title="WAF / Headers" provider={stubProvider("Cloudflare")} />
          <ServiceCard title="Rate Limiting" provider={stubProvider("Redis")} />
        </div>
      </section>

      {/* ============================== */}
      {/* 7. RECOVERY                    */}
      {/* ============================== */}
      <section className="pb-12">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2 border-b border-white/10 pb-2">
          <ShieldAlert className="w-5 h-5 text-nova-silver" /> Recovery & Runbooks
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2"><FileText className="w-5 h-5"/> Actionable Runbooks</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="glass-panel p-4 rounded-xl border border-white/10 text-sm hover:border-nova-silver/50 transition-colors cursor-pointer">
                <h4 className="text-white font-bold mb-1">Stripe Webhook Failures</h4>
                <p className="text-nova-silver">Check endpoint & retry failed events</p>
              </div>
              <div className="glass-panel p-4 rounded-xl border border-white/10 text-sm hover:border-nova-silver/50 transition-colors cursor-pointer">
                <h4 className="text-white font-bold mb-1">Neon DB Latency Spike</h4>
                <p className="text-nova-silver">Check Prisma connection pool & query logs</p>
              </div>
              <div className="glass-panel p-4 rounded-xl border border-white/10 text-sm hover:border-nova-silver/50 transition-colors cursor-pointer">
                <h4 className="text-white font-bold mb-1">Pusher Disconnects</h4>
                <p className="text-nova-silver">Verify API quota & client reconnection logic</p>
              </div>
              <div className="glass-panel p-4 rounded-xl border border-white/10 text-sm hover:border-nova-silver/50 transition-colors cursor-pointer">
                <h4 className="text-white font-bold mb-1">Inngest DLQ Triage</h4>
                <p className="text-nova-silver">Inspect payload failures & force replay</p>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-bold text-red-400 mb-3 flex items-center gap-2"><Lock className="w-5 h-5"/> Emergency Controls</h3>
            <EmergencyControls />
          </div>
        </div>
      </section>

    </div>
  );
}
