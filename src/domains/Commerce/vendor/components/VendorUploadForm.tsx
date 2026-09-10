"use client";

import React, { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { Loader2, Plus, Trash2, CreditCard } from "lucide-react";
import { Button } from "@/shared/components/ui/button";

const BASE_LISTING_FEE = 5.00;

interface VendorProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  type: string;
  model: string;
}

export const VendorUploadForm = () => {
  const { isSignedIn } = useAuth();
  const [products, setProducts] = useState<VendorProduct[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // New Product Draft State
  const [draft, setDraft] = useState<Partial<VendorProduct>>({
    name: "", description: "", price: 0, category: "", type: "", model: ""
  });

  const addProduct = () => {
    if (!draft.name || !draft.price) return alert("Name and Price are required.");
    setProducts([...products, { ...draft, id: Date.now().toString() } as VendorProduct]);
    setDraft({ name: "", description: "", price: 0, category: "", type: "", model: "" });
  };

  const removeProduct = (id: string) => {
    setProducts(products.filter(p => p.id !== id));
  };

  const calculateTotalFee = () => products.length * BASE_LISTING_FEE;

  const handleCheckout = async () => {
    if (!isSignedIn) return alert("Please sign in as a Vendor.");
    if (products.length === 0) return alert("Please add at least one product.");
    
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/vendor/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ products })
      });
      const data = await res.json();
      if (data.success) {
        alert(`Success! Paid $${data.totalPaid}. Products are now in review.`);
        setProducts([]);
      } else {
        alert(data.error || "Checkout failed");
      }
    } catch (err) {
      alert("System error during checkout.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="glass-panel p-8 rounded-3xl w-full max-w-4xl mx-auto space-y-8">
      <div className="border-b border-border pb-4">
        <h2 className="text-2xl font-bold text-foreground">Vendor Check-In</h2>
        <p className="text-muted">Upload your products to the Nova Sphere Marketplace.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4 bg-surface p-6 rounded-2xl border border-border">
          <h3 className="font-bold text-lg">Add New Listing</h3>
          
          <input type="text" placeholder="Product Name" value={draft.name} onChange={(e) => setDraft({...draft, name: e.target.value})} className="w-full bg-background border border-border rounded-xl p-3 text-sm focus:border-cta-primary outline-none" />
          
          <div className="grid grid-cols-2 gap-4">
            <input type="number" placeholder="Price ($)" value={draft.price || ''} onChange={(e) => setDraft({...draft, price: Number(e.target.value)})} className="w-full bg-background border border-border rounded-xl p-3 text-sm focus:border-cta-primary outline-none" />
            <input type="text" placeholder="Category" value={draft.category} onChange={(e) => setDraft({...draft, category: e.target.value})} className="w-full bg-background border border-border rounded-xl p-3 text-sm focus:border-cta-primary outline-none" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <input type="text" placeholder="Spec Type (e.g. CPU)" value={draft.type} onChange={(e) => setDraft({...draft, type: e.target.value})} className="w-full bg-background border border-border rounded-xl p-3 text-sm focus:border-cta-primary outline-none" />
            <input type="text" placeholder="Spec Model (e.g. i9)" value={draft.model} onChange={(e) => setDraft({...draft, model: e.target.value})} className="w-full bg-background border border-border rounded-xl p-3 text-sm focus:border-cta-primary outline-none" />
          </div>

          <textarea placeholder="Description..." value={draft.description} onChange={(e) => setDraft({...draft, description: e.target.value})} className="w-full bg-background border border-border rounded-xl p-3 text-sm focus:border-cta-primary outline-none h-24" />

          <Button onClick={addProduct} className="w-full gap-2">
            <Plus className="w-4 h-4" /> Add to Batch
          </Button>
        </div>

        <div className="space-y-4">
          <h3 className="font-bold text-lg">Current Batch ({products.length})</h3>
          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
            {products.length === 0 ? (
              <p className="text-muted text-sm italic">No products added yet.</p>
            ) : (
              products.map(p => (
                <div key={p.id} className="flex items-center justify-between bg-surface p-4 rounded-xl border border-border shadow-soft">
                  <div>
                    <p className="font-bold text-sm text-foreground">{p.name}</p>
                    <p className="text-xs text-muted">${p.price} • {p.category}</p>
                  </div>
                  <button onClick={() => removeProduct(p.id)} className="text-red-400 hover:text-red-500 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>

          {products.length > 0 && (
            <div className="bg-cta-secondary/10 border border-cta-secondary/20 p-6 rounded-2xl mt-6">
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm font-bold text-slate-400">Listing Fee ({products.length}x)</span>
                <span className="text-xl font-bold text-cta-secondary">${calculateTotalFee().toFixed(2)}</span>
              </div>
              <Button onClick={handleCheckout} disabled={isSubmitting} className="w-full bg-cta-secondary hover:bg-cta-secondary/90 text-white gap-2 py-6">
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <CreditCard className="w-5 h-5" />}
                Pay & Publish Batch
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
