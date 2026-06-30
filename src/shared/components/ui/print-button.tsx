"use client";

import React from "react";
import { Printer } from "lucide-react";

export function PrintButton() {
  return (
    <button 
      onClick={() => window.print()}
      className="px-6 py-2 bg-black hover:bg-gray-800 text-white rounded-lg flex items-center gap-2 mx-auto font-medium transition-colors"
    >
      <Printer className="w-4 h-4" />
      Print Invoice
    </button>
  );
}
