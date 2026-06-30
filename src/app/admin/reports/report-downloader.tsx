"use client";

import React, { useState } from "react";
import { generateOrdersCSV, generateInventoryCSV } from "./actions";
import { DownloadCloud, Loader2, FileSpreadsheet, PackageOpen } from "lucide-react";

export function ReportDownloader() {
  const [downloading, setDownloading] = useState<string | null>(null);

  const handleDownload = async (type: 'orders' | 'inventory') => {
    setDownloading(type);
    try {
      const csv = type === 'orders' ? await generateOrdersCSV() : await generateInventoryCSV();
      
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `nova_${type}_report_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e: any) {
      alert("Failed to generate report: " + e.message);
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="glass-panel p-6 rounded-2xl border border-white/10 flex flex-col items-center text-center">
        <div className="w-16 h-16 rounded-2xl bg-nova-blue/10 flex items-center justify-center border border-nova-blue/20 mb-4">
          <FileSpreadsheet className="w-8 h-8 text-nova-blue" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Financial Orders Report</h3>
        <p className="text-nova-silver text-sm mb-6">Export a complete history of all transactions, customers, and order statuses.</p>
        <button 
          onClick={() => handleDownload('orders')}
          disabled={downloading !== null}
          className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {downloading === 'orders' ? <Loader2 className="w-5 h-5 animate-spin" /> : <DownloadCloud className="w-5 h-5" />}
          Download CSV
        </button>
      </div>

      <div className="glass-panel p-6 rounded-2xl border border-white/10 flex flex-col items-center text-center">
        <div className="w-16 h-16 rounded-2xl bg-nova-emerald/10 flex items-center justify-center border border-nova-emerald/20 mb-4">
          <PackageOpen className="w-8 h-8 text-nova-emerald" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Inventory Stock Report</h3>
        <p className="text-nova-silver text-sm mb-6">Export the full catalog with current stock levels, SKUs, and pricing.</p>
        <button 
          onClick={() => handleDownload('inventory')}
          disabled={downloading !== null}
          className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {downloading === 'inventory' ? <Loader2 className="w-5 h-5 animate-spin" /> : <DownloadCloud className="w-5 h-5" />}
          Download CSV
        </button>
      </div>
    </div>
  );
}
