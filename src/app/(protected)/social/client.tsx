"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { searchUsers, followUser, unfollowUser } from "@/actions/social";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SearchIcon } from "@/components/icons";
import { useToast } from "@/components/ui/toast";
import { useRouter } from "next/navigation";
import { getRankColor } from "@/lib/utils";

interface FollowedProfile {
  id: string;
  display_name: string | null;
  lifter_rank: string;
  total_volume_kg: number;
  current_week_streak: number;
  achievement_count: number;
}

interface SearchResult {
  id: string;
  display_name: string | null;
  email: string;
  lifter_rank: string;
  total_volume_kg: number;
}

export function SocialClient({
  followedProfiles,
  followingIds,
}: {
  followedProfiles: FollowedProfile[];
  followingIds: string[];
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searched, setSearched] = useState(false);
  const [searching, setSearching] = useState(false);
  const [following, setFollowing] = useState<Set<string>>(
    new Set(followingIds),
  );
  const [isPending, startTransition] = useTransition();
  const { addToast } = useToast();
  const router = useRouter();
  const t = useTranslations("social");
  const tc = useTranslations("common");

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
              return (
                <div
                  key={user.id}
                  className="card p-3 flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-text-primary truncate">
                      {user.display_name || t("unknown")}
                    </p>
                    <p className="text-xs text-text-muted truncate">
                      {user.email}
                    </p>
                    <p className="text-xs text-accent mt-0.5">
                      {user.lifter_rank}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant={isFollowing ? "ghost" : "primary"}
                    disabled={isPending}
                    onClick={() =>
                      isFollowing
                        ? handleUnfollow(user.id)
                        : handleFollow(user.id)
                    }
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
          <div className="card p-6 text-center">
            <p className="text-sm text-text-muted">
              {t("notFollowing")}
            </p>
            <p className="text-xs text-text-muted mt-1">
              {t("searchToFind")}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {followedProfiles.map((profile) => (
              <div
                key={profile.id}
                className="card p-3 flex items-center justify-between gap-3 border"
                style={{
                  borderColor: getRankColor(profile.lifter_rank),
                }}
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-text-primary truncate">
                    {profile.display_name || t("unknown")}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span
                      className="text-xs font-medium"
                      style={{ color: getRankColor(profile.lifter_rank) }}
                    >
                      {profile.lifter_rank}
                    </span>
                    <span className="text-xs text-text-muted">
                      {Number(profile.total_volume_kg).toLocaleString()} {tc("kg")}
                    </span>
                    {profile.current_week_streak > 0 && (
                      <span className="text-xs text-text-muted">
                        {t("weekStreak", { count: profile.current_week_streak })}
                      </span>
                    )}
                    {profile.achievement_count > 0 && (
                      <span className="text-xs text-text-muted">
                        {t("badges", { count: profile.achievement_count })}
                      </span>
                    )}
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={isPending}
                  onClick={() => handleUnfollow(profile.id)}
                >
                  {t("unfollow")}
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
