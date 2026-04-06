import { getSession } from "@/actions/sessions";
import { getProfile } from "@/actions/profile";
import { notFound } from "next/navigation";
import { WorkoutSessionClient } from "./client";

export default async function WorkoutSessionPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;
  const [session, profile] = await Promise.all([
    getSession(sessionId),
    getProfile(),
  ]);

  if (!session) notFound();

  return (
    <WorkoutSessionClient
      session={session}
      defaultRestSeconds={profile?.default_rest_seconds ?? 60}
      timerSound={profile?.timer_sound ?? true}
      timerVibration={profile?.timer_vibration ?? true}
      timerFlash={profile?.timer_flash ?? true}
    />
  );
}
