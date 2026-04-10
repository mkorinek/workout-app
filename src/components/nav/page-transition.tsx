"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

// Tab order for direction detection + swipe navigation
const TAB_ORDER = ["/workouts", "/templates", "/exercises", "/progress", "/social"];

function getTabIndex(pathname: string): number {
  return TAB_ORDER.findIndex((tab) => pathname.startsWith(tab));
}

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
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

  // ── Swipe gestures — native listeners on the main scroll container ──
  useEffect(() => {
    // Find the scrollable <main> parent
    const main = document.querySelector("main");
    if (!main) return;

    let startX = 0;
    let startY = 0;
    let swiping = false;

    function onTouchStart(e: TouchEvent) {
      const t = e.touches[0];
      startX = t.clientX;
      startY = t.clientY;
      swiping = false;
    }

    function onTouchMove(e: TouchEvent) {
      if (swiping) return;
      const t = e.touches[0];
      const dx = t.clientX - startX;
      const dy = t.clientY - startY;

      // Once we've moved enough, decide if it's a swipe
      if (Math.abs(dx) > 30 || Math.abs(dy) > 30) {
        // If mostly vertical, abort — let scroll work
        if (Math.abs(dy) > Math.abs(dx) * 0.7) {
          startX = 0; // disable further checks
          return;
        }
        // It's horizontal enough — mark as swiping
        swiping = true;
      }
    }

    function onTouchEnd(e: TouchEvent) {
      if (!swiping) return;

      const t = e.changedTouches[0];
      const dx = t.clientX - startX;

      if (Math.abs(dx) < 50) return;

      const currentIdx = getTabIndex(window.location.pathname);
      if (currentIdx < 0) return;

      const targetIdx = dx < 0 ? currentIdx + 1 : currentIdx - 1;

      if (targetIdx >= 0 && targetIdx < TAB_ORDER.length) {
        router.push(TAB_ORDER[targetIdx]);
      }
    }

    main.addEventListener("touchstart", onTouchStart, { passive: true });
    main.addEventListener("touchmove", onTouchMove, { passive: true });
    main.addEventListener("touchend", onTouchEnd, { passive: true });

    return () => {
      main.removeEventListener("touchstart", onTouchStart);
      main.removeEventListener("touchmove", onTouchMove);
      main.removeEventListener("touchend", onTouchEnd);
    };
  }, [router]);

  return <>{children}</>;
}
