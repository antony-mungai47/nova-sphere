"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Experience } from "../engine/ExperienceResolver";
import { PersonalizationContext, RankedProduct } from "../engine/types";
import { ProductRankingData } from "../engine/RankingEngine";
import { useSignals } from "../../signals/sdk/hooks";
import { useAuth } from "@clerk/nextjs";

interface ExperienceContextType {
  context: PersonalizationContext | null;
  rankProducts: (products: ProductRankingData[]) => RankedProduct[];
  trackExperienceEvent: (eventName: string, payload?: any) => void;
}

const Context = createContext<ExperienceContextType | undefined>(undefined);

export function ExperienceProvider({ children }: { children: ReactNode }) {
  const [context, setContext] = useState<PersonalizationContext | null>(null);
  const { track } = useSignals();
  const { userId, sessionId } = useAuth();
  
  const identifier = userId || sessionId || "anon_" + Math.random().toString(36);

  useEffect(() => {
    // In a real app we would pass actual recent signals from the store or DB
    Experience.resolve(identifier, []).then(resolved => {
      setContext(resolved);
      track("segment.changed", "ai_training", { affinities: resolved.affinities }, false);
    });
  }, [identifier, track]);

  const value: ExperienceContextType = {
    context,
    rankProducts: (products) => {
      if (!context) return products.map(p => ({ id: p.id, rankScore: 0 }));
      return Experience.getRankingEngine().rank(products, context.affinities);
    },
    trackExperienceEvent: (eventName, payload = {}) => {
      track(eventName as any, "ai_training", payload, true);
    }
  };

  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function useExperience() {
  const ctx = useContext(Context);
  if (!ctx) throw new Error("useExperience must be used within an ExperienceProvider");
  return ctx;
}
