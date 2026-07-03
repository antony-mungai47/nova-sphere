export const motionTokens = {
  duration: {
    instant: 0.1,  // 100ms
    fast: 0.15,    // 150ms
    normal: 0.25,  // 250ms
    slow: 0.4,     // 400ms
    luxury: 0.6,   // 600ms
  },
  easing: {
    standard: [0.4, 0.0, 0.2, 1], // material standard
    enter: [0.0, 0.0, 0.2, 1],    // deceleration
    exit: [0.4, 0.0, 1, 1],       // acceleration
    elastic: [0.68, -0.55, 0.265, 1.55], // overshoot
    spring: {
      type: "spring",
      stiffness: 400,
      damping: 30,
      mass: 1,
    }
  },
  distance: {
    small: 8,
    medium: 16,
    large: 32,
  },
  scale: {
    hover: 1.02,
    pressed: 0.98,
    focus: 1.05
  },
  opacity: {
    hidden: 0,
    visible: 1,
    disabled: 0.5,
    muted: 0.7
  }
} as const;
