import { getSessions } from "@/actions/sessions";
import { WorkoutsClient } from "./client";

export default async function WorkoutsPage() {
  const sessions = await getSessions();

  return <WorkoutsClient initialSessions={sessions} />;
}
