"use client";

import { useState, useEffect } from "react";
import {
  getProfile,
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
import { useToast } from "@/components/ui/toast";
import { getRankFromVolume } from "@/lib/utils";

export default function ProfilePage() {
  const [profile, setProfile] = useState<{
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
  } | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [confirmReset, setConfirmReset] = useState(false);
  const [confirmDeleteHistory, setConfirmDeleteHistory] = useState(false);
  const [adminAction, setAdminAction] = useState(false);
  const [testVolume, setTestVolume] = useState("");
  const [testRank, setTestRank] = useState("");
  const [testStreak, setTestStreak] = useState("");
  const { addToast } = useToast();

  useEffect(() => {
    getProfile().then((data) => {
      if (data) {
        setProfile({
          display_name: data.display_name ?? "",
          default_rest_seconds: data.default_rest_seconds,
          timer_sound: data.timer_sound,
          timer_vibration: data.timer_vibration,
          timer_flash: data.timer_flash,
          total_volume_kg: Number(data.total_volume_kg),
          lifter_rank: data.lifter_rank,
          weekly_workout_goal: data.weekly_workout_goal ?? null,
          week_start_day: data.week_start_day ?? 1,
          is_admin: data.is_admin ?? false,
        });
      }
      setLoading(false);
    });
  }, []);

  async function handleSave() {
    if (!profile) return;
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

  if (loading) {
    return (
      <div className="p-4 text-xs text-term-gray-light">
        loading<span className="cursor-blink">_</span>
      </div>
    );
  }

  if (!profile) return null;

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

      {/* Settings */}
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

        {/* Timer notifications */}
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

        {/* Weekly workout goal */}
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

        {/* Week start day */}
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

        {/* Admin Section */}
        {profile.is_admin && (
          <>
            <hr className="border-term-gray" />

            <div>
              <h2 className="text-xs text-term-red uppercase tracking-widest mb-4">
                &gt; admin
              </h2>

              {/* Test Settings */}
              <div className="border border-term-gray p-3 mb-4">
                <p className="text-[10px] text-term-gray-light uppercase tracking-widest mb-3">
                  test settings
                </p>
                <div className="flex flex-col gap-3">
                  {/* Set Volume */}
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
                        if (result.error) addToast(result.error, "error");
                        else {
                          addToast(`volume set to ${vol}kg`, "success");
                          setProfile((p) => p ? { ...p, total_volume_kg: vol, lifter_rank: getRankFromVolume(vol) } : p);
                          setTestVolume("");
                        }
                        setAdminAction(false);
                      }}
                    >
                      set
                    </Button>
                  </div>

                  {/* Set Rank */}
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
                        if (result.error) addToast(result.error, "error");
                        else {
                          addToast(`rank set to ${testRank}`, "success");
                          setProfile((p) => p ? { ...p, lifter_rank: testRank } : p);
                          setTestRank("");
                        }
                        setAdminAction(false);
                      }}
                    >
                      set
                    </Button>
                  </div>

                  {/* Set Streak */}
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
                        if (result.error) addToast(result.error, "error");
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

              {/* Test Actions */}
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
                      if (result.error) addToast(result.error, "error");
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
                      if (result.error) addToast(result.error, "error");
                      else addToast("dummy workout created", "success");
                      setAdminAction(false);
                    }}
                  >
                    create dummy workout
                  </Button>
                </div>
              </div>

              {/* Destructive Actions */}
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

      {/* Reset profile confirmation */}
      {confirmReset && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          onClick={() => { if (!adminAction) setConfirmReset(false); }}
        >
          <div className="absolute inset-0 bg-black/80" />
          <div
            className="relative border border-term-red bg-term-black p-6 max-w-sm w-[calc(100%-2rem)]"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-xs text-term-red uppercase tracking-widest mb-1 font-bold">
              &gt; reset profile
            </p>
            <p className="text-[10px] text-term-gray-light mb-6">
              this will zero out your volume, rank, streak, and all achievements. workout history and exercises will not be affected. this cannot be undone.
            </p>
            <div className="flex gap-2">
              <Button
                variant="danger"
                size="sm"
                className="flex-1"
                disabled={adminAction}
                onClick={async () => {
                  setAdminAction(true);
                  const result = await resetProfile();
                  if (result.error) {
                    addToast(result.error, "error");
                  } else {
                    addToast("profile reset", "success");
                    setProfile((p) => p ? { ...p, total_volume_kg: 0, lifter_rank: "ROOKIE" } : p);
                  }
                  setAdminAction(false);
                  setConfirmReset(false);
                }}
              >
                {adminAction ? "resetting..." : "yes, reset"}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="flex-1"
                onClick={() => setConfirmReset(false)}
                disabled={adminAction}
              >
                cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete all history confirmation */}
      {confirmDeleteHistory && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          onClick={() => { if (!adminAction) setConfirmDeleteHistory(false); }}
        >
          <div className="absolute inset-0 bg-black/80" />
          <div
            className="relative border border-term-red bg-term-black p-6 max-w-sm w-[calc(100%-2rem)]"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-xs text-term-red uppercase tracking-widest mb-1 font-bold">
              &gt; delete all history
            </p>
            <p className="text-[10px] text-term-gray-light mb-6">
              this will permanently delete ALL workout sessions, sets, personal records, and achievements. your account and exercises will be preserved. this cannot be undone.
            </p>
            <div className="flex gap-2">
              <Button
                variant="danger"
                size="sm"
                className="flex-1"
                disabled={adminAction}
                onClick={async () => {
                  setAdminAction(true);
                  const result = await deleteAllHistory();
                  if (result.error) {
                    addToast(result.error, "error");
                  } else {
                    addToast("all history deleted", "success");
                    setProfile((p) => p ? { ...p, total_volume_kg: 0, lifter_rank: "ROOKIE" } : p);
                  }
                  setAdminAction(false);
                  setConfirmDeleteHistory(false);
                }}
              >
                {adminAction ? "deleting..." : "yes, delete everything"}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="flex-1"
                onClick={() => setConfirmDeleteHistory(false)}
                disabled={adminAction}
              >
                cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
