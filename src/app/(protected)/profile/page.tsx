"use client";

import { useState, useEffect } from "react";
import { getProfile, updateProfile } from "@/actions/profile";
import { signOut } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
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
  } | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

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
      </div>
    </div>
  );
}
