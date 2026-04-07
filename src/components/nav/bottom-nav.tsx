"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { DumbbellIcon, LayoutIcon, ListIcon, ActivityIcon, UserIcon } from "@/components/icons";

const NAV_ITEMS = [
  { href: "/workouts", label: "Log", icon: DumbbellIcon },
  { href: "/templates", label: "Templates", icon: LayoutIcon },
  { href: "/exercises", label: "Exercises", icon: ListIcon },
  { href: "/progress", label: "Progress", icon: ActivityIcon },
  { href: "/profile", label: "Profile", icon: UserIcon },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 px-3 pb-3">
      <div className="flex items-center justify-around max-w-lg mx-auto nav-glass rounded-lg">
        {NAV_ITEMS.map((item) => {
          const active = pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center py-2.5 px-3 text-[11px] font-medium transition-all gap-1 rounded-md my-1.5",
                active
                  ? "text-accent bg-accent/10"
                  : "text-text-muted hover:text-text-secondary"
              )}
            >
              <Icon size={22} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
