"use client";

import React from "react";
import { motion } from "framer-motion";
import { useMotionContext } from "./MotionProvider";

export function PageTransition({ children }: { children: React.ReactNode }) {
  const { reducedMotion } = useMotionContext();

  if (reducedMotion) {
    return <>{children}</>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
      transition={{ duration: 0.28, ease: "easeOut" }}
      className="flex-grow flex flex-col"
    >
      {children}
    </motion.div>
  );
}
