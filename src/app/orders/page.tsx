import React from "react";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Package, Clock, CheckCircle } from "lucide-react";

export default async function OrdersPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // Find user in Prisma
  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: {
      orders: {
        orderBy: { createdAt: "desc" },
        include: {
          items: {
            include: { 
              product: {
                include: { images: true }
              } 
            }
          }
        }
      }
    }
  });

  const orders = user?.orders || [];

  return (
    <main className="min-h-screen flex flex-col bg-black relative overflow-hidden">
      <Navbar />

      {/* Ambient background */}
      <div className="absolute top-1/3 right-0 w-[600px] h-[600px] bg-nova-blue/10 rounded-full blur-[150px] -z-10 pointer-events-none" />

      <section className="pt-32 pb-24 flex-1">
        <div className="container mx-auto px-6 max-w-4xl">
          <h1 className="text-4xl font-bold text-white mb-2">Order History</h1>
          <p className="text-nova-silver mb-12">Track and manage your past acquisitions.</p>

          {orders.length === 0 ? (
            <div className="glass-panel p-12 text-center rounded-3xl border border-white/10 flex flex-col items-center">
              <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6 border border-white/10">
                <Package className="w-10 h-10 text-nova-silver opacity-50" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">No orders found</h2>
              <p className="text-nova-silver">You haven't made any purchases yet. Head over to the store to gear up.</p>
            </div>
          ) : (
            <div className="space-y-8">
              {orders.map((order) => (
                <div key={order.id} className="glass-panel rounded-3xl border border-white/10 overflow-hidden group hover:border-nova-blue/30 transition-all duration-300">
                  {/* Order Header */}
                  <div className="bg-white/5 px-6 py-4 border-b border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-6">
                      <div>
                        <p className="text-nova-silver text-xs uppercase tracking-wider mb-1">Order Placed</p>
                        <p className="text-white font-medium">{new Date(order.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-nova-silver text-xs uppercase tracking-wider mb-1">Total</p>
                        <p className="text-white font-bold text-nova-blue">${order.totalAmount.toFixed(2)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-nova-silver text-sm">Order #<span className="text-white font-mono">{order.id.slice(-8).toUpperCase()}</span></span>
                    </div>
                  </div>

                  {/* Order Status */}
                  <div className="px-6 py-4 bg-black/20 flex items-center gap-3 border-b border-white/5">
                    {order.status === "PAID" ? (
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    ) : (
                      <Clock className="w-5 h-5 text-nova-amber" />
                    )}
                    <span className="text-white font-medium">Status: <span className={order.status === "PAID" ? "text-green-400" : "text-nova-amber"}>{order.status}</span></span>
                  </div>

                  {/* Order Items */}
                  <div className="p-6">
                    <div className="space-y-6">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex gap-6 items-center">
                          <div className="relative w-24 h-24 bg-white/5 rounded-xl border border-white/10 overflow-hidden flex items-center justify-center flex-shrink-0">
                            <img src={item.product.images?.[0]?.url || "/hero-product.png"} alt={item.product.name} className="w-16 h-16 object-contain" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg font-bold text-white mb-1 hover:text-nova-blue transition-colors cursor-pointer">
                              {item.product.name}
                            </h3>
                            <p className="text-nova-silver text-sm mb-2">{item.product.category}</p>
                            <div className="flex items-center justify-between">
                              <span className="text-white">Qty: {item.quantity}</span>
                              <span className="text-nova-blue font-bold">${(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}
