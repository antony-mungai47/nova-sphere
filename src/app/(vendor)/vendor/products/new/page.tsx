"use client";

import React, { useState } from 'react';
import { CldUploadWidget } from 'next-cloudinary';
import { useRouter } from 'next/navigation';

export default function NewProductPage() {
  const [imageUrl, setImageUrl] = useState('');
  const router = useRouter();

  const handleUploadSuccess = (result: any) => {
    setImageUrl(result.info.secure_url);
    console.log("[Cloudinary Upload Success]", result.info.secure_url);
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-white mb-8">Add New Product</h1>
      
      <div className="bg-[#1a1f2e] border border-white/10 rounded-xl shadow-lg p-6 max-w-2xl">
        <form className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-nova-silver mb-2">Product Image</label>
            <div className="flex items-center gap-4">
              {imageUrl ? (
                <img src={imageUrl} alt="Product" className="w-24 h-24 object-cover rounded-lg border border-white/10" />
              ) : (
                <div className="w-24 h-24 bg-black/30 rounded-lg border border-white/10 flex items-center justify-center text-xs text-nova-silver">
                  No Image
                </div>
              )}
              <CldUploadWidget uploadPreset="nova_sphere_products" onSuccess={handleUploadSuccess}>
                {({ open }) => {
                  return (
                    <button type="button" onClick={() => open()} className="bg-nova-blue text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors">
                      Upload to Cloudinary
                    </button>
                  );
                }}
              </CldUploadWidget>
            </div>
            {imageUrl && <input type="hidden" name="imageUrl" value={imageUrl} />}
          </div>

          <div>
            <label className="block text-sm font-medium text-nova-silver mb-2">Product Name</label>
            <input type="text" className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-2 text-white" placeholder="e.g. Nova Pro Wireless" />
          </div>

          <div>
            <label className="block text-sm font-medium text-nova-silver mb-2">Price</label>
            <input type="number" step="0.01" className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-2 text-white" placeholder="99.99" />
          </div>

          <button type="button" onClick={() => router.push('/vendor/products')} className="bg-green-500 text-white px-6 py-3 rounded-lg font-bold w-full hover:bg-green-600 transition-colors">
            Create Product
          </button>
        </form>
      </div>
    </div>
  );
}
