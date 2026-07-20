import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { ShieldAlert, User, Settings, Package, LayoutDashboard, Search } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminLogsPage() {
  const logs = await prisma.adminLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 100
  });

  const getIcon = (action: string, entity: string) => {
    if (entity === "PRODUCT") return <Package className="w-4 h-4 text-nova-blue" />;
    if (entity === "USER") return <User className="w-4 h-4 text-nova-silver" />;
    if (entity === "THEME" || entity === "SETTINGS") return <Settings className="w-4 h-4 text-nova-amber" />;
    return <LayoutDashboard className="w-4 h-4 text-nova-silver" />;
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Admin Activity Logs</h1>
        <p className="text-nova-silver">Audit trail for product, user, and system modifications.</p>
      </div>

      <div className="glass-panel p-6 rounded-2xl border border-white/10">
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-nova-silver" />
            <input 
              type="text" 
              placeholder="Filter logs..." 
              className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-nova-blue"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="p-3 text-nova-silver font-medium w-12"></th>
                <th className="p-3 text-nova-silver font-medium">Timestamp</th>
                <th className="p-3 text-nova-silver font-medium">Admin ID</th>
                <th className="p-3 text-nova-silver font-medium">Action</th>
                <th className="p-3 text-nova-silver font-medium">Entity</th>
                <th className="p-3 text-nova-silver font-medium">Details</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-nova-silver">No activity logs found.</td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="p-3">
                      <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                        {getIcon(log.action, log.entity)}
                      </div>
                    </td>
                    <td className="p-3 text-nova-silver">{format(new Date(log.createdAt), "MMM d, yyyy h:mm a")}</td>
                    <td className="p-3 text-white truncate max-w-[150px]">{log.adminId}</td>
                    <td className="p-3">
                      <span className={`text-xs font-bold uppercase tracking-wider px-2 py-1 rounded ${
                        log.action === "UPDATE" ? "bg-nova-amber/20 text-nova-amber" :
                        log.action === "DELETE" ? "bg-red-400/20 text-red-400" :
                        "bg-nova-emerald/20 text-nova-emerald"
                      }`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="p-3 text-white font-medium">{log.entity} <span className="text-nova-silver font-normal text-xs">{log.entityId ? `(#${log.entityId.slice(-6)})` : ""}</span></td>
                    <td className="py-3 px-3 text-nova-silver max-w-[300px] truncate">{log.details ? JSON.stringify(log.details) : "-"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
