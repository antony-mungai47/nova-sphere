"use client";

import React, { useEffect } from "react";
import { AnimatedButton } from "@/components/ui/animated-button";
import { AlertTriangle, Home, RefreshCcw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Global Error Captured:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-6 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="glass-panel p-12 rounded-3xl border border-red-500/20 max-w-lg w-full text-center relative z-10 bg-black/60">
        <div className="w-20 h-20 mx-auto rounded-full bg-red-500/10 flex items-center justify-center mb-6 border border-red-500/20">
          <AlertTriangle className="w-10 h-10 text-red-500" />
        </div>
        
        <h1 className="text-3xl font-bold text-white mb-4">Critical Systems Failure</h1>
        <p className="text-nova-silver mb-8 leading-relaxed">
          Our defense grid intercepted an anomaly. Don't worry, no data was lost. 
          Please attempt to reinitialize the sequence.
        </p>

        <div className="flex flex-col gap-4">
          <AnimatedButton 
            onClick={() => reset()}
            className="w-full flex items-center justify-center gap-2 bg-nova-blue hover:bg-nova-blue/80 text-white py-4 rounded-xl font-bold"
          >
            <RefreshCcw className="w-5 h-5" />
            Reinitialize Sequence
          </AnimatedButton>
          
          <a href="/">
            <button className="w-full flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-nova-silver hover:text-white py-4 rounded-xl font-bold transition-all border border-white/10">
              <Home className="w-5 h-5" />
              Return to Core Hub
            </button>
          </a>
        </div>
        
        {error.digest && (
          <p className="mt-8 text-xs text-nova-silver/50 font-mono">
            Error Digest: {error.digest}
          </p>
        )}
      </div>
    </div>
  );
}
