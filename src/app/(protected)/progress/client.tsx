"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { ExerciseChart } from "@/components/progress/exercise-chart";
import { ExercisePickerModal } from "@/components/workout/exercise-picker-modal";
import { updateProfile } from "@/actions/profile";
import { useAppStore } from "@/lib/cache/app-store";
import { useToast } from "@/components/ui/toast";

interface ProgressClientProps {
  exerciseNames: string[];
  savedTracked: string[];
}

const MAX_TRACKED = 4;

export function ProgressClient({
  savedTracked,
}: ProgressClientProps) {
  const [trackedExercises, setTrackedExercises] = useState<string[]>(() =>
    savedTracked.length > 0
      ? savedTracked.slice(0, MAX_TRACKED)
      : [],
  );
  const [selectedExercise, setSelectedExercise] = useState(
    () => savedTracked[0] ?? "",
  );
  const [metric, setMetric] = useState<
    "maxWeight" | "totalVolume" | "maxReps"
  >("maxWeight");
  const [pickerOpen, setPickerOpen] = useState(false);
  const invalidate = useAppStore((s) => s.invalidate);
  const { addToast } = useToast();
  const t = useTranslations("progress");

  // Sync from server when savedTracked changes (e.g. after cache refresh)
  useEffect(() => {
    if (savedTracked.length > 0) {
      setTrackedExercises(savedTracked.slice(0, MAX_TRACKED));
      setSelectedExercise((prev) =>
        savedTracked.includes(prev) ? prev : savedTracked[0],
      );
    }
  }, [savedTracked]);

  const persistTracked = useCallback(
    (exercises: string[]) => {
      updateProfile({ tracked_exercises: exercises }).then((result) => {
        invalidate("profile");
        if (result && "success" in result) {
          addToast(t("exercisesSaved"), "success");
        }
      });
    },
    [invalidate, addToast],
  );

  function handleAddExercise(name: string) {
    if (trackedExercises.includes(name)) {
      setSelectedExercise(name);
      return;
    }
    if (trackedExercises.length >= MAX_TRACKED) return;
    const next = [...trackedExercises, name];
    setTrackedExercises(next);
    setSelectedExercise(name);
    persistTracked(next);
  }

  function handleRemoveExercise(name: string) {
    const next = trackedExercises.filter((n) => n !== name);
    setTrackedExercises(next);
    if (selectedExercise === name) {
      setSelectedExercise(next[0] ?? "");
    }
    persistTracked(next);
  }

  if (trackedExercises.length === 0) {
    return (
      <div className="card p-6 text-center">
        <p className="text-sm text-text-muted mb-3">
          {t("trackExercises")}
        </p>
        <button
          onClick={() => setPickerOpen(true)}
          className="px-4 py-2 text-sm font-medium bg-accent text-white rounded-lg hover:bg-accent-hover transition-colors"
        >
          {t("addExercise")}
        </button>
        <ExercisePickerModal
          open={pickerOpen}
          onClose={() => setPickerOpen(false)}
          onSelect={handleAddExercise}
        />
      </div>
    );
  }

  return (
    <div className="card p-4">
      {/* Exercise selector */}
      <div className="flex gap-2 mb-4 overflow-x-auto w-full">
        {trackedExercises.map((name) => (
          <div
            key={name}
            className={`flex items-center gap-1 text-xs border rounded-full whitespace-nowrap transition-colors ${
              selectedExercise === name
                ? "border-accent text-accent bg-accent-muted"
                : "border-border text-text-muted hover:text-text-secondary"
            }`}
          >
            <button
              onClick={() => setSelectedExercise(name)}
              className="pl-3 py-1.5"
            >
              {name}
            </button>
            <button
              onClick={() => handleRemoveExercise(name)}
              className="pr-2 py-1.5 opacity-50 hover:opacity-100 transition-opacity"
            >
              ✕
            </button>
          </div>
        ))}
        {trackedExercises.length < MAX_TRACKED && (
          <button
            onClick={() => setPickerOpen(true)}
            className="text-xs px-3 py-1.5 border border-dashed border-border text-text-muted rounded-full whitespace-nowrap hover:border-accent hover:text-accent transition-colors"
          >
            {t("addExercise")}
          </button>
        )}
      </div>

      {/* Metric selector */}
      {trackedExercises.length > 0 && (
        <div className="flex gap-1 mb-4 bg-surface-elevated rounded-sm p-0.5 w-full">
          {(["maxWeight", "totalVolume", "maxReps"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMetric(m)}
              className={`text-xs px-3 py-1.5 rounded-sm transition-colors flex-1 ${
                metric === m
                  ? "bg-accent text-white font-medium"
                  : "text-text-muted hover:text-text-secondary"
              }`}
            >
              {m === "maxWeight"
                ? t("weight")
                : m === "totalVolume"
                  ? t("volumeMetric")
                  : t("reps")}
            </button>
          ))}
        </div>
      )}

      {selectedExercise && trackedExercises.includes(selectedExercise) && (
        <ExerciseChart exerciseName={selectedExercise} metric={metric} />
      )}

      <ExercisePickerModal
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={handleAddExercise}
      />
    </div>
  );
}
