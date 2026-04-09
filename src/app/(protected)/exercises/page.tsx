"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  getExercises,
  addExercise,
  deleteExercise,
  renameExercise,
} from "@/actions/exercises";
import { useCached } from "@/lib/cache/use-cached";
import { useAppStore } from "@/lib/cache/app-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TrashIcon, EditIcon } from "@/components/icons";
import { useToast } from "@/components/ui/toast";
import { Modal } from "@/components/ui/modal";

interface Exercise {
  id: string;
  name: string;
  created_at: string;
}

export default function ExercisesPage() {
  const exercises = (useCached("exercises", getExercises) ?? []) as Exercise[];
  const setCache = useAppStore((s) => s.set);
  const { addToast } = useToast();
  const t = useTranslations("exercises");
  const tc = useTranslations("common");
  const [newName, setNewName] = useState("");
  const [adding, setAdding] = useState(false);
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);
  const [editName, setEditName] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleAdd() {
    const trimmed = newName.trim();
    if (!trimmed) return;

    const optimisticExercise: Exercise = {
      id: `temp-${Date.now()}`,
      name: trimmed,
      created_at: new Date().toISOString(),
    };
    const prev = exercises;
    setCache(
      "exercises",
      [...exercises, optimisticExercise].sort((a, b) =>
        a.name.localeCompare(b.name),
      ),
    );
    setNewName("");
    setAdding(true);

    const result = await addExercise(trimmed);
    setAdding(false);

    if (result && "error" in result) {
      setCache("exercises", prev);
      addToast(result.error ?? t("failedToSave"), "error");
    } else {
      addToast(t("saved", { name: trimmed }), "success");
      getExercises().then((fresh) => {
        if (fresh) setCache("exercises", fresh);
      });
    }
  }

  async function handleDelete(id: string) {
    const exercise = exercises.find((e) => e.id === id);

    const result = await deleteExercise(id);
    if (result && "error" in result) {
      addToast(result.error ?? t("failedToDelete"), "error");
      return;
    }

    setCache("exercises", exercises.filter((e) => e.id !== id));
    addToast(t("exerciseRemoved"), "success");

    if (exercise) {
      const profile = useAppStore.getState().profile.data;
      const tracked = (
        profile as { tracked_exercises?: string[] } | null
      )?.tracked_exercises;
      if (tracked?.includes(exercise.name)) {
        const { updateProfile } = await import("@/actions/profile");
        const updated = tracked.filter((n) => n !== exercise.name);
        updateProfile({ tracked_exercises: updated });
      }
    }
  }

  function openEdit(exercise: Exercise) {
    setEditingExercise(exercise);
    setEditName(exercise.name);
  }

  async function handleRename() {
    if (!editingExercise) return;
    const trimmed = editName.trim();
    if (!trimmed || trimmed === editingExercise.name) {
      setEditingExercise(null);
      return;
    }

    setSaving(true);
    const result = await renameExercise(editingExercise.id, trimmed);
    setSaving(false);

    if (result && "error" in result) {
      addToast(result.error ?? t("failedToRename"), "error");
      return;
    }

    // Update cache immediately
    setCache(
      "exercises",
      exercises
        .map((e) =>
          e.id === editingExercise.id ? { ...e, name: trimmed } : e,
        )
        .sort((a, b) => a.name.localeCompare(b.name)),
    );

    // Update tracked exercises if the old name was tracked
    const oldName = editingExercise.name;
    const profile = useAppStore.getState().profile.data;
    const tracked = (
      profile as { tracked_exercises?: string[] } | null
    )?.tracked_exercises;
    if (tracked?.includes(oldName)) {
      const { updateProfile } = await import("@/actions/profile");
      updateProfile({
        tracked_exercises: tracked.map((n) => (n === oldName ? trimmed : n)),
      });
    }

    addToast(t("renamedTo", { name: trimmed }), "success");
    setEditingExercise(null);
  }

  return (
    <div className="p-4 max-w-lg mx-auto">
      <h1 className="text-lg font-bold text-text-primary mb-6">
        {t("title")}
      </h1>

      {/* Add new */}
      <div className="flex gap-2 mb-6">
        <div className="flex-1">
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder={t("placeholder")}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          />
        </div>
        <Button
          size="sm"
          onClick={handleAdd}
          disabled={!newName.trim() || adding}
        >
          {t("add")}
        </Button>
      </div>

      {exercises.length === 0 ? (
        <div className="card p-8 text-center">
          <p className="text-sm text-text-muted">{t("noExercises")}</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          {exercises.map((exercise, i) => (
            <div
              key={exercise.id}
              className={`flex items-center justify-between px-4 py-3 ${
                i < exercises.length - 1
                  ? "border-b border-border-subtle"
                  : ""
              }`}
            >
              <span className="text-sm text-text-primary flex-1 truncate">
                {exercise.name}
              </span>
              <div className="flex items-center gap-2 shrink-0 ml-2">
                <button
                  onClick={() => openEdit(exercise)}
                  className="text-text-muted hover:text-accent transition-colors p-1"
                >
                  <EditIcon size={14} />
                </button>
                <button
                  onClick={() => handleDelete(exercise.id)}
                  className="text-destructive opacity-60 hover:opacity-100 transition-opacity p-1"
                >
                  <TrashIcon size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit modal */}
      <Modal
        open={!!editingExercise}
        onClose={() => setEditingExercise(null)}
        title={t("editExercise")}
      >
        <div className="flex flex-col gap-4">
          <Input
            label={t("exerciseName")}
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleRename()}
          />
          <div className="flex gap-2">
            <Button
              onClick={handleRename}
              disabled={saving || !editName.trim()}
              className="flex-1"
            >
              {saving ? tc("saving") : tc("save")}
            </Button>
            <Button
              variant="ghost"
              onClick={() => setEditingExercise(null)}
            >
              {tc("cancel")}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
