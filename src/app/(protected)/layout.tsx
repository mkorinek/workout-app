import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { BottomNav } from "@/components/nav/bottom-nav";
import { RankBadge } from "@/components/achievements/rank-badge";
import { StreakBadge } from "@/components/achievements/streak-badge";
import { SyncIndicator } from "@/components/nav/sync-indicator";
import { ThemeToggle } from "@/components/theme-toggle";
import { ToastProvider } from "@/components/ui/toast";
import { computeDisplayStreak } from "@/lib/streak";
import { CacheSeed } from "@/components/cache/cache-seed";
import { AccentSeed } from "@/components/accent-provider";
import { PageTransition } from "@/components/nav/page-transition";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  // Use getSession() instead of getUser() — middleware already verified auth
  // via getUser(). getSession() reads the JWT from cookies (no HTTP round-trip).
  const { data: { session } } = await supabase.auth.getSession();

  if (!session?.user) redirect("/login");
  const user = session.user;

  const { data: profile } = await supabase
    .from("profiles")
    .select("lifter_rank, weekly_workout_goal, current_week_streak, streak_last_completed_week, week_start_day, display_name, accent_color")
    .eq("id", user.id)
    .single();

  const rank = profile?.lifter_rank ?? "ROOKIE";
  const hasStreakGoal = !!profile?.weekly_workout_goal;
  const streak = hasStreakGoal
    ? computeDisplayStreak(
        profile.current_week_streak ?? 0,
        profile.streak_last_completed_week ?? null,
        profile.week_start_day ?? 1
      )
    : 0;

  return (
    <ToastProvider>
      <CacheSeed profile={profile} />
      <AccentSeed index={profile?.accent_color ?? 0} />
      <div id="app-shell" className="flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="px-4 py-3 flex items-center justify-between shrink-0 nav-glass">
          <div className="flex items-center gap-2">
            <RankBadge rank={rank} />
            {hasStreakGoal && <StreakBadge streak={streak} />}
          </div>
          <div className="flex items-center gap-3">
            <SyncIndicator />
            <span className="text-xs text-text-muted">
              {profile?.display_name ?? "user"}
            </span>
            <ThemeToggle />
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto pb-24">
          <PageTransition>{children}</PageTransition>
        </main>

        {/* Bottom nav */}
        <BottomNav />
      </div>
    </ToastProvider>
  );
}
