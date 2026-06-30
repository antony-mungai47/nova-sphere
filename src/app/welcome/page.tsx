import React from "react";
import Image from "next/image";
import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ArrowRight, UserPlus, LogIn } from "lucide-react";
import { Watermark } from "@/shared/components/ui/watermark";

export default function WelcomePage() {
  async function continueAsGuest() {
    "use server";
    (await cookies()).set("nova_guest", "true", { 
      expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      path: "/",
      sameSite: "lax"
    });
    redirect("/");
  }

  return (
    <div className="relative min-h-screen bg-black flex flex-col items-center justify-center overflow-hidden">
      {/* High Visibility Layer 2 Logo Watermark */}
      <Watermark enabled={true} opacity={0.15} logoUrl="/logo.png" />
      
      {/* Layer 1 Monogram Pattern (Subtle) */}
      <div 
        className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none mix-blend-screen"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: '120px 120px'
        }}
      />

      <div className="absolute inset-0 bg-gradient-to-b from-nova-blue/10 via-transparent to-black pointer-events-none z-0" />
      
      <div className="relative z-10 max-w-lg w-full px-6">
        <div className="flex flex-col items-center text-center mb-12">
          <div className="relative w-24 h-24 mb-6">
            <Image src="/logo.png" alt="Nova Sphere Logo" fill className="object-contain" priority />
          </div>
          <h1 className="text-4xl font-black text-white tracking-tight mb-4">
            Welcome to <span className="text-nova-blue">NOVA</span>SPHERE
          </h1>
          <p className="text-nova-silver text-lg">
            A premium, curated global marketplace for verified luxury goods, electronics, and rare collectibles.
          </p>
        </div>

        <div className="space-y-4">
          <Link 
            href="/login" 
            className="flex items-center justify-center gap-3 w-full py-4 rounded-2xl bg-white text-black font-bold hover:bg-gray-100 transition-all shadow-glow-primary"
          >
            <LogIn className="w-5 h-5" />
            Sign In to Your Account
          </Link>
          
          <Link 
            href="/register" 
            className="flex items-center justify-center gap-3 w-full py-4 rounded-2xl glass-panel border border-white/20 text-white font-bold hover:bg-white/10 transition-all"
          >
            <UserPlus className="w-5 h-5" />
            Create an Account
          </Link>

          <div className="pt-6 relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-black text-nova-silver">or</span>
            </div>
          </div>

          <form action={continueAsGuest}>
            <button 
              type="submit"
              className="flex items-center justify-center gap-3 w-full py-4 rounded-2xl text-nova-silver font-medium hover:text-white transition-all group"
            >
              Continue as Guest
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}