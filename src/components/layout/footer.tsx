"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-nova-navy/30 relative overflow-hidden mt-20 pt-16 pb-8">
      {/* Background ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[2px] bg-gradient-to-r from-transparent via-nova-blue/50 to-transparent" />
      <div className="absolute bottom-0 right-0 w-[300px] h-[300px] bg-nova-blue/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          
          {/* Brand Col */}
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center space-x-2 group mb-4 inline-flex">
              <div className="w-8 h-8 rounded-full bg-nova-blue flex items-center justify-center">
                <span className="text-white font-bold text-lg">N</span>
              </div>
              <span className="text-xl font-bold tracking-widest text-white">NOVA<span className="text-nova-blue">SPHERE</span></span>
            </Link>
            <p className="text-nova-silver max-w-sm mb-6">
              The future of smart shopping. Discover premium AI-powered devices and luxury electronics built for tomorrow.
            </p>
            <div className="flex space-x-4">
              {['Twitter', 'Instagram', 'Discord'].map((social) => (
                <button key={social} className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-nova-silver hover:text-white hover:bg-white/5 transition-colors">
                  <span className="text-xs">{social.substring(0, 2)}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Links Col 1 */}
          <div>
            <h4 className="text-white font-semibold mb-4">Shop</h4>
            <ul className="space-y-3">
              {['All Products', 'Smart Home', 'Wearables', 'AI Devices'].map((link) => (
                <li key={link}>
                  <Link href="#" className="text-nova-silver hover:text-nova-blue transition-colors text-sm">
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Links Col 2 */}
          <div>
            <h4 className="text-white font-semibold mb-4">Support</h4>
            <ul className="space-y-3">
              {['FAQ', 'Shipping', 'Returns', 'Contact Us'].map((link) => (
                <li key={link}>
                  <Link href="#" className="text-nova-silver hover:text-nova-blue transition-colors text-sm">
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

        </div>

        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center text-xs text-nova-silver">
          <p>&copy; {new Date().getFullYear()} NOVA SPHERE. All rights reserved.</p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
