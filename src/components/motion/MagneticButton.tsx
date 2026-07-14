"use client";

import React, { useRef, useState } from "react";
import { motion } from "framer-motion";
import { useMotionContext } from "./MotionProvider";

interface MagneticButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
  strength?: number;
}

export function MagneticButton({ 
  children, 
  className = "", 
  strength = 30,
  ...props 
}: MagneticButtonProps) {
  const { reducedMotion } = useMotionContext();
  const ref = useRef<HTMLButtonElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouse = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (reducedMotion || !ref.current) return;
    
    const { clientX, clientY } = e;
    const { height, width, left, top } = ref.current.getBoundingClientRect();
    const middleX = clientX - (left + width / 2);
    const middleY = clientY - (top + height / 2);
    
    setPosition({ x: middleX * (strength / 100), y: middleY * (strength / 100) });
  };

  const reset = () => {
    setPosition({ x: 0, y: 0 });
  };

  return (
    <motion.button
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={reset}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
      className={className}
      {...props}
    >
      {children}
    </motion.button>
  );
}
