import React from "react";
import { prisma } from "@/lib/prisma";
import { SettingsForm } from "./settings-form";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  // Fetch existing settings or use default
  let settings = await prisma.storeSettings.findFirst();
  
  if (!settings) {
    settings = await prisma.storeSettings.create({
      data: {
        storeName: "Nova Sphere",
        currency: "USD",
        theme: "dark",
      }
    });
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-white mb-2">Store Settings</h1>
      <p className="text-nova-silver mb-8">Manage your global store configuration, branding, and preferences.</p>
      
      <SettingsForm initialData={settings} />
    </div>
  );
}
