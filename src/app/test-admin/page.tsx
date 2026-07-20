import React from "react";
import { ServerNavbar as Navbar } from "@/shared/components/layout/ServerNavbar";
import { Footer } from "@/shared/components/layout/footer";
import Link from "next/link";
import { 
  BarChart, 
  DollarSign, 
  Package, 
  Users, 
  Settings, 
  Gavel, 
  ShoppingCart,
  Activity,
  FileText
} from "lucide-react";

export const metadata = {
  title: "Admin Dashboard | Nova Sphere",
};

const adminLinks = [
  { name: "Analytics", href: "/admin/analytics", icon: BarChart, color: "text-nova-blue", desc: "View store traffic and conversion metrics." },
  { name: "Financials", href: "/admin/financials", icon: DollarSign, color: "text-success", desc: "Manage revenue, payouts, and taxes." },
  { name: "Products", href: "/admin/products", icon: Package, color: "text-nova-amber", desc: "Manage catalog, inventory, and categories." },
  { name: "Orders", href: "/admin/orders", icon: ShoppingCart, color: "text-white", desc: "View and fulfill customer orders." },
  { name: "Auctions", href: "/admin/auctions", icon: Gavel, color: "text-danger", desc: "Monitor live auctions and bids." },
  { name: "Customers", href: "/admin/customers", icon: Users, color: "text-nova-blue", desc: "Manage user accounts and roles." },
  { name: "System Health", href: "/admin/health", icon: Activity, color: "text-success", desc: "Monitor server and database performance." },
  { name: "Audit Logs", href: "/admin/audit-logs", icon: FileText, color: "text-nova-silver", desc: "Review system and security logs." },
  { name: "Settings", href: "/admin/settings", icon: Settings, color: "text-nova-silver", desc: "Configure global store settings." },
];

export default function AdminDashboardV3() {
  return (
    <main className="min-h-screen flex flex-col bg-black">
      <Navbar />
      
      <section className="pt-32 pb-16 relative overflow-hidden flex-1">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-nova-blue/5 rounded-full blur-[120px] -z-10 pointer-events-none" />
        
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 border-b border-white/10 pb-6">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">Admin Dashboard</h1>
              <p className="text-nova-silver">Manage your store, view analytics, and configure settings.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {adminLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link 
                  key={link.name} 
                  href={link.href}
                  className="glass-panel p-6 rounded-2xl border border-white/10 hover:border-white/20 transition-all duration-motion-normal hover:-translate-y-1 group"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Icon className={`w-6 h-6 ${link.color}`} />
                    </div>
                    <h2 className="text-xl font-bold text-white group-hover:text-nova-blue transition-colors">{link.name}</h2>
                  </div>
                  <p className="text-nova-silver text-sm">{link.desc}</p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
