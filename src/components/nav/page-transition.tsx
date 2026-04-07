"use client";

import { usePathname } from "next/navigation";

/**
 * Re-keys children on route change to trigger CSS fade-in animation.
 * Simple and reliable — no View Transitions API quirks.
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div key={pathname} className="animate-fade-in">
      {children}
    </div>
  );
}
