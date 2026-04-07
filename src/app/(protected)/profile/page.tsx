import { getProfile } from "@/actions/profile";
import { redirect } from "next/navigation";
import { ProfileClient } from "./client";

export default async function ProfilePage() {
  const data = await getProfile();

  if (!data) {
    redirect("/login");
  }

  return (
    <ProfileClient
      initialProfile={{
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
      }}
    />
  );
}
