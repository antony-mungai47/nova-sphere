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
    metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
    title: {
      default: title,
      template: `%s | ${siteName}`,
    },
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

import { auth } from "@clerk/nextjs/server";
import { RealtimeToaster } from "@/domains/Engagement/Notifications/components/RealtimeToaster";
import { getFeatureFlag } from "@/domains/Foundation/feature-flags/actions";
import { FeatureFlags } from "@/domains/Foundation/feature-flags/flags";
import { LiveSupportWidget } from "@/components/LiveSupportWidget";
import { ScriptLoader } from "@/shared/components/layout/script-loader";
import { PostHogProvider } from "@/components/providers/PostHogProvider";
import { CookieConsentBanner } from "@/components/compliance/CookieConsentBanner";
import { MobileFAB } from "@/shared/components/layout/MobileFAB";
import { MotionProvider } from "@/components/motion/MotionProvider";
import { PulseProvider } from "@/domains/Experience/components/pulse/PulseEngine";
import { PulseUI } from "@/domains/Experience/components/pulse/PulseUI";
import { FlyToCartProvider } from "@/components/motion/FlyToCartEngine";
import { SessionTracker } from "@/domains/Experience/components/conversion/SessionTracker";
import { ExitIntentObserver } from "@/domains/Experience/components/conversion/ExitIntentObserver";
import { SignalsProvider } from "@/domains/signals/sdk/hooks";
import { GlobalCommandPaletteListener } from "@/domains/discovery/sdk/CommandPaletteListener";
import { DiscoveryTakeover } from "@/domains/discovery/ui/DiscoveryTakeover";
import { ExperienceProvider } from "@/domains/personalization/sdk/hooks";

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

  const { userId } = await auth();
  const liveNotificationsEnabled = await getFeatureFlag(FeatureFlags.LIVE_NOTIFICATIONS);

  return (
    <ClerkProvider appearance={clerkAppearance}>
      <html lang="en" data-theme={activeThemeId} className={`${inter.variable} ${activeTheme.mode}`} style={{ colorScheme: activeTheme.mode }}>
        <head />
        <body className="min-h-full flex flex-col bg-background text-foreground selection:bg-accent selection:text-primary transition-colors duration-300">
          <PostHogProvider>
            <SignalsProvider>
              <ExperienceProvider>
                <MotionProvider>
                <PulseProvider>
                  <SessionTracker>
                    <FlyToCartProvider>
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
                        <RealtimeToaster userId={userId} enabled={liveNotificationsEnabled} />
                        <LiveSupportWidget />
                      </div>
                      <MobileFAB />
                      <PulseUI />
                      <ScriptLoader />
                      <GlobalCommandPaletteListener />
                      <DiscoveryTakeover />
                      <CookieConsentBanner />
                      <ExitIntentObserver />
                    </FlyToCartProvider>
                  </SessionTracker>
                </PulseProvider>
                </MotionProvider>
              </ExperienceProvider>
            </SignalsProvider>
          </PostHogProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
