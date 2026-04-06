import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { BottomNav } from "@/components/nav/bottom-nav";
import { RankBadge } from "@/components/achievements/rank-badge";
import { SyncIndicator } from "@/components/nav/sync-indicator";
import { ToastProvider } from "@/components/ui/toast";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, lifter_rank, total_volume_kg")
    .eq("id", user.id)
    .single();

  const rank = profile?.lifter_rank ?? "ROOKIE";

  return (
    <ToastProvider>
      <div className="flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="border-b border-term-gray px-4 py-3 flex items-center justify-between shrink-0">
          <RankBadge rank={rank} />
          <div className="flex items-center gap-3">
            <SyncIndicator />
            <span className="text-term-gray-light text-[10px] uppercase tracking-widest">
              {profile?.display_name ?? "user"}
            </span>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto pb-20">
          {children}
        </main>

        {/* Bottom nav */}
        <BottomNav />
      </div>
    </ToastProvider>
  );
}
