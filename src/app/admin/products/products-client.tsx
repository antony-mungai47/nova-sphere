"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Edit, Trash2, Plus, X, Loader2 } from "lucide-react";
import { AnimatedButton } from "@/components/ui/animated-button";
import { createProduct, updateProduct, deleteProduct } from "@/app/admin/products/actions";
import { motion, AnimatePresence } from "framer-motion";

type Product = {
  id: string;
  name: string;
  price: number;
  category: string;
  imageUrl: string;
  stock: number;
  isTrending: boolean;
  description: string;
};

export const ProductsClient = ({ initialProducts }: { initialProducts: Product[] }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpenNew = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (product: Product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      await deleteProduct(id);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    
    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, formData);
      } else {
        await createProduct(formData);
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error(error);
      alert("An error occurred while saving the product.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Products</h1>
          <p className="text-nova-silver">Manage your tech inventory.</p>
        </div>
        <AnimatedButton onClick={handleOpenNew} glow={true} className="flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Product
        </AnimatedButton>
      </div>

      <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-white/5 border-b border-white/10">
            <tr>
              <th className="p-4 text-nova-silver font-medium">Product</th>
              <th className="p-4 text-nova-silver font-medium hidden md:table-cell">Category</th>
              <th className="p-4 text-nova-silver font-medium">Price</th>
              <th className="p-4 text-nova-silver font-medium hidden sm:table-cell">Stock</th>
              <th className="p-4 text-nova-silver font-medium hidden lg:table-cell">Status</th>
              <th className="p-4 text-nova-silver font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {initialProducts.map((product) => (
              <tr key={product.id} className="hover:bg-white/5 transition-colors">
                <td className="p-4 flex items-center gap-4">
                  <div className="relative w-12 h-12 rounded-lg bg-black/40 overflow-hidden border border-white/10 flex items-center justify-center">
                    <img src={product.imageUrl} alt={product.name} className="w-8 h-8 object-contain" />
                  </div>
                  <span className="text-white font-medium line-clamp-1">{product.name}</span>
                </td>
                <td className="p-4 text-nova-silver hidden md:table-cell">{product.category}</td>
                <td className="p-4 text-white">${product.price.toFixed(2)}</td>
                <td className="p-4 text-nova-silver hidden sm:table-cell">{product.stock > 0 ? product.stock : 'Out of stock'}</td>
                <td className="p-4 hidden lg:table-cell">
                  <span className={`px-2 py-1 text-xs rounded-full border ${product.isTrending ? 'bg-nova-amber/20 text-nova-amber border-nova-amber/20' : 'bg-nova-blue/20 text-nova-blue border-nova-blue/20'}`}>
                    {product.isTrending ? 'Trending' : 'Standard'}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => handleOpenEdit(product)} className="p-2 bg-white/5 rounded-lg text-nova-silver hover:text-nova-blue hover:bg-nova-blue/10 transition-colors">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(product.id)} className="p-2 bg-white/5 rounded-lg text-nova-silver hover:text-red-400 hover:bg-red-400/10 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-panel w-full max-w-2xl rounded-3xl border border-white/10 overflow-hidden shadow-2xl relative"
            >
              <div className="flex items-center justify-between p-6 border-b border-white/10 bg-white/5">
                <h2 className="text-xl font-bold text-white">{editingProduct ? 'Edit Product' : 'Add Product'}</h2>
                <button onClick={() => setIsModalOpen(false)} className="text-nova-silver hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-nova-silver mb-2">Product Name</label>
                    <input 
                      required
                      name="name"
                      defaultValue={editingProduct?.name || ""}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-nova-blue transition-colors" 
                      placeholder="e.g. Neural Link Earbuds"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-nova-silver mb-2">Category</label>
                    <input 
                      required
                      name="category"
                      defaultValue={editingProduct?.category || ""}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-nova-blue transition-colors" 
                      placeholder="e.g. Audio"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-nova-silver mb-2">Price ($)</label>
                    <input 
                      required
                      type="number"
                      step="0.01"
                      name="price"
                      defaultValue={editingProduct?.price || ""}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-nova-blue transition-colors" 
                      placeholder="299.99"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-nova-silver mb-2">Stock Quantity</label>
                    <input 
                      required
                      type="number"
                      name="stock"
                      defaultValue={editingProduct?.stock || "0"}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-nova-blue transition-colors" 
                      placeholder="100"
                    />
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-nova-silver mb-2">Image URL</label>
                  <input 
                    name="imageUrl"
                    defaultValue={editingProduct?.imageUrl || ""}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-nova-blue transition-colors" 
                    placeholder="/hero-product.png"
                  />
                  <p className="text-xs text-nova-silver/70 mt-2">Leave blank to use default placeholder image.</p>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-nova-silver mb-2">Description</label>
                  <textarea 
                    required
                    name="description"
                    defaultValue={editingProduct?.description || ""}
                    rows={4}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-nova-blue transition-colors resize-none" 
                    placeholder="Describe the advanced technology..."
                  />
                </div>

                <div className="mb-8">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input 
                      type="checkbox" 
                      name="isTrending"
                      defaultChecked={editingProduct?.isTrending || false}
                      className="w-5 h-5 rounded border-white/10 bg-black/40 text-nova-blue focus:ring-nova-blue focus:ring-offset-0"
                    />
                    <span className="text-sm font-medium text-white">Mark as Trending</span>
                  </label>
                </div>

                <div className="flex justify-end gap-4">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-3 rounded-xl border border-white/10 text-nova-silver hover:bg-white/5 transition-colors font-medium">
                    Cancel
                  </button>
                  <AnimatedButton type="submit" disabled={isSubmitting} className="px-8 py-3 font-medium flex items-center justify-center min-w-[140px]">
                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save Product'}
                  </AnimatedButton>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
