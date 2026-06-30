import React from "react";
import { ReportDownloader } from "./report-downloader";

export const dynamic = "force-dynamic";

export default function AdminReportsPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Enterprise Reports</h1>
        <p className="text-nova-silver">Generate and download live data extracts for external analysis.</p>
      </div>

      <ReportDownloader />
    </div>
  );
}
