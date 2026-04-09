"use server";

import { createClient, getAuthUser } from "@/lib/supabase/server";
import { cache } from "react";

export async function searchExercises(query: string) {
  const supabase = await createClient();
  const user = await getAuthUser();
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
  const user = await getAuthUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("exercises")
    .upsert({ user_id: user.id, name: name.trim() }, { onConflict: "user_id,name" });

  if (error) return { error: error.message };

  return { success: true };
}

export const getExercises = cache(async () => {
  const supabase = await createClient();
  const user = await getAuthUser();
  if (!user) return [];

  const { data } = await supabase
    .from("exercises")
    .select("*")
    .eq("user_id", user.id)
    .order("name");

  return data ?? [];
});

export async function renameExercise(id: string, newName: string) {
  const supabase = await createClient();
  const user = await getAuthUser();
  if (!user) return { error: "Not authenticated" };

  const trimmed = newName.trim();
  if (!trimmed) return { error: "Name cannot be empty" };

  // Get old name
  const { data: exercise } = await supabase
    .from("exercises")
    .select("name")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!exercise) return { error: "Exercise not found" };

  const oldName = exercise.name;
  if (oldName === trimmed) return { success: true };

  // Update exercise name
  const { error } = await supabase
    .from("exercises")
    .update({ name: trimmed })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { error: error.message };

  // Also rename in all workout sets
  await supabase
    .from("workout_sets")
    .update({ exercise_name: trimmed })
    .eq("exercise_name", oldName);

  // Also rename in personal records
  await supabase
    .from("personal_records")
    .update({ exercise_name: trimmed })
    .eq("user_id", user.id)
    .eq("exercise_name", oldName);

  return { success: true, oldName };
}

export async function deleteExercise(id: string) {
  const supabase = await createClient();
  const user = await getAuthUser();
  if (!user) return { error: "Not authenticated" };

  // Get the exercise name first
  const { data: exercise } = await supabase
    .from("exercises")
    .select("name")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!exercise) return { error: "Exercise not found" };

  // Check if used in any workout sets
  const { count } = await supabase
    .from("workout_sets")
    .select("id", { count: "exact", head: true })
    .eq("exercise_name", exercise.name)
    .limit(1);

  if (count && count > 0) {
    return { error: "Cannot delete — exercise is used in workouts" };
  }

  const { error } = await supabase
    .from("exercises")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { error: error.message };

  return { success: true, deletedName: exercise.name };
}
