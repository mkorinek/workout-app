"use client";

import { useState, useTransition, useMemo } from "react";
import { useTranslations } from "next-intl";
import { searchUsers, followUser, unfollowUser } from "@/actions/social";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SearchIcon } from "@/components/icons";
import { useToast } from "@/components/ui/toast";
import { useRouter } from "next/navigation";
import { formatDate } from "@/lib/utils";
import { Modal } from "@/components/ui/modal";
import { useLocale } from "next-intl";
import { getRankVisual, makeParticles } from "@/lib/rank-visuals";
import { AchievementIcon } from "@/components/achievement-icons";

interface FollowedProfile {
  id: string;
  display_name: string | null;
  lifter_rank: string;
  total_volume_kg: number;
  current_week_streak: number;
  achievement_count: number;
  featured_achievement: { name: string; icon: string } | null;
  last_workout_at: string | Date | null;
}

interface SearchResult {
  id: string;
  display_name: string | null;
  email: string;
  lifter_rank: string;
  total_volume_kg: number;
}

function getInitials(name: string | null): string {
  if (!name) return "?";
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function relativeTime(
  date: string | Date | null,
  t: (key: string, values?: Record<string, number>) => string,
): string {
  if (!date) return t("never");
  const now = new Date();
  const d = new Date(date);
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return t("today");
  if (diffDays === 1) return t("yesterday");
  if (diffDays < 14) return t("daysAgo", { count: diffDays });
  return t("weeksAgo", { count: Math.floor(diffDays / 7) });
}

// ── Followed user card ──────────────────────────────────────────────
function FollowedUserCard({
  profile,
  index,
  onClick,
  t,
}: {
  profile: FollowedProfile;
  index: number;
  onClick: () => void;
  t: (key: string, values?: Record<string, number>) => string;
}) {
  const vis = getRankVisual(profile.lifter_rank);
  const isLegend = profile.lifter_rank === "LEGEND";

  return (
    <div
      className="rounded-[var(--radius-md)] p-3 cursor-pointer animate-stagger-in overflow-hidden relative"
      style={{
        animationDelay: `${index * 50}ms`,
        background: "#1a1a1e",
        borderLeft: `3px solid ${vis.colors[0]}`,
        boxShadow: vis.level >= 3
          ? `0 0 16px ${vis.colors[0]}10, 0 2px 8px rgba(0,0,0,0.3)`
          : "0 2px 8px rgba(0,0,0,0.2)",
      }}
      onClick={onClick}
    >
      {/* Subtle ambient glow for HARDENED+ */}
      {vis.level >= 3 && (
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.05]"
          style={{
            background: `radial-gradient(ellipse at 0% 50%, ${vis.colors[0]}, transparent 60%)`,
          }}
        />
      )}

      <div className="flex items-center gap-3 relative">
        {/* Avatar */}
        <div className="shrink-0">
          <div
            className="w-11 h-11 rounded-full flex items-center justify-center text-xs font-bold text-white"
            style={{
              backgroundColor: vis.colors[0],
              boxShadow: `0 0 10px ${vis.colors[0]}30`,
            }}
          >
            {getInitials(profile.display_name)}
          </div>
        </div>

        {/* Center: name + rank + badge */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <p
              className={`text-[13px] font-semibold truncate ${
                isLegend ? "text-rainbow" : ""
              }`}
              style={isLegend ? undefined : { color: "#f0f0f3" }}
            >
              {profile.display_name || t("unknown")}
            </p>
            {profile.featured_achievement && (
              <span className="shrink-0" style={{ color: "#9ca3af" }} title={profile.featured_achievement.name}>
                <AchievementIcon name={profile.featured_achievement.name} icon={profile.featured_achievement.icon} size={14} />
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span
              className="text-[10px] font-bold uppercase tracking-wide"
              style={{ color: vis.darkColors[0] }}
            >
              {profile.lifter_rank}
            </span>
            <span className="text-[10px]" style={{ color: "#4b5563" }}>·</span>
            <span className="text-[10px] tabular-nums" style={{ color: "#6b7280" }}>
              {profile.total_volume_kg.toLocaleString()} kg
            </span>
            {profile.current_week_streak > 0 && (
              <>
                <span className="text-[10px]" style={{ color: "#4b5563" }}>·</span>
                <span className="text-[10px]" style={{ color: "#6b7280" }}>
                  {t("weekStreak", { count: profile.current_week_streak })}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Right: last workout time */}
        <div className="shrink-0 text-right">
          <span className="text-[10px]" style={{ color: "#6b7280" }}>
            {relativeTime(profile.last_workout_at, t)}
          </span>
        </div>
      </div>
    </div>
  );
}

// ── Modal rank hero ─────────────────────────────────────────────────
function ModalRankHero({ profile }: { profile: FollowedProfile }) {
  const vis = getRankVisual(profile.lifter_rank);
  const isLegend = profile.lifter_rank === "LEGEND";

  const particles = useMemo(
    () => (vis.level >= 5 ? makeParticles(vis.level >= 6 ? 6 : 3) : []),
    [vis.level],
  );

  // Approach: forced-dark card — always dark bg, always white/light text.
  // Rank color ONLY on: left accent bar, avatar bg, small highlights.
  // This guarantees contrast regardless of app theme.
  return (
    <div
      className="relative rounded-xl overflow-hidden"
      style={
        {
          "--rank-color-1": vis.colors[0],
          "--rank-color-2": vis.colors[1],
        } as React.CSSProperties
      }
    >
      {/* Particles for ELITE+ */}
      {particles.map((p, i) => (
        <span
          key={i}
          className="rank-particle"
          style={
            {
              left: p.left,
              "--particle-delay": p.delay,
              "--particle-duration": p.duration,
              "--particle-drift": p.drift,
              "--particle-size": p.size,
            } as React.CSSProperties
          }
        />
      ))}

      <div
        className="relative rounded-xl overflow-hidden"
        style={{
          background: "#1a1a1e",
          borderLeft: `3px solid ${vis.colors[0]}`,
        }}
      >
        {/* Subtle ambient glow from rank color */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.06]"
          style={{
            background: `radial-gradient(ellipse at 30% 50%, ${vis.colors[0]}, transparent 70%)`,
          }}
        />

        <div className="relative flex items-center gap-4 px-4 py-4">
          {/* Avatar */}
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center text-base font-black text-white shrink-0"
            style={{
              backgroundColor: vis.colors[0],
              boxShadow: `0 0 16px ${vis.colors[0]}40`,
            }}
          >
            {getInitials(profile.display_name)}
          </div>

          {/* Info — always white text */}
          <div className="flex-1 min-w-0">
            {vis.label && (
              <div
                className="text-[9px] tracking-[0.25em] font-semibold mb-0.5"
                style={{ color: vis.darkColors[0] }}
              >
                {vis.label}
              </div>
            )}
            <h3
              className={`text-lg font-black tracking-wider ${
                isLegend ? "text-rainbow" : ""
              }`}
              style={isLegend ? undefined : { color: "#f0f0f3" }}
            >
              {profile.lifter_rank}
            </h3>
            <p className="text-sm font-semibold tabular-nums" style={{ color: "#9ca3af" }}>
              {profile.total_volume_kg.toLocaleString()} kg
            </p>
          </div>

          {/* Featured badge */}
          {profile.featured_achievement && (
            <div className="shrink-0 flex flex-col items-center gap-1">
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${vis.colors[0]}20`, color: vis.darkColors[0] }}
              >
                <AchievementIcon
                  name={profile.featured_achievement.name}
                  icon={profile.featured_achievement.icon}
                  size={18}
                />
              </div>
              <span className="text-[9px] max-w-[56px] truncate" style={{ color: "#6b7280" }}>
                {profile.featured_achievement.name}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main component ──────────────────────────────────────────────────
export function SocialClient({
  followedProfiles,
  followingIds,
}: {
  followedProfiles: FollowedProfile[];
  followingIds: string[];
}) {
  const locale = useLocale();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searched, setSearched] = useState(false);
  const [searching, setSearching] = useState(false);
  const [following, setFollowing] = useState<Set<string>>(
    new Set(followingIds),
  );
  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState<FollowedProfile | null>(null);
  const [isPending, startTransition] = useTransition();
  const { addToast } = useToast();
  const router = useRouter();
  const t = useTranslations("social");

  async function handleSearch() {
    if (query.length < 2) return;
    setSearching(true);
    const data = await searchUsers(query);
    setResults(data);
    setSearched(true);
    setSearching(false);
  }

  function handleFollow(userId: string) {
    startTransition(async () => {
      const result = await followUser(userId);
      if ("error" in result && result.error) {
        addToast(result.error, "error");
      } else {
        setFollowing((prev) => new Set(prev).add(userId));
        addToast(t("followed"), "success");
        router.refresh();
      }
    });
  }

  function handleUnfollow(userId: string) {
    startTransition(async () => {
      const result = await unfollowUser(userId);
      if ("error" in result && result.error) {
        addToast(result.error, "error");
      } else {
        setFollowing((prev) => {
          const next = new Set(prev);
          next.delete(userId);
          return next;
        });
        addToast(t("unfollowed"), "success");
        router.refresh();
      }
    });
  }

  const modalVis = modalData ? getRankVisual(modalData.lifter_rank) : null;

  return (
    <div className="p-4 max-w-lg mx-auto">
      <h1 className="text-lg font-bold text-text-primary mb-6">{t("title")}</h1>

      {/* Search */}
      <div className="mb-6">
        <p className="text-xs font-medium text-text-secondary mb-2">
          {t("findPeople")}
        </p>
        <div className="flex gap-2">
          <div className="flex-1">
            <Input
              placeholder={t("searchPlaceholder")}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
          </div>
          <Button
            onClick={handleSearch}
            disabled={searching || query.length < 2}
            className="shrink-0"
          >
            <SearchIcon size={16} />
          </Button>
        </div>
      </div>

      {/* Search results */}
      {searched && (
        <div className="mb-8">
          <p className="text-xs font-medium text-text-secondary mb-3">
            {results.length === 0
              ? t("noUsersFound")
              : t("foundUsers", { count: results.length })}
          </p>
          <div className="flex flex-col gap-2">
            {results.map((user) => {
              const isFollowing = following.has(user.id);
              const uVis = getRankVisual(user.lifter_rank);
              return (
                <div
                  key={user.id}
                  className="rounded-[var(--radius-md)] p-3 flex items-center gap-3"
                  style={{
                    background: "#1a1a1e",
                    borderLeft: `3px solid ${uVis.colors[0]}`,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-xs font-bold text-white"
                    style={{
                      backgroundColor: uVis.colors[0],
                      boxShadow: `0 0 10px ${uVis.colors[0]}30`,
                    }}
                  >
                    {getInitials(user.display_name)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate" style={{ color: "#f0f0f3" }}>
                      {user.display_name || t("unknown")}
                    </p>
                    <p className="text-xs truncate" style={{ color: "#6b7280" }}>
                      {user.email}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant={isFollowing ? "ghost" : "primary"}
                    disabled={isPending}
                    onClick={(e) => {
                      e.stopPropagation();
                      isFollowing
                        ? handleUnfollow(user.id)
                        : handleFollow(user.id);
                    }}
                  >
                    {isFollowing ? t("unfollow") : t("follow")}
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Followed users */}
      <div>
        <p className="text-xs font-medium text-text-secondary mb-3">
          {t("following", { count: followedProfiles.length })}
        </p>
        {followedProfiles.length === 0 ? (
          <div className="rounded-[var(--radius-md)] p-6 text-center" style={{ background: "#1a1a1e" }}>
            <p className="text-sm" style={{ color: "#6b7280" }}>{t("notFollowing")}</p>
            <p className="text-xs mt-1" style={{ color: "#4b5563" }}>{t("searchToFind")}</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {followedProfiles.map((profile, i) => (
              <FollowedUserCard
                key={profile.id}
                profile={profile}
                index={i}
                onClick={() => {
                  setModalData(profile);
                  setModalOpen(true);
                }}
                t={t}
              />
            ))}
          </div>
        )}
      </div>

      {/* Profile detail modal */}
      <Modal
        open={modalOpen}
        title={modalData?.display_name || t("unknown")}
        onClose={() => setModalOpen(false)}
      >
        {modalData && modalVis && (
          <div className="flex flex-col gap-4">
            {/* Rank hero */}
            <ModalRankHero profile={modalData} />

            {/* Stats */}
            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-lg px-3 py-2.5 text-center bg-surface-elevated">
                <p className="text-[10px] uppercase tracking-wider text-text-muted font-medium">
                  {t("achievements")}
                </p>
                <p className="text-base font-bold mt-0.5 tabular-nums text-text-primary">
                  {modalData.achievement_count}
                </p>
              </div>
              <div className="rounded-lg px-3 py-2.5 text-center bg-surface-elevated">
                <p className="text-[10px] uppercase tracking-wider text-text-muted font-medium">
                  Streak
                </p>
                <p className="text-base font-bold mt-0.5 text-text-primary">
                  {modalData.current_week_streak > 0
                    ? t("weekStreak", { count: modalData.current_week_streak })
                    : "—"}
                </p>
              </div>
              <div className="rounded-lg px-3 py-2.5 text-center bg-surface-elevated">
                <p className="text-[10px] uppercase tracking-wider text-text-muted font-medium">
                  {t("lastWorkout")}
                </p>
                <p className="text-[13px] font-bold text-text-primary mt-0.5">
                  {modalData.last_workout_at
                    ? formatDate(modalData.last_workout_at, locale)
                    : "—"}
                </p>
              </div>
            </div>

            {/* Unfollow */}
            <Button
              variant="ghost"
              className="w-full"
              disabled={isPending}
              onClick={() => {
                handleUnfollow(modalData.id);
                setModalOpen(false);
              }}
            >
              {t("unfollow")}
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
}
