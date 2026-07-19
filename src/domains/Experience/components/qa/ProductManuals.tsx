"use client";

import React from "react";
import { FileText, Download, Zap } from "lucide-react";

export function ProductManuals() {
  const documents = [
    { title: "User Manual", type: "PDF", size: "2.4 MB", icon: <FileText className="w-5 h-5 text-cta-primary" /> },
    { title: "Warranty Guide", type: "PDF", size: "1.1 MB", icon: <FileText className="w-5 h-5 text-emerald-500" /> },
    { title: "Quick Start Guide", type: "PDF", size: "3.8 MB", icon: <Zap className="w-5 h-5 text-warning" /> },
  ];

  return (
    <div className="bg-surface/50 border border-border rounded-2xl p-6">
      <h3 className="text-lg font-bold text-foreground mb-4">Product Documentation</h3>
      <p className="text-sm text-muted-foreground mb-6">Download official guides and warranty information before asking a question.</p>
      
      <div className="flex flex-col gap-3">
        {documents.map((doc, i) => (
          <a key={i} href="#" className="flex items-center justify-between p-4 rounded-xl border border-border bg-surface hover:bg-surface-hover hover:border-cta-primary/50 transition-colors group">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-background flex items-center justify-center shadow-sm">
                {doc.icon}
              </div>
              <div className="flex flex-col">
                 <span className="text-sm font-bold text-foreground group-hover:text-cta-primary transition-colors">{doc.title}</span>
                 <span className="text-xs text-muted-foreground">{doc.type} • {doc.size}</span>
              </div>
            </div>
            <div className="w-8 h-8 rounded-full bg-background border border-border flex items-center justify-center text-muted-foreground group-hover:bg-cta-primary group-hover:text-cta-primary-foreground group-hover:border-cta-primary transition-all">
              <Download className="w-4 h-4" />
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
