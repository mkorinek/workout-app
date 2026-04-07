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
  }

  return (
    <div className="p-4 max-w-lg mx-auto">
      <h1 className="text-xs text-term-green uppercase tracking-widest mb-6">
        &gt; profile
      </h1>

      {/* Rank display */}
      <div className="border border-term-gray p-4 mb-6">
        <span className="text-term-green text-lg font-bold">
          [{profile.lifter_rank}@gym]$
        </span>
        <p className="text-[10px] text-term-gray-light mt-1">
          total volume: {profile.total_volume_kg.toLocaleString()} kg
        </p>
      </div>

      <div className="flex flex-col gap-6">
        <Input
          label="display name"
          value={profile.display_name}
          onChange={(e) => setProfile({ ...profile, display_name: e.target.value })}
        />

        <div>
          <label className="text-[10px] text-term-gray-light uppercase tracking-widest block mb-1">
            default rest pause (seconds)
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
            className="bg-transparent border-b border-term-gray text-term-white font-mono text-sm py-1.5 w-24 focus:border-term-green outline-none tabular-nums"
          />
        </div>

        <div>
          <p className="text-[10px] text-term-gray-light uppercase tracking-widest mb-3">
            timer notifications
          </p>
          <div className="flex flex-col gap-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <Checkbox
                checked={profile.timer_sound}
                onChange={(v) => setProfile({ ...profile, timer_sound: v })}
              />
              <span className="text-xs text-term-white">sound (beep)</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <Checkbox
                checked={profile.timer_vibration}
                onChange={(v) => setProfile({ ...profile, timer_vibration: v })}
              />
              <span className="text-xs text-term-white">vibration</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <Checkbox
                checked={profile.timer_flash}
                onChange={(v) => setProfile({ ...profile, timer_flash: v })}
              />
              <span className="text-xs text-term-white">screen flash</span>
            </label>
          </div>
        </div>

        <div>
          <label className="text-[10px] text-term-gray-light uppercase tracking-widest block mb-1">
            weekly workout goal
          </label>
          <p className="text-[10px] text-term-gray mb-2">
            complete this many workouts each week to build your streak
          </p>
          <input
            type="number"
            min={1}
            max={14}
            value={profile.weekly_workout_goal ?? ""}
            placeholder="not set"
            onChange={(e) =>
              setProfile({
                ...profile,
                weekly_workout_goal: e.target.value ? parseInt(e.target.value) : null,
              })
            }
            className="bg-transparent border-b border-term-gray text-term-white font-mono text-sm py-1.5 w-24 focus:border-term-green outline-none tabular-nums"
          />
        </div>

        <div>
          <label className="text-[10px] text-term-gray-light uppercase tracking-widest block mb-1">
            week start day
          </label>
          <p className="text-[10px] text-term-gray mb-2">
            when does your training week begin?
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setProfile({ ...profile, week_start_day: 1 })}
              className={`border px-3 py-1.5 text-xs uppercase tracking-widest font-mono transition-colors ${
                profile.week_start_day === 1
                  ? "border-term-green text-term-green bg-term-green/10"
                  : "border-term-gray text-term-gray-light hover:border-term-green"
              }`}
            >
              monday
            </button>
            <button
              type="button"
              onClick={() => setProfile({ ...profile, week_start_day: 0 })}
              className={`border px-3 py-1.5 text-xs uppercase tracking-widest font-mono transition-colors ${
                profile.week_start_day === 0
                  ? "border-term-green text-term-green bg-term-green/10"
                  : "border-term-gray text-term-gray-light hover:border-term-green"
              }`}
            >
              sunday
            </button>
          </div>
        </div>

        <Button onClick={handleSave} disabled={saving}>
          {saving ? "saving..." : "save settings"}
        </Button>

        <hr className="border-term-gray" />

        <form action={signOut}>
          <Button variant="danger" type="submit" className="w-full">
            sign out
          </Button>
        </form>

        {profile.is_admin && (
          <>
            <hr className="border-term-gray" />

            <div>
              <h2 className="text-xs text-term-red uppercase tracking-widest mb-4">
                &gt; admin
              </h2>

              <div className="border border-term-gray p-3 mb-4">
                <p className="text-[10px] text-term-gray-light uppercase tracking-widest mb-3">
                  test settings
                </p>
                <div className="flex flex-col gap-3">
                  <div className="flex items-end gap-2">
                    <div className="flex-1">
                      <label className="text-[10px] text-term-gray-light uppercase tracking-widest block mb-1">
                        volume (kg)
                      </label>
                      <input
                        type="number"
                        value={testVolume}
                        onChange={(e) => setTestVolume(e.target.value)}
                        placeholder={String(profile.total_volume_kg)}
                        className="bg-transparent border-b border-term-gray text-term-white font-mono text-sm py-1 w-full focus:border-term-green outline-none tabular-nums"
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
                          addToast(`volume set to ${vol}kg`, "success");
                          setProfile((p) => ({ ...p, total_volume_kg: vol, lifter_rank: getRankFromVolume(vol) }));
                          setTestVolume("");
                        }
                        setAdminAction(false);
                      }}
                    >
                      set
                    </Button>
                  </div>

                  <div className="flex items-end gap-2">
                    <div className="flex-1">
                      <label className="text-[10px] text-term-gray-light uppercase tracking-widest block mb-1">
                        rank
                      </label>
                      <select
                        value={testRank}
                        onChange={(e) => setTestRank(e.target.value)}
                        className="bg-term-black border-b border-term-gray text-term-white font-mono text-sm py-1 w-full focus:border-term-green outline-none"
                      >
                        <option value="">current: {profile.lifter_rank}</option>
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
                          addToast(`rank set to ${testRank}`, "success");
                          setProfile((p) => ({ ...p, lifter_rank: testRank }));
                          setTestRank("");
                        }
                        setAdminAction(false);
                      }}
                    >
                      set
                    </Button>
                  </div>

                  <div className="flex items-end gap-2">
                    <div className="flex-1">
                      <label className="text-[10px] text-term-gray-light uppercase tracking-widest block mb-1">
                        weekly streak
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={testStreak}
                        onChange={(e) => setTestStreak(e.target.value)}
                        placeholder="0"
                        className="bg-transparent border-b border-term-gray text-term-white font-mono text-sm py-1 w-full focus:border-term-green outline-none tabular-nums"
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
                          addToast(`streak set to ${streak}`, "success");
                          setTestStreak("");
                        }
                        setAdminAction(false);
                      }}
                    >
                      set
                    </Button>
                  </div>
                </div>
              </div>

              <div className="border border-term-gray p-3 mb-4">
                <p className="text-[10px] text-term-gray-light uppercase tracking-widest mb-3">
                  test actions
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
                        addToast(count > 0 ? `${count} new achievement${count > 1 ? "s" : ""} unlocked` : "no new achievements", "success");
                      }
                      setAdminAction(false);
                    }}
                  >
                    check achievements
                  </Button>

                  <Button
                    className="w-full"
                    disabled={adminAction}
                    onClick={async () => {
                      setAdminAction(true);
                      const result = await adminCreateDummyWorkout();
                      if ("error" in result) addToast(result.error, "error");
                      else addToast("dummy workout created", "success");
                      setAdminAction(false);
                    }}
                  >
                    create dummy workout
                  </Button>
                </div>
              </div>

              <div className="border border-term-red/30 p-3">
                <p className="text-[10px] text-term-red uppercase tracking-widest mb-3">
                  danger zone
                </p>
                <div className="flex flex-col gap-2">
                  <div>
                    <Button
                      variant="danger"
                      className="w-full"
                      onClick={() => setConfirmReset(true)}
                    >
                      reset profile
                    </Button>
                    <p className="text-[10px] text-term-gray mt-1">
                      zeros volume, rank, streak, achievements. keeps workouts and exercises.
                    </p>
                  </div>

                  <div>
                    <Button
                      variant="danger"
                      className="w-full"
                      onClick={() => setConfirmDeleteHistory(true)}
                    >
                      delete all history
                    </Button>
                    <p className="text-[10px] text-term-gray mt-1">
                      deletes all workouts, sets, PRs, achievements. keeps account and exercises.
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
            addToast("profile reset", "success");
            setProfile((p) => ({ ...p, total_volume_kg: 0, lifter_rank: "ROOKIE" }));
          }
          setAdminAction(false);
          setConfirmReset(false);
        }}
        title="reset profile"
        description="this will zero out your volume, rank, streak, and all achievements. workout history and exercises will not be affected. this cannot be undone."
        confirmLabel="yes, reset"
        loadingLabel="resetting..."
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
            addToast("all history deleted", "success");
            setProfile((p) => ({ ...p, total_volume_kg: 0, lifter_rank: "ROOKIE" }));
          }
          setAdminAction(false);
          setConfirmDeleteHistory(false);
        }}
        title="delete all history"
        description="this will permanently delete ALL workout sessions, sets, personal records, and achievements. your account and exercises will be preserved. this cannot be undone."
        confirmLabel="yes, delete everything"
        loadingLabel="deleting..."
        loading={adminAction}
      />
    </div>
  );
}
