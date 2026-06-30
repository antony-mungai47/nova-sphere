/**
 * Nova Sphere — Unified Motion System
 * 
 * Every animation in the platform references a preset from this file.
 * No component may define its own duration, easing, or variant inline.
 * 
 * Usage:
 *   import { MOTION } from "@/lib/motion";
 *   <motion.div variants={MOTION.fadeUp} initial="hidden" animate="visible" />
 *   <motion.div whileHover={MOTION.hover} whileTap={MOTION.press} />
 */

import { type Variants } from "framer-motion";

// ================================================================
// TIMING CONSTANTS (mirror CSS --duration-* tokens)
// ================================================================
export const TIMING = {
  instant: 0.1,
  fast: 0.15,
  base: 0.25,
  slow: 0.4,
  page: 0.6,
  cinematic: 1.2,
} as const;

// ================================================================
// EASING CONSTANTS (mirror CSS --ease-* tokens)
// ================================================================
export const EASING = {
  default: [0.4, 0, 0.2, 1] as const,
  in: [0.4, 0, 1, 1] as const,
  out: [0, 0, 0.2, 1] as const,
  spring: [0.34, 1.56, 0.64, 1] as const,
  smooth: [0.22, 1, 0.36, 1] as const,
} as const;

// ================================================================
// SPRING CONFIGS
// ================================================================
export const SPRING = {
  snappy: { type: "spring" as const, stiffness: 400, damping: 40 },
  gentle: { type: "spring" as const, stiffness: 260, damping: 30 },
  bouncy: { type: "spring" as const, stiffness: 300, damping: 20 },
} as const;

// ================================================================
// MOTION PRESETS
// ================================================================
export const MOTION = {
  // --- Entrance Variants ---
  fadeIn: {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: TIMING.base, ease: EASING.out } },
  } satisfies Variants,

  fadeUp: {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: TIMING.slow, ease: EASING.smooth } },
  } satisfies Variants,

  fadeDown: {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0, transition: { duration: TIMING.slow, ease: EASING.smooth } },
  } satisfies Variants,

  fadeLeft: {
    hidden: { opacity: 0, x: -30 },
    visible: { opacity: 1, x: 0, transition: { duration: TIMING.slow, ease: EASING.smooth } },
  } satisfies Variants,

  fadeRight: {
    hidden: { opacity: 0, x: 30 },
    visible: { opacity: 1, x: 0, transition: { duration: TIMING.slow, ease: EASING.smooth } },
  } satisfies Variants,

  scaleIn: {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: TIMING.base, ease: EASING.spring } },
  } satisfies Variants,

  // --- Interactive ---
  hover: { scale: 1.02, transition: { duration: TIMING.fast, ease: EASING.out } },
  press: { scale: 0.98, transition: { duration: TIMING.instant, ease: EASING.in } },

  // --- Card ---
  card: {
    rest: {
      scale: 1,
      y: 0,
      filter: "brightness(1)",
      transition: { duration: TIMING.base, ease: EASING.out },
    },
    hover: {
      scale: 1.02,
      y: -4,
      filter: "brightness(1.05)",
      transition: { duration: TIMING.slow, ease: EASING.smooth },
    },
    tap: {
      scale: 0.98,
      y: 0,
      transition: { duration: TIMING.instant, ease: EASING.in },
    },
  } satisfies Variants,

  // --- Containers ---
  stagger: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  } satisfies Variants,

  staggerFast: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05 },
    },
  } satisfies Variants,

  // --- Layout ---
  page: {
    initial: { opacity: 0, y: 12, filter: "blur(4px)" },
    animate: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: TIMING.page, ease: EASING.smooth } },
    exit: { opacity: 0, y: -8, filter: "blur(4px)", transition: { duration: TIMING.base, ease: EASING.in } },
  } satisfies Variants,

  modal: {
    hidden: { opacity: 0, scale: 0.95, y: 20 },
    visible: { opacity: 1, scale: 1, y: 0, transition: SPRING.snappy },
    exit: { opacity: 0, scale: 0.95, y: 20, transition: { duration: TIMING.fast, ease: EASING.in } },
  } satisfies Variants,

  drawer: {
    hidden: { x: "100%", opacity: 0 },
    visible: { x: "0%", opacity: 1, transition: SPRING.snappy },
    exit: { x: "100%", opacity: 0, transition: { duration: TIMING.fast, ease: EASING.in } },
  } satisfies Variants,

  dropdown: {
    hidden: { opacity: 0, y: -8, scale: 0.96 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: TIMING.fast, ease: EASING.spring } },
    exit: { opacity: 0, y: -8, scale: 0.96, transition: { duration: TIMING.instant, ease: EASING.in } },
  } satisfies Variants,

  // --- Cinematic ---
  ticker: {
    animate: {
      x: ["0%", "-50%"],
      transition: {
        x: { repeat: Infinity, repeatType: "loop", duration: 120, ease: "linear" },
      },
    },
  } satisfies Variants,

  showcase: {
    hidden: { x: 0 },
    show: (width: number) => ({
      x: -width,
      transition: { duration: 120, ease: "linear", repeat: Infinity, repeatType: "reverse" as const },
    }),
  },

  marquee: {
    animate: {
      x: ["0%", "-33.333333%"],
      transition: { ease: "linear", duration: 120, repeat: Infinity },
    },
  },
} as const;

// ================================================================
// LEGACY EXPORTS (for backward compatibility during migration)
// Will be removed after Sub-Phase 4.4 completes.
// ================================================================
export const slideIn = (direction: "up" | "down" | "left" | "right", type: string, delay: number, duration: number) => ({
  hidden: {
    x: direction === "left" ? "-100%" : direction === "right" ? "100%" : 0,
    y: direction === "up" ? "100%" : direction === "down" ? "-100%" : 0,
  },
  show: {
    x: 0, y: 0,
    transition: { type, delay, duration, ease: "easeOut" },
  },
});

export const staggerContainer = (staggerChildren: number, delayChildren?: number) => ({
  hidden: {},
  show: { transition: { staggerChildren, delayChildren: delayChildren || 0 } },
});

export const fadeIn = (direction: "up" | "down" | "left" | "right" | "none", type: string, delay: number, duration: number) => ({
  hidden: {
    x: direction === "left" ? 100 : direction === "right" ? -100 : 0,
    y: direction === "up" ? 100 : direction === "down" ? -100 : 0,
    opacity: 0,
  },
  show: {
    x: 0, y: 0, opacity: 1,
    transition: { type, delay, duration, ease: "easeOut" },
  },
});

export const superSlowSlide: any = MOTION.showcase;
export const superSlowMarquee: any = MOTION.marquee;

// Legacy named exports from animations.ts
export const FADE_IN = MOTION.fadeIn;
export const FADE_UP = MOTION.fadeUp;
export const STAGGER_CONTAINER = MOTION.stagger;
export const CARD_HOVER = MOTION.card;
export const PAGE_TRANSITION = MOTION.page;
export const TICKER_MOTION = MOTION.ticker;
export const DRAWER_MOTION = MOTION.drawer;
export const MODAL_MOTION = MOTION.modal;
