import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { BottomNav } from "@/components/nav/bottom-nav";
import { RankBadge } from "@/components/achievements/rank-badge";
import { StreakBadge } from "@/components/achievements/streak-badge";
import { SyncIndicator } from "@/components/nav/sync-indicator";
import { ToastProvider } from "@/components/ui/toast";
import { computeDisplayStreak } from "@/lib/streak";
import { CacheSeed } from "@/components/cache/cache-seed";
import { AccentSeed } from "@/components/accent-provider";
import { PageTransition } from "@/components/nav/page-transition";
import Link from "next/link";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select(
      "lifter_rank, weekly_workout_goal, current_week_streak, streak_last_completed_week, week_start_day, display_name, accent_color",
    )
    .eq("id", user.id)
    .single();

  const rank = profile?.lifter_rank ?? "ROOKIE";
  const hasStreakGoal = !!profile?.weekly_workout_goal;
  const streak = hasStreakGoal
    ? computeDisplayStreak(
        profile.current_week_streak ?? 0,
        profile.streak_last_completed_week ?? null,
        profile.week_start_day ?? 1,
      )
    : 0;

  return (
    <ToastProvider>
      <CacheSeed profile={profile} />
      <AccentSeed index={profile?.accent_color ?? 0} />
      <div id="app-shell" className="flex flex-col h-dvh">
        {/* Top bar */}
        <header className="px-4 py-3 flex items-center justify-between shrink-0 nav-glass">
          <div className="flex items-center gap-2 font-black text-rainbow">
            WORKOUT APP
          </div>
          <div className="flex items-center gap-2.5">
            <SyncIndicator />
            {hasStreakGoal && <StreakBadge streak={streak} />}
            <Link
              href="/profile"
              className="profile-pill inline-flex items-center gap-1.5 pl-2.5 pr-1 py-1 rounded-full transition-all active:scale-95"
            >
              <span className="text-xs font-medium text-text-primary max-w-20 truncate">
                {profile?.display_name ?? "user"}
              </span>
              <RankBadge rank={rank} />
            </Link>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 min-h-0 overflow-y-auto pb-24">
          <PageTransition>{children}</PageTransition>
        </main>

        {/* Bottom nav */}
        <BottomNav />
      </div>
    </ToastProvider>
  );
}
