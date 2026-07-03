"use client";

import { usePathname } from "next/navigation";
import { PageTransition } from "@/shared/components/animations/page-transition";

export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // We only animate the main content if it's NOT the admin panel, as admin panel has its own layout shell
  const isAdmin = pathname?.startsWith('/admin');

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <PageTransition>
      <div className="flex-1 flex flex-col w-full h-full">
        {children}
      </div>
    </PageTransition>
  );
}
