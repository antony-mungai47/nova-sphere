"use client";

import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { useMotionContext } from "./MotionProvider";

interface ScrollRevealProps {
  children: React.ReactNode;
  direction?: "up" | "down" | "left" | "right" | "none";
  delay?: number;
  duration?: number;
  className?: string;
}

export function ScrollReveal({ 
  children, 
  direction = "up", 
  delay = 0, 
  duration = 0.45,
  className = ""
}: ScrollRevealProps) {
  const { reducedMotion } = useMotionContext();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-10%" });

  if (reducedMotion) {
    return <div className={className}>{children}</div>;
  }

  const getVariants = () => {
    switch (direction) {
      case "up": return { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } };
      case "down": return { hidden: { opacity: 0, y: -30 }, visible: { opacity: 1, y: 0 } };
      case "left": return { hidden: { opacity: 0, x: 30 }, visible: { opacity: 1, x: 0 } };
      case "right": return { hidden: { opacity: 0, x: -30 }, visible: { opacity: 1, x: 0 } };
      case "none": return { hidden: { opacity: 0 }, visible: { opacity: 1 } };
      default: return { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } };
    }
  };

  return (
    <motion.div
      ref={ref}
      variants={getVariants()}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      transition={{ duration, delay, ease: [0.175, 0.885, 0.32, 1.275] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
