"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/workouts", label: "LOG", icon: ">" },
  { href: "/templates", label: "TPL", icon: "#" },
  { href: "/exercises", label: "EX", icon: "+" },
  { href: "/progress", label: "PRG", icon: "~" },
  { href: "/profile", label: "USR", icon: "@" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 border-t border-term-gray bg-term-black z-50">
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {NAV_ITEMS.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center py-3 px-2 text-[10px] uppercase tracking-widest transition-colors",
                active
                  ? "text-term-green"
                  : "text-term-gray-light hover:text-term-white"
              )}
            >
              <span className="text-base mb-0.5 font-bold">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
