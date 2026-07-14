"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

interface SessionState {
  recentlyViewed: string[];
  recentlyCompared: string[];
  recentlySearched: string[];
  recentlyWishlisted: string[];
}

interface SessionContextType extends SessionState {
  addViewedItem: (id: string) => void;
  addComparedItem: (id: string) => void;
  addSearchedTerm: (term: string) => void;
  addWishlistedItem: (id: string) => void;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

const MAX_ITEMS = 10;
const SESSION_KEY = "ns_session_intelligence";

export function SessionTracker({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<SessionState>({
    recentlyViewed: [],
    recentlyCompared: [],
    recentlySearched: [],
    recentlyWishlisted: [],
  });

  // Load from local storage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(SESSION_KEY);
      if (stored) {
        setState(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to load session intelligence");
    }
  }, []);

  // Persist to local storage on state change
  useEffect(() => {
    localStorage.setItem(SESSION_KEY, JSON.stringify(state));
  }, [state]);

  const updateList = (key: keyof SessionState, item: string) => {
    setState((prev) => {
      const list = prev[key].filter((i) => i !== item); // Remove if exists
      return {
        ...prev,
        [key]: [item, ...list].slice(0, MAX_ITEMS), // Add to front, cap at max
      };
    });
  };

  const value: SessionContextType = {
    ...state,
    addViewedItem: (id) => updateList("recentlyViewed", id),
    addComparedItem: (id) => updateList("recentlyCompared", id),
    addSearchedTerm: (term) => updateList("recentlySearched", term),
    addWishlistedItem: (id) => updateList("recentlyWishlisted", id),
  };

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSessionIntelligence() {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error("useSessionIntelligence must be used within a SessionTracker");
  }
  return context;
}
