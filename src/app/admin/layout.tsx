import React from "react";
import Link from "next/link";
import { LayoutDashboard, PackageSearch, Users, Settings, LogOut, ArrowLeft } from "lucide-react";
import { UserButton } from "@clerk/nextjs";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-black flex">
      {/* Sidebar */}
      <aside className="w-64 glass-panel border-r border-white/10 flex flex-col h-screen sticky top-0">
        <div className="p-6 border-b border-white/10">
          <Link href="/" className="flex items-center gap-2 mb-6 text-nova-silver hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back to Store</span>
          </Link>
          <div className="text-2xl font-black text-white tracking-widest uppercase">
            NOVA<span className="text-transparent bg-clip-text bg-gradient-to-r from-nova-blue to-nova-amber">ADMIN</span>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <Link href="/admin" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 text-white border border-white/10 hover:bg-white/10 transition-colors">
            <LayoutDashboard className="w-5 h-5 text-nova-blue" />
            <span className="font-medium">Overview</span>
          </Link>
          <Link href="/admin/products" className="flex items-center gap-3 px-4 py-3 rounded-xl text-nova-silver hover:bg-white/5 hover:text-white transition-colors">
            <PackageSearch className="w-5 h-5" />
            <span className="font-medium">Products</span>
          </Link>
          <Link href="/admin/orders" className="flex items-center gap-3 px-4 py-3 rounded-xl text-nova-silver hover:bg-white/5 hover:text-white transition-colors">
            <PackageSearch className="w-5 h-5" />
            <span className="font-medium">Orders</span>
          </Link>
          <Link href="/admin/customers" className="flex items-center gap-3 px-4 py-3 rounded-xl text-nova-silver hover:bg-white/5 hover:text-white transition-colors">
            <Users className="w-5 h-5" />
            <span className="font-medium">Customers</span>
          </Link>
          <Link href="/admin/settings" className="flex items-center gap-3 px-4 py-3 rounded-xl text-nova-silver hover:bg-white/5 hover:text-white transition-colors">
            <Settings className="w-5 h-5" />
            <span className="font-medium">Settings</span>
          </Link>
        </nav>

        <div className="p-4 border-t border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <UserButton />
            <span className="text-nova-silver text-sm">Admin Access</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
