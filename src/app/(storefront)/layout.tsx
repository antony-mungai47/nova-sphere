import React from "react";
import { PulseProvider } from "@/domains/Experience/components/pulse/PulseEngine";
import { FlyToCartProvider } from "@/components/motion/FlyToCartEngine";
import { SessionTracker } from "@/domains/Experience/components/conversion/SessionTracker";
import { SignalsProvider } from "@/domains/signals/sdk/hooks";
import { ExperienceProvider } from "@/domains/personalization/sdk/hooks";
import { ConnectionStatus } from '@/domains/Realtime/components/ConnectionStatus';
import { RealtimeNotifier } from '@/domains/Realtime/components/RealtimeNotifier';
import { RealtimeToaster } from "@/domains/Engagement/Notifications/components/RealtimeToaster";
import { LiveSupportWidget } from "@/components/LiveSupportWidget";
import { MobileFAB } from "@/shared/components/layout/MobileFAB";
import { getFeatureFlag } from "@/domains/Foundation/feature-flags/actions";
import { FeatureFlags } from "@/domains/Foundation/feature-flags/flags";
import { auth } from "@clerk/nextjs/server";
import { Telemetry, EventType } from "@/lib/observability/Telemetry";
import { getTraceContext } from "@/lib/observability/TraceContext";

export default async function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();
  const liveNotificationsEnabled = await getFeatureFlag(FeatureFlags.LIVE_NOTIFICATIONS);

  const { traceId, spanId } = await getTraceContext();
  Telemetry.record({
    layer: 'Presentation',
    type: EventType.LayoutMounted,
    source: 'StorefrontLayout',
    traceId,
    spanId,
    userId: userId || undefined
  });

  return (
    <SignalsProvider>
      <ExperienceProvider>
        <PulseProvider>
          <SessionTracker>
            <FlyToCartProvider>
              {children}
              
              {/* Storefront Overlays */}
              <ConnectionStatus />
              <RealtimeNotifier />
              <RealtimeToaster userId={userId} enabled={liveNotificationsEnabled} />
              <LiveSupportWidget />
              <MobileFAB />
            </FlyToCartProvider>
          </SessionTracker>
        </PulseProvider>
      </ExperienceProvider>
    </SignalsProvider>
  );
}
