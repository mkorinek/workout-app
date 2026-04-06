"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function getTemplates() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from("workout_templates")
    .select("*")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });

  return data ?? [];
}

export async function getTemplate(templateId: string) {
  const supabase = await createClient();

  const { data } = await supabase
    .from("workout_templates")
    .select("*")
    .eq("id", templateId)
    .single();

  return data;
}

export async function createTemplate(
  name: string,
  exercises: { exercise_name: string; sets: number; reps: number }[]
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { data, error } = await supabase
    .from("workout_templates")
    .insert({
      user_id: user.id,
      name,
      exercises,
    })
    .select("id")
    .single();

  if (error) return { error: error.message };
  revalidatePath("/templates");
  return { id: data.id };
}

export async function createTemplateFromSession(sessionId: string, name: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  // Get all sets from this session
  const { data: sets } = await supabase
    .from("workout_sets")
    .select("exercise_name, set_number, reps")
    .eq("session_id", sessionId)
    .order("set_number");

  if (!sets || sets.length === 0) return { error: "No sets found" };

  // Group by exercise
  const exerciseMap = new Map<string, { sets: number; reps: number }>();
  for (const set of sets) {
    const existing = exerciseMap.get(set.exercise_name);
    if (existing) {
      existing.sets++;
      existing.reps = Math.max(existing.reps, set.reps);
    } else {
      exerciseMap.set(set.exercise_name, { sets: 1, reps: set.reps });
    }
  }

  const exercises = Array.from(exerciseMap.entries()).map(([name, data]) => ({
    exercise_name: name,
    sets: data.sets,
    reps: data.reps,
  }));

  const { data, error } = await supabase
    .from("workout_templates")
    .insert({
      user_id: user.id,
      name,
      exercises,
    })
    .select("id")
    .single();

  if (error) return { error: error.message };
  revalidatePath("/templates");
  return { id: data.id };
}

export async function updateTemplate(
  templateId: string,
  updates: { name?: string; exercises?: { exercise_name: string; sets: number; reps: number }[] }
) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("workout_templates")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", templateId);

  if (error) return { error: error.message };
  revalidatePath("/templates");
  return { success: true };
}

export async function deleteTemplate(templateId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("workout_templates")
    .delete()
    .eq("id", templateId);

  if (error) return { error: error.message };
  revalidatePath("/templates");
  return { success: true };
}
