"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Package, Heart, MapPin, Settings, LogOut, ChevronRight, ShoppingCart, Trash2 } from "lucide-react";
import { useClerk } from "@clerk/nextjs";
import { Button } from "@/shared/components/ui/button";
import { useCartStore } from "@/store/useCartStore";
import { toggleWishlist } from "@/domains/Customer/wishlist/actions";

type AccountProps = {
  user: { name: string | null; email: string; imageUrl: string };
  orders: any[];
  wishlist: any[];
  addresses: any[];
};

export function AccountClient({ user, orders, wishlist, addresses }: AccountProps) {
  const [activeTab, setActiveTab] = useState<"orders" | "wishlist" | "addresses" | "settings">("orders");
  const { signOut } = useClerk();
  const { addItem } = useCartStore();

  const handleRemoveFromWishlist = async (productId: string) => {
    // In a real app we'd optimistically update, but here we just call the action 
    // and wait for the revalidatePath to refresh the page.
    await toggleWishlist(productId);
  };

  const handleAddToCart = (product: any) => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1
    });
  };

  const tabs = [
    { id: "orders", label: "Orders", icon: Package },
    { id: "wishlist", label: "Wishlist", icon: Heart },
    { id: "addresses", label: "Addresses", icon: MapPin },
    { id: "settings", label: "Settings", icon: Settings },
  ] as const;

  const [mounted, setMounted] = useState(false);

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <main className="min-h-screen pt-32 pb-24 relative overflow-hidden">
      <div className="absolute top-1/4 -left-1/4 w-[600px] h-[600px] bg-cta-primary/10 rounded-full blur-[120px] -z-10 pointer-events-none" />
      <div className="absolute bottom-1/4 -right-1/4 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[120px] -z-10 pointer-events-none" />

      <div className="container mx-auto px-6 max-w-6xl">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">Your Account</h1>
          <p className="text-slate-300">Manage your profile, orders, and preferences.</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-12">
          {/* Sidebar */}
          <div className="w-full lg:w-1/4 space-y-8">
            <div className="glass-panel p-6 rounded-3xl border border-white/10 flex items-center gap-4">
              <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-cta-primary">
                <Image src={user.imageUrl || "/hero-product.png"} alt="Avatar" width={64} height={64} className="object-cover" />
              </div>
              <div>
                <h3 className="text-white font-bold text-lg">{user.name}</h3>
                <p className="text-slate-300 text-sm truncate">{user.email}</p>
              </div>
            </div>

            <div className="glass-panel p-4 rounded-3xl border border-white/10 flex flex-col gap-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-3 p-4 rounded-2xl transition-all ${
                      activeTab === tab.id 
                        ? "bg-cta-primary/20 text-white border border-cta-primary/30" 
                        : "text-slate-300 hover:bg-white/5 hover:text-white border border-transparent"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{tab.label}</span>
                    <ChevronRight className={`w-4 h-4 ml-auto transition-transform ${activeTab === tab.id ? "opacity-100" : "opacity-0"}`} />
                  </button>
                );
              })}

              <div className="h-px bg-white/10 my-2" />

              <button
                onClick={() => signOut({ redirectUrl: '/' })}
                className="flex items-center gap-3 p-4 rounded-2xl text-red-400 hover:bg-red-400/10 transition-all font-medium border border-transparent hover:border-red-400/20"
              >
                <LogOut className="w-5 h-5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="w-full lg:w-3/4">
            <AnimatePresence mode="wait">
              
              {/* ORDERS TAB */}
              {activeTab === "orders" && (
                <motion.div
                  key="orders"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <h2 className="text-2xl font-bold text-white mb-6">Order History</h2>
                  
                  {orders.length === 0 ? (
                    <div className="glass-panel p-12 rounded-3xl border border-white/10 flex flex-col items-center justify-center text-center bg-white/5">
                      <div className="w-20 h-20 bg-cta-primary/10 rounded-full flex items-center justify-center mb-6">
                        <Package className="w-10 h-10 text-cta-primary opacity-80" />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2">No orders yet</h3>
                      <p className="text-slate-300 mb-8">When you place an order, it will appear here.</p>
                      <Link href="/store">
                        <Button>Start Shopping</Button>
                      </Link>
                    </div>
                  ) : (
                    orders.map((order) => (
                      <div key={order.id} className="glass-panel rounded-3xl border border-white/10 overflow-hidden">
                        <div className="bg-white/5 px-6 py-4 flex flex-wrap items-center justify-between gap-4 border-b border-white/10">
                          <div>
                            <p className="text-xs text-slate-300 uppercase tracking-wider mb-1">Order Placed</p>
                            <p className="text-white font-medium">{new Date(order.createdAt).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-300 uppercase tracking-wider mb-1">Total</p>
                            <p className="text-white font-medium">${order.totalAmount.toFixed(2)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-300 uppercase tracking-wider mb-1">Status</p>
                            <span className="px-3 py-1 bg-amber-500/20 text-amber-500 text-xs font-bold rounded-full tracking-wider border border-amber-500/30">
                              {order.status}
                            </span>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-slate-300 uppercase tracking-wider mb-1">Order #</p>
                            <p className="text-white font-mono text-sm">{order.id.split('-')[0]}</p>
                          </div>
                        </div>
                        
                        <div className="p-6 space-y-6">
                          {order.items.map((item: any) => (
                            <div key={item.id} className="flex gap-6 items-center">
                              <Link href={`/product/${item.product.id}`} className="relative w-24 h-24 bg-black/40 rounded-xl border border-white/10 overflow-hidden flex items-center justify-center flex-shrink-0 group">
                                <Image src={item.product.image} alt={item.product.name} fill className="object-contain p-2 group-hover:scale-110 transition-transform" />
                              </Link>
                              <div className="flex-1">
                                <Link href={`/product/${item.product.id}`}>
                                  <h3 className="text-lg font-bold text-white mb-1 hover:text-cta-primary transition-colors line-clamp-1">{item.product.name}</h3>
                                </Link>
                                <p className="text-slate-300 text-sm mb-2">Qty: {item.quantity}</p>
                                <p className="text-white font-bold">${item.price.toFixed(2)}</p>
                              </div>
                              <div className="hidden sm:block">
                                <Button variant="outline" className="px-6 py-2 text-sm">Buy Again</Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </motion.div>
              )}

              {/* WISHLIST TAB */}
              {activeTab === "wishlist" && (
                <motion.div
                  key="wishlist"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <h2 className="text-2xl font-bold text-white mb-6">Your Wishlist</h2>
                  
                  {wishlist.length === 0 ? (
                    <div className="glass-panel p-12 rounded-3xl border border-white/10 flex flex-col items-center justify-center text-center bg-white/5">
                      <div className="w-20 h-20 bg-red-400/10 rounded-full flex items-center justify-center mb-6">
                        <Heart className="w-10 h-10 text-red-400 opacity-80" />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2">Your wishlist is empty</h3>
                      <p className="text-slate-300 mb-8">Save items you like and they will appear here.</p>
                      <Link href="/store">
                        <Button>Discover Products</Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {wishlist.map((item) => (
                        <div key={item.id} className="glass-panel p-5 rounded-3xl border border-white/10 relative flex flex-col bg-black/40 group">
                          <button 
                            onClick={() => handleRemoveFromWishlist(item.id)}
                            className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-red-400/20 backdrop-blur-md border border-red-400/30 flex items-center justify-center text-red-400 hover:bg-red-400 hover:text-white transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>

                          <Link href={`/product/${item.id}`} className="relative w-full aspect-square mb-5 rounded-2xl overflow-hidden bg-white/5 flex items-center justify-center p-6">
                            <Image
                              src={item.image}
                              alt={item.name}
                              fill
                              className="object-contain drop-shadow-2xl group-hover:scale-110 transition-transform duration-700"
                            />
                          </Link>
                          
                          <div className="flex flex-col flex-1">
                            <p className="text-slate-300 text-xs font-bold uppercase tracking-wider mb-2">{item.brand}</p>
                            <Link href={`/product/${item.id}`}>
                              <h3 className="text-lg font-bold text-white mb-4 line-clamp-1 group-hover:text-cta-primary transition-colors">{item.name}</h3>
                            </Link>
                            
                            <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
                              <span className="text-xl font-bold text-white">${item.price.toFixed(2)}</span>
                              <button 
                                onClick={() => handleAddToCart(item)}
                                className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-cta-primary hover:border-cta-primary transition-all"
                              >
                                <ShoppingCart className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {/* ADDRESSES TAB */}
              {activeTab === "addresses" && (
                <motion.div
                  key="addresses"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-white">Saved Addresses</h2>
                    <Button variant="outline" className="px-6 py-2 text-sm">+ Add New</Button>
                  </div>
                  
                  {addresses.length === 0 ? (
                    <div className="glass-panel p-12 rounded-3xl border border-white/10 text-center bg-white/5">
                      <p className="text-slate-300">You haven't saved any addresses yet.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {addresses.map((addr) => (
                        <div key={addr.id} className="glass-panel p-6 rounded-2xl border border-white/10 relative">
                          {addr.isDefault && (
                            <span className="absolute top-4 right-4 text-xs font-bold bg-cta-primary/20 text-cta-primary px-2 py-1 rounded border border-cta-primary/30">
                              DEFAULT
                            </span>
                          )}
                          <h4 className="text-white font-bold mb-2">Home</h4>
                          <p className="text-slate-300 text-sm">{addr.street}</p>
                          <p className="text-slate-300 text-sm">{addr.city}, {addr.state} {addr.zip}</p>
                          <p className="text-slate-300 text-sm mb-6">{addr.country}</p>
                          
                          <div className="flex gap-4">
                            <button className="text-sm font-medium text-cta-primary hover:text-white transition-colors">Edit</button>
                            <button className="text-sm font-medium text-red-400 hover:text-red-300 transition-colors">Remove</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {/* SETTINGS TAB */}
              {activeTab === "settings" && (
                <motion.div
                  key="settings"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <h2 className="text-2xl font-bold text-white mb-6">Account Settings</h2>
                  <div className="glass-panel p-8 rounded-3xl border border-white/10 space-y-8 bg-white/5">
                    <div>
                      <h3 className="text-lg font-bold text-white mb-4">Profile Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-xs text-slate-300 uppercase tracking-wider">Full Name</label>
                          <input type="text" defaultValue={user.name || ""} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cta-primary" readOnly />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs text-slate-300 uppercase tracking-wider">Email Address</label>
                          <input type="email" defaultValue={user.email} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cta-primary text-white/50 cursor-not-allowed" readOnly disabled />
                          <p className="text-xs text-slate-300">Managed via Clerk Auth.</p>
                        </div>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-white/10">
                      <h3 className="text-lg font-bold text-white mb-4">Notification Preferences</h3>
                      <div className="space-y-4">
                        <label className="flex items-center gap-4 cursor-pointer">
                          <input type="checkbox" defaultChecked className="w-5 h-5 accent-cta-primary rounded bg-black/40 border-white/10" />
                          <span className="text-slate-300">Order updates via email</span>
                        </label>
                        <label className="flex items-center gap-4 cursor-pointer">
                          <input type="checkbox" defaultChecked className="w-5 h-5 accent-cta-primary rounded bg-black/40 border-white/10" />
                          <span className="text-slate-300">Exclusive offers and promotions</span>
                        </label>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-white/10">
                      <Button>Save Changes</Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </main>
  );
}
