import { getSessionSummary } from "@/actions/sessions";
import { redirect, notFound } from "next/navigation";
import { SummaryClient } from "./client";

export default async function SummaryPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;
  const summary = await getSessionSummary(sessionId);

  if (!summary) {
    // Session doesn't exist or isn't completed yet
    redirect(`/workouts/${sessionId}`);
  }

  return <SummaryClient summary={summary} />;
}
