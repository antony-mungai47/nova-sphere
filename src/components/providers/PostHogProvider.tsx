"use client";

import posthog from 'posthog-js';
import { PostHogProvider as PHProvider } from 'posthog-js/react';
import { useEffect, useState } from 'react';

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  const [isConsentGranted] = useState(() => {
    if (typeof window === "undefined") return false;
    const consent = localStorage.getItem('nova_cookie_consent');
    return consent === 'accepted';
  });

  // Initialize PostHog if consent granted
  useEffect(() => {
    if (!isConsentGranted) return;
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY || 'phc_placeholder_key', {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com',
      person_profiles: 'identified_only',
      capture_pageview: false, // We will capture this manually
    });
  }, [isConsentGranted]);

  if (!isConsentGranted) {
    // If no consent, just return children without PH context
    return <>{children}</>;
  }

  return <PHProvider client={posthog}>{children}</PHProvider>;
}
