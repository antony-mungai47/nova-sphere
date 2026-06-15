"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, Loader2, Star } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import Image from "next/image";
import { AnimatedButton } from "@/components/ui/animated-button";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { getUpsellProducts } from "@/app/actions/products";

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CartSidebar = ({ isOpen, onClose }: CartSidebarProps) => {
  const { items, removeItem, updateQuantity, getCartTotal } = useCartStore();
  const router = useRouter();
  const { isSignedIn } = useAuth();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [upsells, setUpsells] = useState<any[]>([]);
  const [couponCode, setCouponCode] = useState("");
  const [discountPercent, setDiscountPercent] = useState(0);

  React.useEffect(() => {
    if (isOpen && items.length > 0) {
      getUpsellProducts(items.map(i => i.id)).then(setUpsells);
    }
  }, [isOpen, items]);

  const [couponError, setCouponError] = useState("");

  const applyCoupon = async () => {
    setCouponError("");
    if (!couponCode) {
      setDiscountPercent(0);
      return;
    }

    try {
      const res = await fetch("/api/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCode })
      });
      const data = await res.json();
      
      if (data.success) {
        setDiscountPercent(data.discountPercent);
        setCouponError(`Applied ${data.discountPercent}% off!`);
      } else {
        setDiscountPercent(0);
        setCouponError(data.error || "Invalid coupon code.");
      }
    } catch (err) {
      setDiscountPercent(0);
      setCouponError("Failed to apply coupon.");
    }
  };

  const getDiscountedTotal = () => {
    const total = getCartTotal();
    return total - (total * (discountPercent / 100));
  };

  const handleCheckout = async () => {
    if (!isSignedIn) {
      alert("Please sign in to checkout!");
      onClose();
      return;
    }
    
    setIsCheckingOut(true);
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          items: items,
          total: getDiscountedTotal(),
        })
      });

      if (response.ok) {
        const data = await response.json();
        onClose();
        if (data.checkoutUrl) {
          router.push(data.checkoutUrl);
        } else {
          router.push("/checkout/success");
        }
      } else {
        alert("Checkout failed. Please try again.");
      }
    } catch (error) {
      console.error(error);
      alert("An error occurred during checkout.");
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full sm:w-[450px] bg-nova-navy/95 backdrop-blur-xl border-l border-white/10 z-50 flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ShoppingBag className="w-5 h-5 text-nova-blue" />
                <h2 className="text-xl font-bold text-white">Your Cart</h2>
                <span className="bg-nova-blue/20 text-nova-blue text-xs font-bold px-2 py-1 rounded-full">
                  {items.length}
                </span>
              </div>
              <button 
                onClick={onClose}
                className="p-2 rounded-full hover:bg-white/10 text-nova-silver hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-nova-silver space-y-4">
                  <ShoppingBag className="w-16 h-16 opacity-20" />
                  <p className="text-lg">Your cart is empty.</p>
                  <AnimatedButton onClick={onClose} className="mt-4">
                    Continue Shopping
                  </AnimatedButton>
                </div>
              ) : (
                <div className="space-y-6">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-4 p-4 rounded-xl bg-white/5 border border-white/5 relative group">
                      <div className="relative w-20 h-20 bg-black/30 rounded-lg flex-shrink-0 flex items-center justify-center">
                        <Image src={item.image.toString()} alt={item.name.toString()} width={60} height={60} className="object-contain drop-shadow-[0_0_10px_rgba(255,255,255,0.1)]" />
                      </div>
                      <div className="flex-1 flex flex-col justify-between py-1">
                        <div>
                          <h3 className="text-white font-medium text-sm line-clamp-1">{item.name}</h3>
                          <p className="text-nova-blue font-semibold mt-1">${item.price.toFixed(2)}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-6 h-6 rounded bg-white/10 flex items-center justify-center text-white hover:bg-nova-blue transition-colors"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-white text-sm w-4 text-center">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-6 h-6 rounded bg-white/10 flex items-center justify-center text-white hover:bg-nova-blue transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                      <button 
                        onClick={() => removeItem(item.id)}
                        className="absolute top-4 right-4 text-nova-silver hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}

                  {/* Upsells Section */}
                  {upsells.length > 0 && (
                    <div className="pt-8 mt-8 border-t border-white/10">
                      <h4 className="text-white font-bold mb-4 flex items-center gap-2">
                        <Star className="w-4 h-4 text-nova-amber fill-nova-amber" /> You Might Also Like
                      </h4>
                      <div className="space-y-4">
                        {upsells.map((upsell) => (
                          <div key={upsell.id} className="flex gap-4 p-3 rounded-xl bg-black/40 border border-white/5 items-center">
                            <div className="relative w-16 h-16 bg-white/5 rounded-lg flex-shrink-0 flex items-center justify-center p-2">
                              <Image src={upsell.image} alt={upsell.name} fill className="object-contain" />
                            </div>
                            <div className="flex-1">
                              <p className="text-white text-xs font-bold line-clamp-1">{upsell.name}</p>
                              <p className="text-nova-blue text-xs font-medium">${(upsell.salePrice || upsell.price).toFixed(2)}</p>
                            </div>
                            <button 
                              onClick={() => {
                                useCartStore.getState().addItem({
                                  id: upsell.id, name: upsell.name, price: upsell.salePrice || upsell.price, image: upsell.image, quantity: 1
                                });
                              }}
                              className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-nova-blue transition-colors"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer / Checkout */}
            {items.length > 0 && (
              <div className="p-6 border-t border-white/10 bg-black/20 space-y-4">
                
                {/* Coupon Input */}
                <div className="flex flex-col gap-2">
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      placeholder="Coupon Code (Try NOVA10)" 
                      className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-nova-blue"
                    />
                    <button 
                      onClick={applyCoupon}
                      className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm font-medium rounded-xl transition-colors"
                    >
                      Apply
                    </button>
                  </div>
                  {couponError && (
                    <span className={`text-xs ${discountPercent > 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {couponError}
                    </span>
                  )}
                </div>

                <div className="pt-2">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-nova-silver">Subtotal</span>
                    <span className="text-white font-medium">${getCartTotal().toFixed(2)}</span>
                  </div>
                  {discountPercent > 0 && (
                    <div className="flex items-center justify-between mb-2 text-green-400">
                      <span>Discount ({discountPercent}%)</span>
                      <span>-${(getCartTotal() * (discountPercent / 100)).toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between mb-4 mt-2 pt-2 border-t border-white/10">
                    <span className="text-white font-bold">Total</span>
                    <span className="text-white font-bold text-xl">${getDiscountedTotal().toFixed(2)}</span>
                  </div>
                  <p className="text-xs text-nova-silver mb-4 text-center">Shipping & taxes calculated at checkout.</p>
                </div>
                <AnimatedButton 
                  onClick={handleCheckout} 
                  disabled={isCheckingOut}
                  className="w-full py-4 text-lg font-bold flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(59,130,246,0.3)] disabled:opacity-50"
                >
                  {isCheckingOut ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" /> Processing...
                    </>
                  ) : (
                    <>
                      Proceed to Checkout <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </AnimatedButton>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
