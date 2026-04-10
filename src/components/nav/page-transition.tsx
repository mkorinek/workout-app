"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

// Tab order for direction detection
const TAB_ORDER = ["/workouts", "/templates", "/exercises", "/progress", "/social"];

function getTabIndex(pathname: string): number {
  return TAB_ORDER.findIndex((tab) => pathname.startsWith(tab));
}

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const prevPathname = useRef(pathname);

  // ── Direction-aware view transition on route change ──
  useEffect(() => {
    if (pathname === prevPathname.current) return;

    const prevIdx = getTabIndex(prevPathname.current);
    const nextIdx = getTabIndex(pathname);

    const direction =
      prevIdx >= 0 && nextIdx >= 0
        ? nextIdx > prevIdx ? "forward" : "back"
        : "forward";

    document.documentElement.dataset.vtDirection = direction;

    if ("startViewTransition" in document) {
      (document as unknown as { startViewTransition: (cb: () => void) => void })
        .startViewTransition(() => {
          prevPathname.current = pathname;
        });
    } else {
      prevPathname.current = pathname;
    }
  }, [pathname]);

  return <>{children}</>;
}
