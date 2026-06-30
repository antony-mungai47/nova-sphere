"use client";

import { useEffect, useState } from "react";
import { Analytics } from "@vercel/analytics/react";

export function NovaAnalytics() {
  const [hasConsented, setHasConsented] = useState(false);

  useEffect(() => {
    const handleConsent = () => setHasConsented(true);
    
    // Check initial consent state
    if (localStorage.getItem("nova_cookie_consent") === "true") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setHasConsented(true);
    }

    // Listen for consent granted event from the CookieConsent component
    window.addEventListener("cookie_consent_accepted", handleConsent);

    return () => {
      window.removeEventListener("cookie_consent_accepted", handleConsent);
    };
  }, []);

  if (!hasConsented) return null;

  return <Analytics />;
}
