"use client";

import { useEffect } from "react";
import { useDiscoveryUI } from "./hooks";

export function GlobalCommandPaletteListener() {
  const { toggle, open } = useDiscoveryUI();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+K or Cmd+K
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        toggle();
      }
      
      // "/" key when not focused on an input
      if (e.key === "/" && document.activeElement?.tagName !== "INPUT" && document.activeElement?.tagName !== "TEXTAREA") {
        e.preventDefault();
        open();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggle, open]);

  return null;
}
