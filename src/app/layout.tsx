import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { prisma } from "@/lib/prisma";
import { THEMES, resolveThemeId } from "@/lib/themes";
import { ConnectionStatus } from '@/domains/Realtime/components/ConnectionStatus';
import { RealtimeNotifier } from '@/domains/Realtime/components/RealtimeNotifier';
import { Watermark } from "@/shared/components/ui/watermark";

import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await prisma.storeSettings.findFirst();
  const siteName = settings?.storeName || "NOVA SPHERE";
  const title = settings?.seoTitle || `${siteName} | Premium E-Commerce Marketplace`;
  const description = settings?.seoDescription || settings?.storeDescription || "Experience the future of smart shopping.";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: "https://nova-sphere.com",
      siteName,
      images: [{ url: "/logo.png", width: 800, height: 600 }],
      locale: "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/logo.png"],
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await prisma.storeSettings.findFirst();
  const activeThemeId = resolveThemeId(settings?.theme);
  const activeTheme = THEMES[activeThemeId];

  // Map Clerk appearance to theme
  const clerkAppearance = activeTheme.mode === "dark" ? { baseTheme: dark } as any : undefined;

  return (
    <ClerkProvider appearance={clerkAppearance}>
      <html lang="en" data-theme={activeThemeId} className={`${inter.variable} ${activeTheme.mode}`} style={{ colorScheme: activeTheme.mode }}>
        <head />
        <body className="min-h-full flex flex-col bg-background text-foreground selection:bg-accent selection:text-primary transition-colors duration-300">
          <a href="#main-content" className="skip-to-content focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-50 bg-background text-foreground px-4 py-2 rounded-md shadow-md">
            Skip to content
          </a>
          <Watermark 
            enabled={settings?.watermarkEnabled ?? true} 
            opacity={settings?.watermarkOpacity ?? 0.02} 
            logoUrl={settings?.storeLogo || "/logo.png"} 
          />
          <div id="main-content" className="relative z-10 flex flex-col min-h-screen">
            {children}
            <ConnectionStatus />
            <RealtimeNotifier />
          </div>
        </body>
      </html>
    </ClerkProvider>
  );
}
