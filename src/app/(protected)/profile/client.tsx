"use client";

import { useState } from "react";
import {
  updateProfile,
  updateLanguage,
  setFeaturedAchievement,
  resetProfile,
  deleteAllHistory,
  adminUpdateStats,
  adminCreateDummyWorkout,
  adminCheckAchievements,
} from "@/actions/profile";
import { signOut } from "@/actions/auth";
import { withInvalidation, invalidateAll } from "@/lib/cache/invalidate";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useToast } from "@/components/ui/toast";
import { getRankFromVolume } from "@/lib/utils";
import { useAccent, ACCENT_PRESETS } from "@/components/accent-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import { RankCard } from "@/components/rank-card";
import { AchievementIcon } from "@/components/achievement-icons";

export interface ProfileData {
  display_name: string;
  default_rest_seconds: number;
  timer_sound: boolean;
  timer_vibration: boolean;
  timer_flash: boolean;
  total_volume_kg: number;
  lifter_rank: string;
  weekly_workout_goal: number | null;
  week_start_day: number;
  is_admin: boolean;
  language: string;
  featured_achievement_id: string | null;
}

interface UnlockedAchievement {
  id: string;
  name: string;
  icon: string;
}

function SectionHeader({ left, right }: { left: string; right?: string }) {
  return (
    <div className="flex items-center justify-between px-4 py-2.5 border-b border-accent/20 bg-accent/[0.04]">
      <span className="text-[10px] font-semibold uppercase tracking-wider text-accent/60">
        {left}
      </span>
      {right && (
        <span className="text-[10px] font-semibold uppercase tracking-wider text-accent/60">
          {right}
        </span>
      )}
    </div>
  );
}

