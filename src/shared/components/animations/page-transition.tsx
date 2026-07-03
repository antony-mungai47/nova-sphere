"use client";

import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import { useSafeMotion } from "@/lib/design-system/motion";
import { motionVariants } from "@/lib/design-system/motion";

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { shouldReduceMotion } = useSafeMotion();

  // If the user prefers reduced motion, we still render the AnimatePresence for component unmounting,
  // but we apply an instantaneous transition (or basic fade) which is handled by the tokens/hooks.
  // Wait, routeTransition variant in variants.ts handles fade + slight y movement.
  // If we want to respect reduced motion, we should use safeVariants.
  const { safeVariants } = useSafeMotion();
  
  const variants = safeVariants(motionVariants.routeTransition);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial="hidden"
        animate="visible"
        exit="exit"
        variants={variants}
        className="w-full h-full"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
