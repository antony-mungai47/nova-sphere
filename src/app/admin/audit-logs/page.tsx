import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { ShieldAlert, AlertTriangle, Info, XCircle, Bug } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AuditLogsPage() {
  const [adminLogs, systemLogs] = await Promise.all([
    prisma.adminLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 50
    }),
    prisma.systemLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 50
    })
  ]);

  const getSystemIcon = (level: string) => {
    switch (level) {
      case "INFO": return <Info className="w-4 h-4 text-nova-blue" />;
      case "WARN": return <AlertTriangle className="w-4 h-4 text-nova-amber" />;
      case "ERROR": return <XCircle className="w-4 h-4 text-red-500" />;
      case "FATAL": return <Bug className="w-4 h-4 text-danger" />;
      default: return <Info className="w-4 h-4 text-nova-silver" />;
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">System Audit & Health Logs</h1>
        <p className="text-nova-silver">Combined view of admin actions and system faults.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        
        {/* System Logs */}
        <div className="glass-panel p-6 rounded-2xl border border-white/10">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-red-400" />
            System Errors & Warnings
          </h2>
          <div className="overflow-x-auto max-h-[600px] overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent pr-2">
            <table className="w-full text-left text-sm">
              <thead className="sticky top-0 bg-[#1A1A2E] z-10">
                <tr className="border-b border-white/10">
                  <th className="p-3 text-nova-silver font-medium w-10"></th>
                  <th className="p-3 text-nova-silver font-medium">Time</th>
                  <th className="p-3 text-nova-silver font-medium">Source</th>
                  <th className="p-3 text-nova-silver font-medium">Message</th>
                </tr>
              </thead>
              <tbody>
                {systemLogs.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-nova-silver">System is healthy. No logs recorded.</td>
                  </tr>
                ) : (
                  systemLogs.map((log) => (
                    <tr key={log.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="p-3">
                        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                          {getSystemIcon(log.level)}
                        </div>
                      </td>
                      <td className="p-3 text-nova-silver text-xs whitespace-nowrap">{format(new Date(log.createdAt), "MM/dd HH:mm:ss")}</td>
                      <td className="p-3 text-white text-xs font-mono">{log.source}</td>
                      <td className="p-3 text-nova-silver text-xs max-w-[200px] truncate" title={log.message}>
                        {log.message}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Admin Logs */}
        <div className="glass-panel p-6 rounded-2xl border border-white/10">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-nova-blue" />
            Recent Admin Activity
          </h2>
          <div className="overflow-x-auto max-h-[600px] overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent pr-2">
            <table className="w-full text-left text-sm">
              <thead className="sticky top-0 bg-[#1A1A2E] z-10">
                <tr className="border-b border-white/10">
                  <th className="p-3 text-nova-silver font-medium">Time</th>
                  <th className="p-3 text-nova-silver font-medium">Admin ID</th>
                  <th className="p-3 text-nova-silver font-medium">Action</th>
                  <th className="p-3 text-nova-silver font-medium">Entity</th>
                </tr>
              </thead>
              <tbody>
                {adminLogs.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-nova-silver">No admin logs found.</td>
                  </tr>
                ) : (
                  adminLogs.map((log) => (
                    <tr key={log.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="p-3 text-nova-silver text-xs whitespace-nowrap">{format(new Date(log.createdAt), "MM/dd HH:mm:ss")}</td>
                      <td className="p-3 text-white text-xs truncate max-w-[100px]">{log.adminId}</td>
                      <td className="p-3">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded ${
                          log.action === "UPDATE" ? "bg-nova-amber/20 text-nova-amber" :
                          log.action === "DELETE" ? "bg-red-400/20 text-red-400" :
                          "bg-nova-emerald/20 text-nova-emerald"
                        }`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="p-3 text-white font-medium text-xs truncate max-w-[150px]">{log.entity}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
