"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    __NS_DIAGNOSTICS__: {
      providers: Record<string, number>;
      websockets: number;
      analyticsQueue: number;
      mountedLayouts: string[];
      trackProviderMount: (name: string) => void;
      trackProviderUnmount: (name: string) => void;
      trackLayoutMount: (name: string) => void;
      trackLayoutUnmount: (name: string) => void;
    };
  }
}

/**
 * TEMPORARY DIAGNOSTICS - DO NOT MERGE TO PRODUCTION
 * Used during U2 migration to instantly visualize runtime ownership
 * and prevent duplicate websocket connections or provider mounts.
 */
export function RuntimeDiagnostics() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    if (!window.__NS_DIAGNOSTICS__) {
      window.__NS_DIAGNOSTICS__ = {
        providers: {},
        websockets: 0,
        analyticsQueue: 0,
        mountedLayouts: [],
        trackProviderMount: (name) => {
          window.__NS_DIAGNOSTICS__.providers[name] = 
            (window.__NS_DIAGNOSTICS__.providers[name] || 0) + 1;
        },
        trackProviderUnmount: (name) => {
          window.__NS_DIAGNOSTICS__.providers[name] = 
            Math.max(0, (window.__NS_DIAGNOSTICS__.providers[name] || 0) - 1);
        },
        trackLayoutMount: (name) => {
          if (!window.__NS_DIAGNOSTICS__.mountedLayouts.includes(name)) {
            window.__NS_DIAGNOSTICS__.mountedLayouts.push(name);
          }
        },
        trackLayoutUnmount: (name) => {
          window.__NS_DIAGNOSTICS__.mountedLayouts = 
            window.__NS_DIAGNOSTICS__.mountedLayouts.filter(l => l !== name);
        }
      };
    }
  }, []);

  return null;
}
