import { getFollowedProfiles, getFollowing } from "@/actions/social";
import { redirect } from "next/navigation";
import { SocialClient } from "./client";
import { createClient } from "@/lib/supabase/server";

export default async function SocialPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [followedProfiles, followingIds] = await Promise.all([
    getFollowedProfiles(),
    getFollowing(),
  ]);

  return (
    <SocialClient
      followedProfiles={followedProfiles}
      followingIds={followingIds}
    />
  );
}
