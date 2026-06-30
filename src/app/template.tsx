"use client";

import { motion } from "framer-motion";
import { PAGE_TRANSITION } from "@/lib/animations";
import { usePathname } from "next/navigation";

export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // We only animate the main content if it's NOT the admin panel, as admin panel has its own layout shell
  const isAdmin = pathname?.startsWith('/admin');

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <motion.div
      key={pathname}
      variants={PAGE_TRANSITION}
      initial="initial"
      animate="animate"
      exit="exit"
      className="flex-1 flex flex-col w-full h-full transform-gpu"
    >
      {children}
    </motion.div>
  );
}
