"use client";

import React, { createContext, useContext, useEffect, ReactNode } from "react";
import { Telemetry } from "../SignalsEngine";
import { EventName, SignalCategory, SignalPayload } from "../types";
import { RuntimeGate } from "@/lib/observability/assertions";

interface SignalsContextType {
  track: (eventName: EventName, category: SignalCategory, payload?: SignalPayload, isImmediate?: boolean) => void;
  identify: (userId: string) => void;
}

export const SignalsContext = createContext<SignalsContextType | undefined>(undefined);

export function SignalsProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    const traceId = 'client_global_session';
    RuntimeGate.registerProviderMount('SignalsProvider', traceId, 'SignalsProvider');
    return () => {
      RuntimeGate.registerProviderUnmount('SignalsProvider', traceId);
    };
  }, []);

  // We can expose the global Telemetry singleton instance here for React land.
  
  const value: SignalsContextType = {
    track: (eventName, category, payload = {}, isImmediate = false) => {
      Telemetry.track(eventName, category, payload, isImmediate);
    },
    identify: (userId: string) => {
      Telemetry.identify(userId);
    }
  };

  return (
    <SignalsContext.Provider value={value}>
      {children}
    </SignalsContext.Provider>
  );
}

export function useSignals() {
  const context = useContext(SignalsContext);
  if (context === undefined) {
    throw new Error("useSignals must be used within a SignalsProvider");
  }
  return context;
}