function SettingRow({
  label,
  children,
  description,
  last,
}: {
  label: string;
  children: React.ReactNode;
  description?: string;
  last?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between px-4 py-3 ${
        last ? "" : "border-b border-border-subtle"
      }`}
    >
      <div className="flex-1 min-w-0 mr-3">
        <span className="text-sm text-text-primary">{label}</span>
        {description && (
          <p className="text-xs text-text-muted mt-0.5">{description}</p>
        )}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

export function ProfileClient({
  initialProfile,
  unlockedAchievements,
}: {
  initialProfile: ProfileData;
  unlockedAchievements: UnlockedAchievement[];
}) {
  const [profile, setProfile] = useState<ProfileData>(initialProfile);
  const [saving, setSaving] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [confirmDeleteHistory, setConfirmDeleteHistory] = useState(false);
  const [adminAction, setAdminAction] = useState(false);
  const [testVolume, setTestVolume] = useState("");
  const [testRank, setTestRank] = useState("");
  const [testStreak, setTestStreak] = useState("");
  const [badgePicking, setBadgePicking] = useState(false);
  const { addToast } = useToast();
  const { accentIndex, setAccent } = useAccent();
  const t = useTranslations("profile");
  const tc = useTranslations("common");

  const featuredAchievement = unlockedAchievements.find(
    (a) => a.id === profile.featured_achievement_id,
  );

  async function handleSetFeaturedBadge(achievementId: string | null) {
    setBadgePicking(true);
    const result = await setFeaturedAchievement(achievementId);
    if ("error" in result && result.error) {
      addToast(result.error, "error");
    } else {
      setProfile((p) => ({ ...p, featured_achievement_id: achievementId }));
      addToast(achievementId ? t("badgeSet") : t("badgeCleared"), "success");
    }
    setBadgePicking(false);
  }

  async function handleSave() {
    setSaving(true);
    const languageChanged = profile.language !== initialProfile.language;
    await withInvalidation(
      () =>
        updateProfile({
          display_name: profile.display_name,
          default_rest_seconds: profile.default_rest_seconds,
          timer_sound: profile.timer_sound,
          timer_vibration: profile.timer_vibration,
          timer_flash: profile.timer_flash,
          weekly_workout_goal: profile.weekly_workout_goal,
          week_start_day: profile.week_start_day,
          accent_color: accentIndex,
          language: profile.language,
        }),
      "profile",
      "streakData",
    );
    if (languageChanged) {
      await updateLanguage(profile.language);
      window.location.reload();
      return;
    }
    setSaving(false);
    addToast(t("settingsSaved"), "success");
  }

  return (
    <div className="p-4 max-w-lg mx-auto">
      <h1 className="text-lg font-bold text-text-primary mb-6">{t("title")}</h1>

      {/* Featured Badge */}
      <div className="mb-6">
        <p className="text-xs font-medium text-text-secondary mb-3">
          {t("featuredBadge")}
        </p>
        <div className="card overflow-hidden">
          <SectionHeader left={t("badge")} />
          {unlockedAchievements.length === 0 ? (
            <div className="px-4 py-4">
              <p className="text-sm text-text-muted">{t("noBadgesUnlocked")}</p>
            </div>
          ) : (
            <div className="px-4 py-4">
              {/* Currently selected badge — prominent display */}
              {featuredAchievement ? (
                <div className="flex items-center gap-3 mb-4 p-3 rounded-lg bg-accent/[0.06] border border-accent/15">
                  <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent shrink-0">
                    <AchievementIcon
                      name={featuredAchievement.name}
                      icon={featuredAchievement.icon}
                      size={22}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-text-primary">
                      {featuredAchievement.name}
                    </p>
                    <p className="text-[11px] text-accent mt-0.5">
                      {t("featuredBadge")}
                    </p>
                  </div>
                  <button
                    onClick={() => handleSetFeaturedBadge(null)}
                    disabled={badgePicking}
                    className="text-xs text-text-muted hover:text-text-secondary transition-colors px-2 py-1 rounded-md hover:bg-surface-elevated"
                  >
                    {t("clearBadge")}
                  </button>
                </div>
              ) : (
                <p className="text-sm text-text-muted mb-4">{t("noBadgeSelected")}</p>
              )}
              {/* Badge picker grid */}
              <div className="flex flex-wrap gap-2">
                {unlockedAchievements.map((a) => {
                  const isSelected = a.id === profile.featured_achievement_id;
                  return (
                    <button
                      key={a.id}
                      disabled={badgePicking}
                      onClick={() => handleSetFeaturedBadge(a.id)}
                      title={a.name}
                      className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all active:scale-95 ${
                        isSelected
                          ? "bg-accent/15 ring-2 ring-accent shadow-sm text-accent"
                          : "bg-surface-elevated hover:bg-accent/[0.08] hover:scale-105 text-text-secondary"
                      }`}
                    >
                      <AchievementIcon name={a.name} icon={a.icon} size={20} />
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Account */}
      <div className="mb-6">
        <p className="text-xs font-medium text-text-secondary mb-3">
          {t("account")}
        </p>
        <div className="card overflow-hidden">
          <SectionHeader left={t("settings")} />
          <SettingRow label={t("displayName")} last>
            <input
              type="text"
              value={profile.display_name}
              onChange={(e) =>
                setProfile({ ...profile, display_name: e.target.value })
              }
              placeholder={t("yourName")}
              className="bg-surface-elevated rounded-sm text-text-primary text-sm py-1.5 px-2.5 w-36 text-right focus:ring-1 focus:ring-accent outline-none border-0 placeholder:text-text-muted"
            />
          </SettingRow>
        </div>
      </div>

      {/* Workout Settings */}
      <div className="mb-6">
        <p className="text-xs font-medium text-text-secondary mb-3">
          {t("workout")}
        </p>
        <div className="card overflow-hidden">
          <SectionHeader left={t("settings")} right={t("value")} />
          <SettingRow label={t("restPause")} description={t("restPauseDescription")}>
            <input
              type="number"
              value={profile.default_rest_seconds}
              onChange={(e) =>
                setProfile({
                  ...profile,
                  default_rest_seconds: parseInt(e.target.value) || 0,
                })
              }
              className="bg-surface-elevated rounded-sm text-accent font-medium text-sm py-1.5 px-2.5 w-20 text-right focus:ring-1 focus:ring-accent outline-none border-0 tabular-nums"
            />
          </SettingRow>
          <SettingRow label={t("weeklyGoal")} description={t("weeklyGoalDescription")}>
            <input
              type="number"
              min={1}
              max={14}
              value={profile.weekly_workout_goal ?? ""}
              placeholder="—"
              onChange={(e) =>
                setProfile({
                  ...profile,
                  weekly_workout_goal: e.target.value
                    ? parseInt(e.target.value)
                    : null,
                })
              }
              className="bg-surface-elevated rounded-sm text-accent font-medium text-sm py-1.5 px-2.5 w-20 text-right focus:ring-1 focus:ring-accent outline-none border-0 tabular-nums placeholder:text-text-muted/40"
            />
          </SettingRow>
          <SettingRow label={t("weekStartsOn")} last>
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={() => setProfile({ ...profile, week_start_day: 1 })}
                className={`text-xs px-2.5 py-1 rounded-sm transition-colors ${
                  profile.week_start_day === 1
                    ? "bg-accent text-white font-medium"
                    : "text-text-muted hover:text-text-secondary"
                }`}
              >
                {t("mon")}
              </button>
              <button
                type="button"
                onClick={() => setProfile({ ...profile, week_start_day: 0 })}
                className={`text-xs px-2.5 py-1 rounded-sm transition-colors ${
                  profile.week_start_day === 0
                    ? "bg-accent text-white font-medium"
                    : "text-text-muted hover:text-text-secondary"
                }`}
              >
                {t("sun")}
              </button>
            </div>
          </SettingRow>
        </div>
      </div>

      {/* Timer Notifications */}
      <div className="mb-6">
        <p className="text-xs font-medium text-text-secondary mb-3">
          {t("timerNotifications")}
        </p>
        <div className="card overflow-hidden">
          <SectionHeader left={t("notification")} right={t("enabled")} />
          <SettingRow label={t("soundBeep")}>
            <Checkbox
              checked={profile.timer_sound}
              onChange={(v) => setProfile({ ...profile, timer_sound: v })}
            />
          </SettingRow>
          <SettingRow label={t("vibration")}>
            <Checkbox
              checked={profile.timer_vibration}
              onChange={(v) => setProfile({ ...profile, timer_vibration: v })}
            />
          </SettingRow>
          <SettingRow label={t("screenFlash")} last>
            <Checkbox
              checked={profile.timer_flash}
              onChange={(v) => setProfile({ ...profile, timer_flash: v })}
            />
          </SettingRow>
        </div>
      </div>

      {/* Appearance */}
      <div className="mb-6">
        <p className="text-xs font-medium text-text-secondary mb-3">
          {t("appearance")}
        </p>
        <div className="card overflow-hidden">
          <SectionHeader left={t("customization")} />
          <div className="px-4 py-3 border-b border-border-subtle">
            <span className="text-sm text-text-primary block mb-2.5">
              {t("accentColor")}
            </span>
            <div className="flex flex-wrap gap-2">
              {ACCENT_PRESETS.map((preset, i) => (
                <button
                  key={preset.name}
                  type="button"
                  title={preset.name}
                  onClick={() => setAccent(i)}
                  className="relative w-8 h-8 rounded-full border-2 transition-all"
                  style={{
                    backgroundColor: preset.dark,
                    borderColor:
                      accentIndex === i ? preset.dark : "transparent",
                    boxShadow:
                      accentIndex === i
                        ? `0 0 0 2px var(--color-bg), 0 0 0 4px ${preset.dark}`
                        : "none",
                  }}
                />
              ))}
            </div>
          </div>
          <SettingRow label={t("theme")}>
            <ThemeToggle />
          </SettingRow>
          <SettingRow label={t("language")} last>
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={() => setProfile({ ...profile, language: "en" })}
                className={`text-xs px-2.5 py-1 rounded-sm transition-colors ${
                  profile.language === "en"
                    ? "bg-accent text-white font-medium"
                    : "text-text-muted hover:text-text-secondary"
                }`}
              >
                English
              </button>
              <button
                type="button"
                onClick={() => setProfile({ ...profile, language: "cs" })}
                className={`text-xs px-2.5 py-1 rounded-sm transition-colors ${
                  profile.language === "cs"
                    ? "bg-accent text-white font-medium"
                    : "text-text-muted hover:text-text-secondary"
                }`}
              >
                Čeština
              </button>
            </div>
          </SettingRow>
        </div>
      </div>

      {/* Save */}
      <div className="mb-6">
        <Button onClick={handleSave} disabled={saving} className="w-full">
          {saving ? tc("saving") : t("saveSettings")}
        </Button>
      </div>

      {/* Sign out */}
      <form action={signOut} className="mb-6">
        <Button variant="danger" type="submit" className="w-full">
          {t("signOut")}
        </Button>
      </form>

      {/* Admin */}
      {profile.is_admin && (
        <div>
          <p className="text-xs font-medium text-destructive mb-3">{t("admin")}</p>

          <div className="card overflow-hidden mb-4">
            <SectionHeader left={t("testSettings")} />
            <div className="p-4 flex flex-col gap-3">
              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <label className="text-xs text-text-muted block mb-1">
                    {t("volumeKg")}
                  </label>
                  <input
                    type="number"
                    value={testVolume}
                    onChange={(e) => setTestVolume(e.target.value)}
                    placeholder={String(profile.total_volume_kg)}
                    className="bg-surface-elevated rounded-sm text-text-primary text-sm py-1.5 px-2 w-full focus:ring-1 focus:ring-accent outline-none border-0 tabular-nums"
                  />
                </div>
                <Button
                  size="sm"
                  disabled={adminAction || !testVolume}
                  onClick={async () => {
                    setAdminAction(true);
                    const vol = parseFloat(testVolume);
                    const result = await adminUpdateStats({
                      total_volume_kg: vol,
                      lifter_rank: getRankFromVolume(vol),
                    });
                    if ("error" in result) addToast(result.error, "error");
                    else {
                      addToast(t("volumeSetTo", { vol }), "success");
                      setProfile((p) => ({
                        ...p,
                        total_volume_kg: vol,
                        lifter_rank: getRankFromVolume(vol),
                      }));
                      setTestVolume("");
                    }
                    setAdminAction(false);
                  }}
                >
                  Set
                </Button>
              </div>

              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <label className="text-xs text-text-muted block mb-1">
                    {t("rank")}
                  </label>
                  <select
                    value={testRank}
                    onChange={(e) => setTestRank(e.target.value)}
                    className="bg-surface-elevated rounded-sm text-text-primary text-sm py-1.5 px-2 w-full focus:ring-1 focus:ring-accent outline-none border-0"
                  >
                    <option value="">{t("currentRank", { rank: profile.lifter_rank })}</option>
                    {[
                      "ROOKIE",
                      "INITIATE",
                      "REGULAR",
                      "HARDENED",
                      "VETERAN",
                      "ELITE",
                      "LEGEND",
                    ].map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>
                <Button
                  size="sm"
                  disabled={adminAction || !testRank}
                  onClick={async () => {
                    setAdminAction(true);
                    const result = await adminUpdateStats({
                      lifter_rank: testRank,
                    });
                    if ("error" in result) addToast(result.error, "error");
                    else {
                      addToast(t("rankSetTo", { rank: testRank }), "success");
                      setProfile((p) => ({ ...p, lifter_rank: testRank }));
                      setTestRank("");
                    }
                    setAdminAction(false);
                  }}
                >
                  Set
                </Button>
              </div>

              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <label className="text-xs text-text-muted block mb-1">
                    {t("weeklyStreak")}
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={testStreak}
                    onChange={(e) => setTestStreak(e.target.value)}
                    placeholder="0"
                    className="bg-surface-elevated rounded-sm text-text-primary text-sm py-1.5 px-2 w-full focus:ring-1 focus:ring-accent outline-none border-0 tabular-nums"
                  />
                </div>
                <Button
                  size="sm"
                  disabled={adminAction || testStreak === ""}
                  onClick={async () => {
                    setAdminAction(true);
                    const streak = parseInt(testStreak);
                    const result = await adminUpdateStats({
                      current_week_streak: streak,
                    });
                    if ("error" in result) addToast(result.error, "error");
                    else {
                      addToast(t("streakSetTo", { streak }), "success");
                      setTestStreak("");
                    }
                    setAdminAction(false);
                  }}
                >
                  Set
                </Button>
              </div>
            </div>
          </div>

          <div className="card overflow-hidden mb-4">
            <SectionHeader left={t("testActions")} />
            <div className="p-4 flex flex-col gap-2">
              <Button
                className="w-full"
                disabled={adminAction}
                onClick={async () => {
                  setAdminAction(true);
                  const result = await withInvalidation(
                    () => adminCheckAchievements(),
                    "achievements",
                  );
                  if ("error" in result) addToast(result.error, "error");
                  else {
                    const count = result.newAchievements?.length ?? 0;
                    addToast(
                      count > 0
                        ? t("newAchievements", { count })
                        : t("noNewAchievements"),
                      "success",
                    );
                  }
                  setAdminAction(false);
                }}
              >
                {t("checkAchievements")}
              </Button>
              <Button
                className="w-full"
                disabled={adminAction}
                onClick={async () => {
                  setAdminAction(true);
                  const result = await withInvalidation(
                    () => adminCreateDummyWorkout(),
                    "sessions",
                    "profile",
                    "records",
                    "streakData",
                  );
                  if ("error" in result) addToast(result.error, "error");
                  else addToast(t("dummyWorkoutCreated"), "success");
                  setAdminAction(false);
                }}
              >
                {t("createDummyWorkout")}
              </Button>
            </div>
          </div>

          <div className="card overflow-hidden">
            <div className="flex items-center px-4 py-2.5 border-b border-destructive/20 bg-destructive/[0.04]">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-destructive/60">
                {t("dangerZone")}
              </span>
            </div>
            <div className="p-4 flex flex-col gap-3">
              <div>
                <Button
                  variant="danger"
                  className="w-full"
                  onClick={() => setConfirmReset(true)}
                >
                  {t("resetProfile")}
                </Button>
                <p className="text-xs text-text-muted mt-1">
                  {t("resetDescription")}
                </p>
              </div>
              <div>
                <Button
                  variant="danger"
                  className="w-full"
                  onClick={() => setConfirmDeleteHistory(true)}
                >
                  {t("deleteAllHistory")}
                </Button>
                <p className="text-xs text-text-muted mt-1">
                  {t("deleteHistoryDescription")}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={confirmReset}
        onClose={() => setConfirmReset(false)}
        onConfirm={async () => {
          setAdminAction(true);
          const result = await withInvalidation(
            () => resetProfile(),
            "profile",
            "achievements",
            "streakData",
          );
          if ("error" in result) {
            addToast(result.error, "error");
          } else {
            addToast(t("profileReset"), "success");
            setProfile((p) => ({
              ...p,
              total_volume_kg: 0,
              lifter_rank: "ROOKIE",
            }));
          }
          setAdminAction(false);
          setConfirmReset(false);
        }}
        title={t("resetDialogTitle")}
        description={t("resetDialogDescription")}
        confirmLabel={t("yesReset")}
        loadingLabel={t("resetting")}
        loading={adminAction}
      />

      <ConfirmDialog
        open={confirmDeleteHistory}
        onClose={() => setConfirmDeleteHistory(false)}
        onConfirm={async () => {
          setAdminAction(true);
          const result = await deleteAllHistory();
          if ("error" in result) {
            addToast(result.error, "error");
          } else {
            invalidateAll();
            addToast(t("allHistoryDeleted"), "success");
            setProfile((p) => ({
              ...p,
              total_volume_kg: 0,
              lifter_rank: "ROOKIE",
            }));
          }
          setAdminAction(false);
          setConfirmDeleteHistory(false);
        }}
        title={t("deleteHistoryDialogTitle")}
        description={t("deleteHistoryDialogDescription")}
        confirmLabel={t("yesDeleteEverything")}
        loadingLabel={t("deleting")}
        loading={adminAction}
      />
    </div>
  );
}
