"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle, Package, ArrowRight } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { useCartStore } from "@/store/useCartStore";
import { Navbar } from "@/shared/components/layout/navbar";

export default function CheckoutSuccessPage() {
  const clearCart = useCartStore((state) => state.clearCart);

  useEffect(() => {
    // Clear cart upon successful checkout
    clearCart();
  }, [clearCart]);

  return (
    <main className="min-h-screen pt-32 pb-24 relative overflow-hidden flex flex-col items-center justify-center">
      <Navbar />
      
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-nova-blue/20 rounded-full blur-[150px] -z-10 pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="glass-panel p-10 md:p-16 max-w-xl w-full mx-6 text-center rounded-3xl border border-white/10 relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-nova-blue via-nova-silver to-nova-amber" />
        
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.3 }}
          className="w-24 h-24 bg-nova-blue/20 rounded-full flex items-center justify-center mx-auto mb-8 relative"
        >
          <div className="absolute inset-0 rounded-full animate-ping bg-nova-blue/30 opacity-75" />
          <CheckCircle className="w-12 h-12 text-nova-blue z-10" />
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-4xl font-bold text-white mb-4 tracking-tight"
        >
          Payment Successful
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="text-nova-silver text-lg mb-10"
        >
          Your high-tech gear is being prepared for dispatch. You will receive an email confirmation shortly.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-black/30 rounded-2xl p-6 mb-10 border border-white/5 flex items-center justify-between"
        >
          <div className="flex items-center gap-4 text-left">
            <div className="p-3 bg-white/5 rounded-xl">
              <Package className="w-6 h-6 text-nova-amber" />
            </div>
            <div>
              <p className="text-white font-medium">Order Status</p>
              <p className="text-nova-silver text-sm">Processing in Neural Core</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
        >
          <Link href="/">
            <Button className="w-full flex items-center justify-center gap-2 py-4 text-lg font-medium shadow-[0_0_20px_rgba(59,130,246,0.3)]">
              Return to Store <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
        </motion.div>
      </motion.div>
    </main>
  );
}
