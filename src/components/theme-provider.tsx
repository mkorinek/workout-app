"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { AccentProvider } from "@/components/accent-provider";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="dark" enableSystem>
      <AccentProvider>{children}</AccentProvider>
    </NextThemesProvider>
  );
}
