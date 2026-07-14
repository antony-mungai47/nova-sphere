"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { MotionConfig } from "framer-motion";

interface MotionContextType {
  reducedMotion: boolean;
}

const MotionContext = createContext<MotionContextType>({ reducedMotion: false });

export function useMotionContext() {
  return useContext(MotionContext);
}

export function MotionProvider({ children }: { children: React.ReactNode }) {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mediaQuery.matches);

    const listener = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mediaQuery.addEventListener("change", listener);
    return () => mediaQuery.removeEventListener("change", listener);
  }, []);

  return (
    <MotionContext.Provider value={{ reducedMotion }}>
      <MotionConfig transition={{ type: "spring", bounce: 0.1, duration: 0.28 }}>
        {children}
      </MotionConfig>
    </MotionContext.Provider>
  );
}
