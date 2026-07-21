"use client";

import { useState } from "react";
import { AlertTriangle, Database, RefreshCw, Power } from "lucide-react";

export default function EmergencyControls() {
  const [loading, setLoading] = useState<string | null>(null);
  
  const handleAction = (action: string) => {
    setLoading(action);
    setTimeout(() => {
      setLoading(null);
      alert(`${action} triggered successfully. Audit log updated.`);
    }, 1500);
  };

  return (
    <div className="glass-panel p-6 rounded-xl border border-red-500/30">
      <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-lg mb-6 flex gap-3 items-start">
        <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
        <p className="text-sm text-red-200">
          <strong>Warning:</strong> These controls bypass normal deployment pipelines and instantly affect production traffic. Use only during P0 incidents.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button 
          onClick={() => handleAction("Maintenance Mode")}
          disabled={loading !== null}
          className="flex items-center justify-between p-4 bg-black/40 hover:bg-red-900/40 border border-white/5 hover:border-red-500/50 rounded-lg transition-colors text-left group"
        >
          <div>
            <div className="text-white font-bold mb-1 flex items-center gap-2">
              <Power className="w-4 h-4 text-red-400" />
              Enable Maintenance Mode
            </div>
            <div className="text-nova-silver text-xs">Redirects all traffic to status page</div>
          </div>
          {loading === "Maintenance Mode" && <RefreshCw className="w-4 h-4 text-nova-silver animate-spin" />}
        </button>

        <button 
          onClick={() => handleAction("Disable Checkout")}
          disabled={loading !== null}
          className="flex items-center justify-between p-4 bg-black/40 hover:bg-amber-900/40 border border-white/5 hover:border-amber-500/50 rounded-lg transition-colors text-left group"
        >
          <div>
            <div className="text-white font-bold mb-1 flex items-center gap-2">
              <Database className="w-4 h-4 text-amber-400" />
              Disable Checkout
            </div>
            <div className="text-nova-silver text-xs">Halts new payments and cart execution</div>
          </div>
          {loading === "Disable Checkout" && <RefreshCw className="w-4 h-4 text-nova-silver animate-spin" />}
        </button>
        
        <button 
          onClick={() => handleAction("Disable Auctions")}
          disabled={loading !== null}
          className="flex items-center justify-between p-4 bg-black/40 hover:bg-amber-900/40 border border-white/5 hover:border-amber-500/50 rounded-lg transition-colors text-left group"
        >
          <div>
            <div className="text-white font-bold mb-1">Disable Live Auctions</div>
            <div className="text-nova-silver text-xs">Stops websocket bid processing</div>
          </div>
          {loading === "Disable Auctions" && <RefreshCw className="w-4 h-4 text-nova-silver animate-spin" />}
        </button>
        
        <button 
          onClick={() => handleAction("Restart Workers")}
          disabled={loading !== null}
          className="flex items-center justify-between p-4 bg-black/40 hover:bg-nova-blue/20 border border-white/5 hover:border-nova-blue/50 rounded-lg transition-colors text-left group"
        >
          <div>
            <div className="text-white font-bold mb-1">Restart Workers</div>
            <div className="text-nova-silver text-xs">Flushes Inngest queue cache</div>
          </div>
          {loading === "Restart Workers" && <RefreshCw className="w-4 h-4 text-nova-silver animate-spin" />}
        </button>
      </div>
    </div>
  );
}
