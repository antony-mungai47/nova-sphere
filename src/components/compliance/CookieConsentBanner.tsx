"use client";

import { useEffect, useState } from "react";

export function CookieConsentBanner() {
  const [show, setShow] = useState(() => {
    if (typeof window === "undefined") return false;
    const consent = localStorage.getItem("nova_cookie_consent");
    return !consent;
  });

  const handleAccept = () => {
    localStorage.setItem("nova_cookie_consent", "accepted");
    setShow(false);
    window.location.reload();
  };

  const handleDecline = () => {
    localStorage.setItem("nova_cookie_consent", "declined");
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-nova-black/95 backdrop-blur-md border-t border-nova-slate/30 p-6 z-[100] shadow-2xl flex flex-col md:flex-row items-center justify-between gap-4">
      <div className="text-sm text-nova-silver max-w-3xl">
        <p>
          <strong className="text-white">We value your privacy.</strong> We use essential cookies to make our site work. With your consent, we may also use non-essential cookies to improve user experience and analyze website traffic via PostHog.
          By clicking "Accept All", you agree to our website's cookie use as described in our <a href="/policies/privacy" className="text-nova-blue hover:underline">Privacy Policy</a>.
        </p>
      </div>
      <div className="flex gap-4 shrink-0">
        <button 
          onClick={handleDecline}
          className="px-6 py-2 rounded-lg border border-nova-slate/50 text-white hover:bg-nova-slate/20 transition-colors text-sm"
        >
          Decline Non-Essential
        </button>
        <button 
          onClick={handleAccept}
          className="px-6 py-2 rounded-lg bg-nova-blue text-white font-semibold shadow-lg hover:shadow-nova-blue/20 transition-all text-sm"
        >
          Accept All
        </button>
      </div>
    </div>
  );
}
