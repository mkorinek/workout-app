"use client";

import { useState } from "react";
import {
  updateProfile,
  resetProfile,
  deleteAllHistory,
  adminUpdateStats,
  adminCreateDummyWorkout,
  adminCheckAchievements,
} from "@/actions/profile";
import { signOut } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useToast } from "@/components/ui/toast";
import { getRankFromVolume } from "@/lib/utils";

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
}

export function ProfileClient({ initialProfile }: { initialProfile: ProfileData }) {
  const [profile, setProfile] = useState<ProfileData>(initialProfile);
  const [saving, setSaving] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [confirmDeleteHistory, setConfirmDeleteHistory] = useState(false);
  const [adminAction, setAdminAction] = useState(false);
  const [testVolume, setTestVolume] = useState("");
  const [testRank, setTestRank] = useState("");
  const [testStreak, setTestStreak] = useState("");
  const { addToast } = useToast();

  async function handleSave() {
    setSaving(true);
    await updateProfile({
      display_name: profile.display_name,
      default_rest_seconds: profile.default_rest_seconds,
      timer_sound: profile.timer_sound,
      timer_vibration: profile.timer_vibration,
      timer_flash: profile.timer_flash,
      weekly_workout_goal: profile.weekly_workout_goal,
      week_start_day: profile.week_start_day,
    });
    setSaving(false);
    addToast("Settings saved", "success");
  }

  return (
    <div className="p-4 max-w-lg mx-auto">
      <h1 className="text-lg font-bold text-text-primary mb-6">
        Profile
      </h1>

      {/* Rank display */}
      <div className="card p-4 mb-6">
        <span className="text-accent text-xl font-bold">
          {profile.lifter_rank}
        </span>
        <p className="text-xs text-text-muted mt-1">
          Total volume: {profile.total_volume_kg.toLocaleString()} kg
        </p>
      </div>

      <div className="flex flex-col gap-6">
        <Input
          label="Display name"
          value={profile.display_name}
          onChange={(e) => setProfile({ ...profile, display_name: e.target.value })}
        />

        <div>
          <label className="text-xs font-medium text-text-secondary block mb-1.5">
            Default rest pause (seconds)
          </label>
          <input
            type="number"
            value={profile.default_rest_seconds}
            onChange={(e) =>
              setProfile({
                ...profile,
                default_rest_seconds: parseInt(e.target.value) || 60,
              })
            }
            className="bg-surface border border-border rounded-sm text-text-primary text-sm py-2 px-3 w-24 focus:border-accent outline-none tabular-nums"
          />
        </div>

        <div>
          <p className="text-xs font-medium text-text-secondary mb-3">
            Timer notifications
          </p>
          <div className="flex flex-col gap-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <Checkbox
                checked={profile.timer_sound}
                onChange={(v) => setProfile({ ...profile, timer_sound: v })}
              />
              <span className="text-sm text-text-primary">Sound (beep)</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <Checkbox
                checked={profile.timer_vibration}
                onChange={(v) => setProfile({ ...profile, timer_vibration: v })}
              />
              <span className="text-sm text-text-primary">Vibration</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <Checkbox
                checked={profile.timer_flash}
                onChange={(v) => setProfile({ ...profile, timer_flash: v })}
              />
              <span className="text-sm text-text-primary">Screen flash</span>
            </label>
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-text-secondary block mb-1.5">
            Weekly workout goal
          </label>
          <p className="text-xs text-text-muted mb-2">
            Complete this many workouts each week to build your streak
          </p>
          <input
            type="number"
            min={1}
            max={14}
            value={profile.weekly_workout_goal ?? ""}
            placeholder="Not set"
            onChange={(e) =>
              setProfile({
                ...profile,
                weekly_workout_goal: e.target.value ? parseInt(e.target.value) : null,
              })
            }
            className="bg-surface border border-border rounded-sm text-text-primary text-sm py-2 px-3 w-24 focus:border-accent outline-none tabular-nums placeholder:text-text-muted"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-text-secondary block mb-1.5">
            Week start day
          </label>
          <p className="text-xs text-text-muted mb-2">
            When does your training week begin?
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setProfile({ ...profile, week_start_day: 1 })}
              className={`border px-3 py-1.5 text-sm rounded-sm transition-colors ${
                profile.week_start_day === 1
                  ? "border-accent text-accent bg-accent-muted"
                  : "border-border text-text-muted hover:border-accent/50"
              }`}
            >
              Monday
            </button>
            <button
              type="button"
              onClick={() => setProfile({ ...profile, week_start_day: 0 })}
              className={`border px-3 py-1.5 text-sm rounded-sm transition-colors ${
                profile.week_start_day === 0
                  ? "border-accent text-accent bg-accent-muted"
                  : "border-border text-text-muted hover:border-accent/50"
              }`}
            >
              Sunday
            </button>
          </div>
        </div>

        <Button onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Save Settings"}
        </Button>

        <div className="mt-2" />

        <form action={signOut}>
          <Button variant="danger" type="submit" className="w-full">
            Sign Out
          </Button>
        </form>

        {profile.is_admin && (
          <>
            <div className="mt-2" />

            <div>
              <h2 className="text-sm font-semibold text-destructive mb-4">
                Admin
              </h2>

              <div className="card p-4 mb-4">
                <p className="text-xs font-medium text-text-secondary mb-3">
                  Test Settings
                </p>
                <div className="flex flex-col gap-3">
                  <div className="flex items-end gap-2">
                    <div className="flex-1">
                      <label className="text-xs font-medium text-text-secondary block mb-1">
                        Volume (kg)
                      </label>
                      <input
                        type="number"
                        value={testVolume}
                        onChange={(e) => setTestVolume(e.target.value)}
                        placeholder={String(profile.total_volume_kg)}
                        className="bg-surface border border-border rounded-sm text-text-primary text-sm py-1.5 px-2 w-full focus:border-accent outline-none tabular-nums"
                      />
                    </div>
                    <Button
                      size="sm"
                      disabled={adminAction || !testVolume}
                      onClick={async () => {
                        setAdminAction(true);
                        const vol = parseFloat(testVolume);
                        const result = await adminUpdateStats({ total_volume_kg: vol, lifter_rank: getRankFromVolume(vol) });
                        if ("error" in result) addToast(result.error, "error");
                        else {
                          addToast(`Volume set to ${vol}kg`, "success");
                          setProfile((p) => ({ ...p, total_volume_kg: vol, lifter_rank: getRankFromVolume(vol) }));
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
                      <label className="text-xs font-medium text-text-secondary block mb-1">
                        Rank
                      </label>
                      <select
                        value={testRank}
                        onChange={(e) => setTestRank(e.target.value)}
                        className="bg-surface border border-border rounded-sm text-text-primary text-sm py-1.5 px-2 w-full focus:border-accent outline-none"
                      >
                        <option value="">Current: {profile.lifter_rank}</option>
                        {["ROOKIE", "INITIATE", "REGULAR", "HARDENED", "VETERAN", "ELITE", "LEGEND"].map((r) => (
                          <option key={r} value={r}>{r}</option>
                        ))}
                      </select>
                    </div>
                    <Button
                      size="sm"
                      disabled={adminAction || !testRank}
                      onClick={async () => {
                        setAdminAction(true);
                        const result = await adminUpdateStats({ lifter_rank: testRank });
                        if ("error" in result) addToast(result.error, "error");
                        else {
                          addToast(`Rank set to ${testRank}`, "success");
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
                      <label className="text-xs font-medium text-text-secondary block mb-1">
                        Weekly Streak
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={testStreak}
                        onChange={(e) => setTestStreak(e.target.value)}
                        placeholder="0"
                        className="bg-surface border border-border rounded-sm text-text-primary text-sm py-1.5 px-2 w-full focus:border-accent outline-none tabular-nums"
                      />
                    </div>
                    <Button
                      size="sm"
                      disabled={adminAction || testStreak === ""}
                      onClick={async () => {
                        setAdminAction(true);
                        const streak = parseInt(testStreak);
                        const result = await adminUpdateStats({ current_week_streak: streak });
                        if ("error" in result) addToast(result.error, "error");
                        else {
                          addToast(`Streak set to ${streak}`, "success");
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

              <div className="card p-4 mb-4">
                <p className="text-xs font-medium text-text-secondary mb-3">
                  Test Actions
                </p>
                <div className="flex flex-col gap-2">
                  <Button
                    className="w-full"
                    disabled={adminAction}
                    onClick={async () => {
                      setAdminAction(true);
                      const result = await adminCheckAchievements();
                      if ("error" in result) addToast(result.error, "error");
                      else {
                        const count = result.newAchievements?.length ?? 0;
                        addToast(count > 0 ? `${count} new achievement${count > 1 ? "s" : ""} unlocked` : "No new achievements", "success");
                      }
                      setAdminAction(false);
                    }}
                  >
                    Check Achievements
                  </Button>

                  <Button
                    className="w-full"
                    disabled={adminAction}
                    onClick={async () => {
                      setAdminAction(true);
                      const result = await adminCreateDummyWorkout();
                      if ("error" in result) addToast(result.error, "error");
                      else addToast("Dummy workout created", "success");
                      setAdminAction(false);
                    }}
                  >
                    Create Dummy Workout
                  </Button>
                </div>
              </div>

              <div className="card p-4">
                <p className="text-xs font-semibold text-destructive mb-3">
                  Danger Zone
                </p>
                <div className="flex flex-col gap-2">
                  <div>
                    <Button
                      variant="danger"
                      className="w-full"
                      onClick={() => setConfirmReset(true)}
                    >
                      Reset Profile
                    </Button>
                    <p className="text-xs text-text-muted mt-1">
                      Zeros volume, rank, streak, achievements. Keeps workouts and exercises.
                    </p>
                  </div>

                  <div>
                    <Button
                      variant="danger"
                      className="w-full"
                      onClick={() => setConfirmDeleteHistory(true)}
                    >
                      Delete All History
                    </Button>
                    <p className="text-xs text-text-muted mt-1">
                      Deletes all workouts, sets, PRs, achievements. Keeps account and exercises.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      <ConfirmDialog
        open={confirmReset}
        onClose={() => setConfirmReset(false)}
        onConfirm={async () => {
          setAdminAction(true);
          const result = await resetProfile();
          if ("error" in result) {
            addToast(result.error, "error");
          } else {
            addToast("Profile reset", "success");
            setProfile((p) => ({ ...p, total_volume_kg: 0, lifter_rank: "ROOKIE" }));
          }
          setAdminAction(false);
          setConfirmReset(false);
        }}
        title="Reset Profile"
        description="This will zero out your volume, rank, streak, and all achievements. Workout history and exercises will not be affected. This cannot be undone."
        confirmLabel="Yes, reset"
        loadingLabel="Resetting..."
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
            addToast("All history deleted", "success");
            setProfile((p) => ({ ...p, total_volume_kg: 0, lifter_rank: "ROOKIE" }));
          }
          setAdminAction(false);
          setConfirmDeleteHistory(false);
        }}
        title="Delete All History"
        description="This will permanently delete ALL workout sessions, sets, personal records, and achievements. Your account and exercises will be preserved. This cannot be undone."
        confirmLabel="Yes, delete everything"
        loadingLabel="Deleting..."
        loading={adminAction}
      />
    </div>
  );
}
