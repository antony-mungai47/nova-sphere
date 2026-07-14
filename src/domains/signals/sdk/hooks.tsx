"use client";

import React, { createContext, useContext, useEffect, ReactNode } from "react";
import { Telemetry } from "../SignalsEngine";
import { EventName, SignalCategory, SignalPayload } from "../types";

interface SignalsContextType {
  track: (eventName: EventName, category: SignalCategory, payload?: SignalPayload, isImmediate?: boolean) => void;
  identify: (userId: string) => void;
}

const SignalsContext = createContext<SignalsContextType | undefined>(undefined);

export function SignalsProvider({ children }: { children: ReactNode }) {
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
    // Graceful fallback if not wrapped in provider (e.g. some isolated component tests)
    return {
      track: (eventName: EventName, category: SignalCategory, payload: SignalPayload = {}, isImmediate = false) => {
        Telemetry.track(eventName, category, payload, isImmediate);
      },
      identify: (userId: string) => Telemetry.identify(userId)
    };
  }
  return context;
}
