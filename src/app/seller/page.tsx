import Link from "next/link";
import React from "react";
import { Navbar } from "@/shared/components/layout/navbar";
import { Footer } from "@/shared/components/layout/footer";
import { Button } from "@/shared/components/ui/button";
import { ShieldCheck, TrendingUp, Gavel, FileCheck } from "lucide-react";
import { auth } from "@clerk/nextjs/server";

export const dynamic = "force-dynamic";

export default async function SellerCenterPage() {
  const { userId } = await auth();

  return (
    <main className="min-h-screen flex flex-col bg-black">
      <Navbar />
      
      <div className="flex-1 pt-32 pb-24">
        <div className="container mx-auto px-6 max-w-5xl">
          <div className="text-center mb-16 relative">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-nova-blue/10 blur-[120px] rounded-full pointer-events-none" />
            <h1 className="text-5xl font-black text-white mb-6 tracking-tight relative z-10">
              Become a <span className="text-transparent bg-clip-text bg-gradient-to-r from-nova-blue to-nova-emerald">Verified Seller</span>
            </h1>
            <p className="text-nova-silver text-xl max-w-2xl mx-auto relative z-10 font-light">
              Submit your premium electronics, rare collectibles, and luxury items to Nova Sphere's global auction network.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="glass-panel p-8 rounded-3xl text-center flex flex-col items-center">
              <div className="w-16 h-16 rounded-2xl bg-nova-blue/10 text-nova-blue flex items-center justify-center mb-6">
                <FileCheck className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">1. Submit Details</h3>
              <p className="text-nova-silver text-sm leading-relaxed">
                Provide high-quality images and detailed specifications of your luxury item for our expert review.
              </p>
            </div>
            <div className="glass-panel p-8 rounded-3xl text-center flex flex-col items-center">
              <div className="w-16 h-16 rounded-2xl bg-nova-amber/10 text-nova-amber flex items-center justify-center mb-6">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">2. Authentication</h3>
              <p className="text-nova-silver text-sm leading-relaxed">
                Our curation team verifies authenticity. Only premium, enterprise-grade items are accepted.
              </p>
            </div>
            <div className="glass-panel p-8 rounded-3xl text-center flex flex-col items-center">
              <div className="w-16 h-16 rounded-2xl bg-nova-emerald/10 text-nova-emerald flex items-center justify-center mb-6">
                <Gavel className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">3. Go Live</h3>
              <p className="text-nova-silver text-sm leading-relaxed">
                Your item hits the auction floor. Watch live as our global network of collectors place their bids.
              </p>
            </div>
          </div>

          <div className="glass-panel p-10 md:p-16 rounded-3xl border border-white/10 text-center max-w-3xl mx-auto relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
            
            {userId ? (
              <div className="relative z-10">
                <h2 className="text-3xl font-bold text-white mb-4">Ready to Auction?</h2>
                <p className="text-nova-silver mb-8">
                  You are authenticated and ready to submit your first item. Our curation team will review submissions within 24 hours.
                </p>
                <form action={async () => {
                  "use server";
                  // In a real implementation, this would open a modal or create a draft submission
                  // For now, it's a placeholder button
                }}>
                  <Button type="button" className="w-full sm:w-auto px-12 py-4 text-lg">
                    Start Submission
                  </Button>
                </form>
              </div>
            ) : (
              <div className="relative z-10">
                <h2 className="text-3xl font-bold text-white mb-4">Authentication Required</h2>
                <p className="text-nova-silver mb-8">
                  You must be a registered member to submit items for auction. Join Nova Sphere today to access the seller center.
                </p>
                <Link href="/sign-in">
                  <Button className="w-full sm:w-auto px-12 py-4 text-lg">
                    Sign In to Continue
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <Footer />
    </main>
  );
}
