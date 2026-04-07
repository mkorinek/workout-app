"use client";

import { useEffect } from "react";
import { useAppStore, type ProfileData } from "@/lib/cache/app-store";

/**
 * Invisible component that seeds the Zustand cache with server-fetched data.
 * Place in layouts/pages that do server-side data fetching.
 */
export function CacheSeed({ profile }: { profile: Partial<NonNullable<ProfileData>> | null }) {
  const setCache = useAppStore((s) => s.set);

  useEffect(() => {
    if (profile) {
      setCache("profile", profile);
    }
  }, [profile, setCache]);

  return null;
}
