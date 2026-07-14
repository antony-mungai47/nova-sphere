"use client";

import React from "react";
import { AnimatedGradient } from "@/components/motion/AnimatedGradient";
import { CampaignTheme } from "@/domains/Experience/engines/CampaignEngine";

export function HeroBackground({ theme = "default" }: { theme?: CampaignTheme }) {
  // Select colors based on theme
  const colors = {
    "default": ["#2563EB", "#EC4899", "#10B981"],
    "black-friday": ["#1A1A1A", "#333333", "#FACC15"],
    "christmas": ["#DC2626", "#16A34A", "#F8FAFC"],
    "valentines": ["#E11D48", "#FDA4AF", "#FCE7F3"],
    "cyber-monday": ["#4F46E5", "#06B6D4", "#10B981"],
  }[theme] || ["#2563EB", "#EC4899", "#10B981"];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      <AnimatedGradient colors={colors} speed={15} className="opacity-40 mix-blend-multiply" />
      {/* Soft glass overlay to mute the gradients slightly */}
      <div className="absolute inset-0 bg-background/30 backdrop-blur-[60px]" />
    </div>
  );
}
