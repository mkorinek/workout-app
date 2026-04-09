"use server";

import { createClient, getAuthUser } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { cache } from "react";

export const getFollowing = cache(async () => {
  const supabase = await createClient();
  const user = await getAuthUser();
  if (!user) return [];

  const { data } = await supabase
    .from("follows")
    .select("following_id")
    .eq("follower_id", user.id);

  return data?.map((f) => f.following_id) ?? [];
});

export const getFollowedProfiles = cache(async () => {
  const supabase = await createClient();
  const user = await getAuthUser();
  if (!user) return [];

  const { data: follows } = await supabase
    .from("follows")
    .select("following_id")
    .eq("follower_id", user.id);

  if (!follows || follows.length === 0) return [];

  const ids = follows.map((f) => f.following_id);

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, display_name, lifter_rank, total_volume_kg, current_week_streak, achievement_count")
    .in("id", ids);

  return profiles ?? [];
});

export async function searchUsers(query: string) {
  if (!query || query.length < 2) return [];

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("search_users_by_email", {
    search_query: query,
  });

  if (error) {
    console.error("search_users_by_email error:", error);
    return [];
  }
  return data ?? [];
}

export async function followUser(followingId: string) {
  const supabase = await createClient();
  const user = await getAuthUser();
  if (!user) return { error: "Not authenticated" };
  if (user.id === followingId) return { error: "Cannot follow yourself" };

  const { error } = await supabase
    .from("follows")
    .insert({ follower_id: user.id, following_id: followingId });

  if (error) {
    if (error.code === "23505") return { error: "Already following" };
    return { error: error.message };
  }

  revalidatePath("/social");
  return { success: true };
}

export async function unfollowUser(followingId: string) {
  const supabase = await createClient();
  const user = await getAuthUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("follows")
    .delete()
    .eq("follower_id", user.id)
    .eq("following_id", followingId);

  if (error) return { error: error.message };

  revalidatePath("/social");
  return { success: true };
}
