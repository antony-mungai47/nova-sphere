import React from "react";
import Link from "next/link";
import Image from "next/image";
import { LayoutDashboard, PackageSearch, Users, Settings, ArrowLeft, ShieldCheck, BarChart3 } from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import { isAdmin, getUserRole } from "@/lib/auth";
import { notFound } from "next/navigation";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const authorized = await isAdmin();
  
  if (!authorized) {
    notFound();
  }

  const role = await getUserRole();
  const roleLabel = role?.replace("_", " ") ?? "Unknown";

  return (
    <div className="min-h-screen bg-black flex">
      {/* Sidebar */}
      <aside className="w-64 bg-nova-charcoal border-r border-white/10 flex flex-col h-screen sticky top-0">
        <div className="p-6 border-b border-white/10">
          <Link href="/" className="flex items-center gap-2 mb-6 text-nova-silver hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back to Store</span>
          </Link>
          <div className="flex items-center gap-3">
            <div className="relative w-8 h-8">
              <Image src="/logo.png" alt="Nova Sphere Admin" fill className="object-contain" sizes="32px" priority />
            </div>
            <div className="text-xl font-black text-white tracking-widest uppercase">
              NOVA<span className="text-transparent bg-clip-text bg-gradient-to-r from-nova-blue to-nova-emerald">ADMIN</span>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <Link href="/admin" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 text-white border border-white/10 hover:bg-white/10 transition-colors">
            <LayoutDashboard className="w-5 h-5 text-nova-blue" />
            <span className="font-medium">Dashboard</span>
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
            <span className="font-medium">Users</span>
          </Link>
          <Link href="/admin/analytics" className="flex items-center gap-3 px-4 py-3 rounded-xl text-nova-silver hover:bg-white/5 hover:text-white transition-colors">
            <BarChart3 className="w-5 h-5" />
            <span className="font-medium">Analytics</span>
          </Link>
          <Link href="/admin/financials" className="flex items-center gap-3 px-4 py-3 rounded-xl text-nova-silver hover:bg-white/5 hover:text-white transition-colors">
            <BarChart3 className="w-5 h-5" />
            <span className="font-medium">Financials</span>
          </Link>
          <Link href="/admin/marketing" className="flex items-center gap-3 px-4 py-3 rounded-xl text-nova-silver hover:bg-white/5 hover:text-white transition-colors">
            <BarChart3 className="w-5 h-5" />
            <span className="font-medium">Marketing</span>
          </Link>
          <Link href="/admin/settings" className="flex items-center gap-3 px-4 py-3 rounded-xl text-nova-silver hover:bg-white/5 hover:text-white transition-colors">
            <Settings className="w-5 h-5" />
            <span className="font-medium">Settings</span>
          </Link>
          <Link href="/admin/reports" className="flex items-center gap-3 px-4 py-3 rounded-xl text-nova-silver hover:bg-white/5 hover:text-white transition-colors">
            <BarChart3 className="w-5 h-5" />
            <span className="font-medium">Reports</span>
          </Link>
        </nav>

        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 mb-3">
            <UserButton />
            <div className="flex flex-col">
              <span className="text-white text-sm font-medium">Admin Panel</span>
              <span className="text-nova-silver text-xs flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-nova-emerald" />
                {roleLabel}
              </span>
            </div>
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
