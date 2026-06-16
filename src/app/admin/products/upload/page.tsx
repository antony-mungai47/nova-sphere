"use client";

import React, { useState } from "react";
import { CldUploadWidget } from "next-cloudinary";
import { Upload, Image as ImageIcon, Loader2 } from "lucide-react";
import { AnimatedButton } from "@/components/ui/animated-button";
import { createProduct } from "@/app/actions/product";
import { useRouter } from "next/navigation";

export default function ProductUploadPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    sku: "",
    category: "Electronics",
    brand: "",
    stock: "10"
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageUrl) return alert("Please upload an image first.");
    
    setLoading(true);
    const res = await createProduct({
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price),
      sku: formData.sku,
      category: formData.category,
      brand: formData.brand,
      stock: parseInt(formData.stock),
      imageUrl
    });

    setLoading(false);
    if (res.success) {
      alert("Product uploaded successfully!");
      router.push("/store");
    } else {
      alert("Error uploading product: " + res.error);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Upload New Product</h1>
        <p className="text-nova-silver">Add a new item to the store catalog.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="glass-panel p-8 rounded-2xl border border-white/10">
          <h2 className="text-xl font-bold text-white mb-6">Product Image</h2>
          <div className="flex flex-col items-center justify-center border-2 border-dashed border-white/20 rounded-2xl p-12 bg-black/20 hover:bg-black/30 transition-colors">
            {imageUrl ? (
              <div className="relative w-48 h-48 rounded-xl overflow-hidden mb-4">
                <img src={imageUrl} alt="Uploaded" className="object-cover w-full h-full" />
              </div>
            ) : (
              <div className="w-16 h-16 rounded-full bg-nova-blue/20 flex items-center justify-center mb-4">
                <ImageIcon className="w-8 h-8 text-nova-blue" />
              </div>
            )}
            
            <CldUploadWidget 
              uploadPreset="nova_sphere"
              signatureEndpoint="/api/cloudinary/sign"
              onSuccess={(result: any) => {
                setImageUrl(result.info.secure_url);
              }}
            >
              {({ open }) => (
                <button 
                  type="button" 
                  onClick={() => open()} 
                  className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all"
                >
                  <Upload className="w-4 h-4" />
                  {imageUrl ? "Replace Image" : "Upload Image"}
                </button>
              )}
            </CldUploadWidget>
          </div>
        </div>

        <div className="glass-panel p-8 rounded-2xl border border-white/10">
          <h2 className="text-xl font-bold text-white mb-6">Product Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-nova-silver text-sm font-medium">Product Name</label>
              <input required name="name" value={formData.name} onChange={handleChange} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-nova-blue transition-colors" placeholder="e.g. Sony WH-1000XM5" />
            </div>
            
            <div className="space-y-2">
              <label className="text-nova-silver text-sm font-medium">SKU</label>
              <input required name="sku" value={formData.sku} onChange={handleChange} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-nova-blue transition-colors" placeholder="e.g. SNY-WH-1000" />
            </div>

            <div className="space-y-2">
              <label className="text-nova-silver text-sm font-medium">Brand</label>
              <input required name="brand" value={formData.brand} onChange={handleChange} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-nova-blue transition-colors" placeholder="e.g. Sony" />
            </div>

            <div className="space-y-2">
              <label className="text-nova-silver text-sm font-medium">Category</label>
              <select name="category" value={formData.category} onChange={handleChange} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-nova-blue transition-colors">
                <option value="Electronics">Electronics</option>
                <option value="Fashion">Fashion</option>
                <option value="Home & Kitchen">Home & Kitchen</option>
                <option value="Office">Office</option>
                <option value="Travel">Travel</option>
                <option value="Fitness">Fitness</option>
                <option value="Gaming">Gaming</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-nova-silver text-sm font-medium">Price ($)</label>
              <input required type="number" step="0.01" name="price" value={formData.price} onChange={handleChange} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-nova-blue transition-colors" placeholder="299.99" />
            </div>

            <div className="space-y-2">
              <label className="text-nova-silver text-sm font-medium">Initial Stock</label>
              <input required type="number" name="stock" value={formData.stock} onChange={handleChange} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-nova-blue transition-colors" placeholder="10" />
            </div>

            <div className="col-span-1 md:col-span-2 space-y-2">
              <label className="text-nova-silver text-sm font-medium">Description</label>
              <textarea required name="description" value={formData.description} onChange={handleChange} rows={4} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-nova-blue transition-colors" placeholder="Product description..." />
            </div>
          </div>
        </div>

        <AnimatedButton type="submit" disabled={loading} className="w-full py-4 text-lg font-bold flex items-center justify-center gap-2">
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Upload className="w-5 h-5" /> Publish Product</>}
        </AnimatedButton>
      </form>
    </div>
  );
}
