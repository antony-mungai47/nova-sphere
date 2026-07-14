"use client";

import React from "react";
import { motion } from "framer-motion";
import { useMotionContext } from "./MotionProvider";

interface AnimatedGradientProps {
  className?: string;
  colors?: string[];
  speed?: number;
}

export function AnimatedGradient({ 
  className = "", 
  colors = ["#2563EB", "#EC4899", "#10B981"],
  speed = 10 
}: AnimatedGradientProps) {
  const { reducedMotion } = useMotionContext();

  if (reducedMotion) {
    return (
      <div 
        className={`absolute inset-0 opacity-20 ${className}`} 
        style={{ background: `linear-gradient(45deg, ${colors.join(', ')})` }} 
      />
    );
  }

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {colors.map((color, i) => (
        <motion.div
          key={i}
          className="absolute w-[600px] h-[600px] rounded-full mix-blend-multiply opacity-30 filter blur-[100px] will-change-transform"
          style={{
            background: color,
            left: `${(i * 30) % 100}%`,
            top: `${(i * 20) % 100}%`,
          }}
          animate={{
            x: ["0%", "50%", "-20%", "0%"],
            y: ["0%", "-30%", "20%", "0%"],
            scale: [1, 1.2, 0.8, 1],
          }}
          transition={{
            duration: speed + i * 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}
