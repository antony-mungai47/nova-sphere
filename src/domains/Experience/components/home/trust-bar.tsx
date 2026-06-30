"use client";

import React from "react";
import { ShieldCheck, Truck, Headphones, RotateCcw, CreditCard } from "lucide-react";
import { motion } from "framer-motion";
import { FADE_IN } from "@/lib/animations";

const TRUST_METRICS = [
  { icon: ShieldCheck, title: "Verified Sellers", subtitle: "100% Authenticity Guaranteed" },
  { icon: Truck, title: "Fast Global Delivery", subtitle: "Insured & Tracked Shipping" },
  { icon: RotateCcw, title: "Buyer Protection", subtitle: "30-Day Money-Back Guarantee" },
  { icon: Headphones, title: "24/7 Premium Support", subtitle: "Dedicated Concierge Team" },
  { icon: CreditCard, title: "Secure Checkout", subtitle: "Encrypted Transactions" },
];

export function TrustBar() {
  return (
    <motion.div 
      variants={FADE_IN}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      className="w-full bg-nova-charcoal border-b border-white/5 py-6"
    >
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6 md:gap-4 divide-x divide-white/5">
          {TRUST_METRICS.map((metric, idx) => (
            <div key={idx} className="flex flex-col items-center text-center px-4">
              <metric.icon className="w-6 h-6 text-nova-silver mb-3" />
              <h3 className="text-white text-sm font-semibold tracking-wide mb-1">{metric.title}</h3>
              <p className="text-nova-silver/60 text-xs font-light">{metric.subtitle}</p>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
