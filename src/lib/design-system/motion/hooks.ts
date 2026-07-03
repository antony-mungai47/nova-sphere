import { useReducedMotion } from 'framer-motion';

export function useSafeMotion() {
  const shouldReduceMotion = useReducedMotion();
  
  return {
    shouldReduceMotion,
    // Provide a helper to conditionally apply variants
    safeVariants: (variants: any) => {
      if (shouldReduceMotion) {
        // Return a simplified version that just toggles opacity without movement
        return {
          hidden: { opacity: 0 },
          visible: { opacity: 1 },
          exit: { opacity: 0 }
        };
      }
      return variants;
    }
  };
}
