"use client";

import React, { useState } from "react";
import Image from "next/image";
import { StoreSettings } from "@prisma/client";
import { updateSettings } from "./actions";
import { Save, Loader2, CheckCircle2, X } from "lucide-react";
import { CldUploadWidget } from "next-cloudinary";

export function SettingsForm({ initialData }: { initialData: StoreSettings }) {
  const [isPending, setIsPending] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const [logoUrl, setLogoUrl] = useState(initialData.storeLogo || "");
  const [faviconUrl, setFaviconUrl] = useState(initialData.favicon || "");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsPending(true);
    setSuccess(false);
    
    const formData = new FormData(e.currentTarget);
    formData.append("storeLogo", logoUrl);
    formData.append("favicon", faviconUrl);
    
    try {
      await updateSettings(initialData.id, formData);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error(error);
      alert("Failed to save settings");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 pb-20">
      {/* Branding & Theme */}
      <div className="glass-panel p-6 border border-white/10 rounded-2xl">
        <h2 className="text-xl font-bold text-white mb-6">Branding & Theme</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Logo Upload */}
          <div>
            <label className="block text-sm font-medium text-nova-silver mb-2">Store Logo (Master Concept 1)</label>
            {logoUrl ? (
              <div className="relative w-48 h-24 mb-4 rounded-xl overflow-hidden border border-white/10 bg-black/40">
                <Image src={logoUrl} alt="Logo" fill className="object-contain p-2" />
                <button 
                  type="button" 
                  onClick={() => setLogoUrl("")}
                  className="absolute top-2 right-2 p-1 bg-black/50 hover:bg-red-500/80 rounded-md text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : null}
            <CldUploadWidget 
              uploadPreset="ml_default"
              onSuccess={(result: any) => {
                if (result?.info?.secure_url) setLogoUrl(result.info.secure_url);
              }}
            >
              {({ open }) => (
                <button
                  type="button"
                  onClick={() => open()}
                  className="px-4 py-2 bg-nova-blue/20 text-nova-blue border border-nova-blue/30 rounded-xl font-medium hover:bg-nova-blue/30 transition-colors"
                >
                  {logoUrl ? "Change Logo" : "Upload Logo"}
                </button>
              )}
            </CldUploadWidget>
          </div>

          {/* Favicon Upload */}
          <div>
            <label className="block text-sm font-medium text-nova-silver mb-2">Favicon (180x180)</label>
            {faviconUrl ? (
              <div className="relative w-16 h-16 mb-4 rounded-xl overflow-hidden border border-white/10 bg-black/40">
                <Image src={faviconUrl} alt="Favicon" fill className="object-contain p-2" />
                <button 
                  type="button" 
                  onClick={() => setFaviconUrl("")}
                  className="absolute top-1 right-1 p-1 bg-black/50 hover:bg-red-500/80 rounded-md text-white transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ) : null}
            <CldUploadWidget 
              uploadPreset="ml_default"
              onSuccess={(result: any) => {
                if (result?.info?.secure_url) setFaviconUrl(result.info.secure_url);
              }}
            >
              {({ open }) => (
                <button
                  type="button"
                  onClick={() => open()}
                  className="px-4 py-2 bg-nova-blue/20 text-nova-blue border border-nova-blue/30 rounded-xl font-medium hover:bg-nova-blue/30 transition-colors"
                >
                  {faviconUrl ? "Change Favicon" : "Upload Favicon"}
                </button>
              )}
            </CldUploadWidget>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div>
            <label className="block text-sm font-medium text-nova-silver mb-2">Primary Color (CTA)</label>
            <div className="flex items-center gap-3">
              <input 
                type="color" 
                name="primaryColor" 
                defaultValue={initialData.primaryColor}
                className="w-12 h-12 rounded-xl cursor-pointer bg-black/50 border border-white/10"
              />
              <span className="text-white text-sm">{initialData.primaryColor}</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-nova-silver mb-2">Secondary Color (Success)</label>
            <div className="flex items-center gap-3">
              <input 
                type="color" 
                name="secondaryColor" 
                defaultValue={initialData.secondaryColor}
                className="w-12 h-12 rounded-xl cursor-pointer bg-black/50 border border-white/10"
              />
              <span className="text-white text-sm">{initialData.secondaryColor}</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-nova-silver mb-2">Accent Color (Premium)</label>
            <div className="flex items-center gap-3">
              <input 
                type="color" 
                name="accentColor" 
                defaultValue={initialData.accentColor}
                className="w-12 h-12 rounded-xl cursor-pointer bg-black/50 border border-white/10"
              />
              <span className="text-white text-sm">{initialData.accentColor}</span>
            </div>
          </div>
        </div>

        <div className="p-4 bg-white/5 border border-white/10 rounded-xl flex items-center justify-between gap-6">
          <div className="flex-1">
            <h3 className="text-white font-medium mb-1">Global Watermark</h3>
            <p className="text-sm text-nova-silver">Display the store logo as a subtle background watermark across the platform.</p>
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-white text-sm">
              Opacity:
              <input 
                type="number" 
                name="watermarkOpacity" 
                step="0.01" 
                min="0" 
                max="1"
                defaultValue={initialData.watermarkOpacity}
                className="w-20 bg-black/50 border border-white/10 rounded-lg px-2 py-1 text-white text-center focus:border-nova-blue" 
              />
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="checkbox" 
                name="watermarkEnabled"
                value="true"
                defaultChecked={initialData.watermarkEnabled}
                className="w-5 h-5 rounded border-white/10 bg-black/40 text-nova-blue focus:ring-nova-blue focus:ring-offset-0"
              />
              <span className="text-sm font-medium text-white">Enable</span>
            </label>
          </div>
        </div>
      </div>

      {/* General Settings */}
      <div className="glass-panel p-6 border border-white/10 rounded-2xl">
        <h2 className="text-xl font-bold text-white mb-6">General Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-nova-silver mb-2">Store Name</label>
            <input 
              name="storeName" 
              defaultValue={initialData.storeName} 
              required
              className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-nova-blue transition-colors" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-nova-silver mb-2">Store Description</label>
            <input 
              name="storeDescription" 
              defaultValue={initialData.storeDescription || ""} 
              className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-nova-blue transition-colors" 
            />
          </div>
        </div>
      </div>

      {/* SEO Settings */}
      <div className="glass-panel p-6 border border-white/10 rounded-2xl">
        <h2 className="text-xl font-bold text-white mb-6">SEO Configuration</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-nova-silver mb-2">Meta Title</label>
            <input 
              name="seoTitle" 
              defaultValue={initialData.seoTitle || ""} 
              placeholder="Nova Sphere - Premium Marketplace"
              className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-nova-blue transition-colors" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-nova-silver mb-2">Meta Description</label>
            <input 
              name="seoDescription" 
              defaultValue={initialData.seoDescription || ""} 
              placeholder="Discover the future of premium tech..."
              className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-nova-blue transition-colors" 
            />
          </div>
        </div>
      </div>

      {/* Social Links */}
      <div className="glass-panel p-6 border border-white/10 rounded-2xl">
        <h2 className="text-xl font-bold text-white mb-6">Social Media Profiles</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-nova-silver mb-2">Instagram URL</label>
            <input name="instagramUrl" defaultValue={initialData.instagramUrl || ""} placeholder="https://instagram.com/novasphere" className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-nova-blue transition-colors" />
          </div>
          <div>
            <label className="block text-sm font-medium text-nova-silver mb-2">X (Twitter) URL</label>
            <input name="twitterUrl" defaultValue={initialData.twitterUrl || ""} placeholder="https://x.com/novasphere" className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-nova-blue transition-colors" />
          </div>
          <div>
            <label className="block text-sm font-medium text-nova-silver mb-2">Facebook URL</label>
            <input name="facebookUrl" defaultValue={initialData.facebookUrl || ""} placeholder="https://facebook.com/novasphere" className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-nova-blue transition-colors" />
          </div>
          <div>
            <label className="block text-sm font-medium text-nova-silver mb-2">LinkedIn URL</label>
            <input name="linkedinUrl" defaultValue={initialData.linkedinUrl || ""} placeholder="https://linkedin.com/company/novasphere" className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-nova-blue transition-colors" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-nova-silver mb-2">TikTok URL</label>
            <input name="tiktokUrl" defaultValue={initialData.tiktokUrl || ""} placeholder="https://tiktok.com/@novasphere" className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-nova-blue transition-colors" />
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="glass-panel p-6 border border-white/10 rounded-2xl">
        <h2 className="text-xl font-bold text-white mb-6">Contact & Support</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-nova-silver mb-2">Support Email</label>
            <input 
              name="supportEmail" 
              type="email"
              defaultValue={initialData.supportEmail || ""} 
              className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-nova-blue transition-colors" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-nova-silver mb-2">Business Phone</label>
            <input 
              name="businessPhone" 
              defaultValue={initialData.businessPhone || ""} 
              className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-nova-blue transition-colors" 
            />
          </div>
        </div>
      </div>

      {/* Business Operations */}
      <div className="glass-panel p-6 border border-white/10 rounded-2xl">
        <h2 className="text-xl font-bold text-white mb-6">Business Operations</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-nova-silver mb-2">Currency Code</label>
            <input 
              name="currency" 
              defaultValue={initialData.currency} 
              maxLength={3}
              required
              className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-nova-blue transition-colors uppercase" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-nova-silver mb-2">Tax Rate (%)</label>
            <input 
              name="taxRate" 
              type="number"
              step="0.01"
              defaultValue={initialData.taxRate} 
              className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-nova-blue transition-colors" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-nova-silver mb-2">Flat Shipping Rate</label>
            <input 
              name="shippingRate" 
              type="number"
              step="0.01"
              defaultValue={initialData.shippingRate} 
              className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-nova-blue transition-colors" 
            />
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-black/80 backdrop-blur-xl border-t border-white/10 flex justify-end items-center gap-4 z-40 lg:ml-64">
        {success && (
          <span className="flex items-center gap-2 text-nova-emerald">
            <CheckCircle2 className="w-5 h-5" /> Settings Saved
          </span>
        )}
        <button 
          type="submit" 
          disabled={isPending}
          className="bg-nova-blue hover:bg-nova-blue/80 text-white px-8 py-3 rounded-xl font-bold transition-colors flex items-center gap-2 disabled:opacity-50 shadow-glow-primary"
        >
          {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          Save Configuration
        </button>
      </div>
    </form>
  );
}
