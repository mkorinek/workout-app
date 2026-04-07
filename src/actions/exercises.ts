"use server";

import { createClient } from "@/lib/supabase/server";
import { cache } from "react";

export async function searchExercises(query: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from("exercises")
    .select("name")
    .eq("user_id", user.id)
    .ilike("name", `%${query}%`)
    .order("name")
    .limit(10);

  return data?.map((e) => e.name) ?? [];
}

export async function addExercise(name: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("exercises")
    .upsert({ user_id: user.id, name: name.trim() }, { onConflict: "user_id,name" });

  if (error) return { error: error.message };

  return { success: true };
}

export const getExercises = cache(async () => {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from("exercises")
    .select("*")
    .eq("user_id", user.id)
    .order("name");

  return data ?? [];
});

export async function deleteExercise(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("exercises")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { error: error.message };

  return { success: true };
}
