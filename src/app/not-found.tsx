import React from "react";
import Link from "next/link";
import { Home, Search, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-6 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] bg-nova-blue/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] bg-nova-amber/10 rounded-full blur-[150px] pointer-events-none" />

      <div className="text-center relative z-10 max-w-lg">
        <div className="text-[120px] font-black text-white/5 leading-none mb-[-30px] select-none">404</div>
        
        <h1 className="text-4xl font-bold text-white mb-4">Signal Lost</h1>
        <p className="text-nova-silver text-lg leading-relaxed mb-10">
          The page you're looking for has drifted beyond our sphere.
          It may have been moved, renamed, or doesn't exist.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link 
            href="/"
            className="flex items-center gap-2 px-8 py-4 bg-nova-blue hover:bg-nova-blue/80 text-white rounded-xl font-bold transition-all shadow-[0_0_30px_rgba(59,130,246,0.2)]"
          >
            <Home className="w-5 h-5" />
            Back to Home
          </Link>
          
          <Link 
            href="/store"
            className="flex items-center gap-2 px-8 py-4 bg-white/5 hover:bg-white/10 text-nova-silver hover:text-white rounded-xl font-bold transition-all border border-white/10"
          >
            <Search className="w-5 h-5" />
            Browse Store
          </Link>
        </div>
      </div>
    </div>
  );
}
