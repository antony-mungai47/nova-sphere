import React from 'react';
import Link from 'next/link';
import { Store, Package, ShoppingCart, Settings } from 'lucide-react';

export default function VendorLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-[calc(100vh-64px)] bg-[#0f1219]">
      <aside className="w-64 border-r border-white/10 bg-[#1a1f2e] p-6 hidden md:block">
        <h2 className="text-xl font-bold text-white mb-8">Vendor Portal</h2>
        <nav className="space-y-2">
          <Link href="/vendor/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-lg text-nova-silver hover:text-white hover:bg-white/5 transition-colors">
            <Store className="w-5 h-5" /> Dashboard
          </Link>
          <Link href="/vendor/products" className="flex items-center gap-3 px-4 py-3 rounded-lg text-nova-silver hover:text-white hover:bg-white/5 transition-colors">
            <Package className="w-5 h-5" /> Products
          </Link>
          <Link href="/vendor/orders" className="flex items-center gap-3 px-4 py-3 rounded-lg text-nova-silver hover:text-white hover:bg-white/5 transition-colors">
            <ShoppingCart className="w-5 h-5" /> Orders
          </Link>
          <Link href="/vendor/settings" className="flex items-center gap-3 px-4 py-3 rounded-lg text-nova-silver hover:text-white hover:bg-white/5 transition-colors">
            <Settings className="w-5 h-5" /> Settings
          </Link>
        </nav>
      </aside>
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
