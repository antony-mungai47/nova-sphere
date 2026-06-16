import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { prisma } from "@/lib/prisma";

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

import { Watermark } from "@/components/ui/watermark";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await prisma.storeSettings.findFirst();

  return (
    <ClerkProvider>
      <html lang="en" className={`${inter.variable} dark`} style={{ colorScheme: 'dark' }}>
        <head>
          {settings && (
            <style dangerouslySetInnerHTML={{
              __html: `
                :root {
                  --color-primary: ${settings.primaryColor || '#3B82F6'};
                  --color-secondary: ${settings.secondaryColor || '#10B981'};
                  --color-accent: ${settings.accentColor || '#D4A017'};
                }
              `
            }} />
          )}
        </head>
        <body className="min-h-full flex flex-col bg-background text-foreground selection:bg-nova-blue selection:text-white">
          <Watermark 
            enabled={settings?.watermarkEnabled ?? true} 
            opacity={settings?.watermarkOpacity ?? 0.06} 
            logoUrl={settings?.storeLogo || "/logo.png"} 
          />
          <div className="relative z-10 flex flex-col min-h-screen">
            {children}
          </div>
        </body>
      </html>
    </ClerkProvider>
  );
}
