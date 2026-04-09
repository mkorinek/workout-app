"use client";

import { useState, useCallback, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { ExerciseGroup } from "@/components/workout/exercise-group";
import { ExercisePickerModal } from "@/components/workout/exercise-picker-modal";
import { RestTimer } from "@/components/workout/rest-timer";
import { SaveTemplateDialog } from "@/components/workout/save-template-dialog";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useToast } from "@/components/ui/toast";
import {
  addSet,
  completeSet,
  uncompleteSet,
  updateSet,
  deleteSet,
  deleteSession,
  finishWorkout,
} from "@/actions/sessions";
import { checkAndUpdatePR } from "@/actions/records";
import { checkAchievements } from "@/actions/achievements";
import { withInvalidation } from "@/lib/cache/invalidate";
import { useAppStore } from "@/lib/cache/app-store";
import { formatDate, calculateVolume } from "@/lib/utils";
import type { SetData, SetMutableField } from "@/types/workout";
import Link from "next/link";

interface WorkoutSessionClientProps {
  session: {
    id: string;
    template_id: string | null;
    started_at: string;
    completed_at: string | null;
    workout_sets: SetData[];
  };
  defaultRestSeconds: number;
  timerSound: boolean;
  timerVibration: boolean;
  timerFlash: boolean;
}

interface ExerciseGroupData {
  exerciseName: string;
  sets: SetData[];
  globalIndices: number[];
}

function groupSetsByExercise(sets: SetData[]): ExerciseGroupData[] {
  const groups = new Map<string, { sets: SetData[]; globalIndices: number[] }>();

  sets.forEach((set, index) => {
    const key = set.exercise_name;
    if (!groups.has(key)) {
      groups.set(key, { sets: [], globalIndices: [] });
    }
    const group = groups.get(key)!;
    group.sets.push(set);
    group.globalIndices.push(index);
  });

  return Array.from(groups.entries()).map(([exerciseName, data]) => ({
    exerciseName,
    ...data,
  }));
}

export function WorkoutSessionClient({
  session,
  defaultRestSeconds,
  timerSound,
  timerVibration,
  timerFlash,
}: WorkoutSessionClientProps) {
  const router = useRouter();
  const { addToast } = useToast();
  const t = useTranslations("activeWorkout");
  const tc = useTranslations("common");
  const [sets, setSets] = useState<SetData[]>(session.workout_sets);
  const setsRef = useRef(sets);
  setsRef.current = sets;
  const [showTimer, setShowTimer] = useState(false);
  const [timerDuration, setTimerDuration] = useState(defaultRestSeconds);
  const [prSets, setPrSets] = useState<Set<string>>(new Set());
  const [showSaveTemplate, setShowSaveTemplate] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showExercisePicker, setShowExercisePicker] = useState(false);
  const [collapsedExercises, setCollapsedExercises] = useState<Set<string>>(new Set());
  const isCompleted = !!session.completed_at;

  const handleAddExercise = useCallback(
    async (exerciseName: string) => {
      const newSetNumber = sets.length + 1;
      const result = await addSet(
        session.id,
        exerciseName,
        newSetNumber,
        0,
        0,
        defaultRestSeconds
      );

      if (result.data) {
        setSets((prev) => [...prev, result.data as SetData]);
      }
    },
    [sets.length, session.id, defaultRestSeconds]
  );

  const handleAddSetForExercise = useCallback(
    async (exerciseName: string) => {
      const currentSets = setsRef.current;
      const exerciseSets = currentSets.filter((s) => s.exercise_name === exerciseName);
      const lastSet = exerciseSets[exerciseSets.length - 1];
      const newSetNumber = currentSets.length + 1;

      const result = await addSet(
        session.id,
        exerciseName,
        newSetNumber,
        lastSet?.weight_kg ?? 0,
        lastSet?.reps ?? 0,
        lastSet?.rest_seconds ?? defaultRestSeconds
      );

      if (result.data) {
        setSets((prev) => [...prev, result.data as SetData]);
      }
    },
    [session.id, defaultRestSeconds]
  );

  const updateTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const handleUpdate = useCallback(
    (index: number, field: SetMutableField, value: string | number) => {
      const set = setsRef.current[index];
      if (!set?.id) return;

      const numValue = typeof value === "string" ? parseFloat(value) : value;
      const parsed = isNaN(numValue) || numValue < 0 ? 0 : numValue;

      setSets((prev) => {
        const updated = [...prev];
        updated[index] = { ...updated[index], [field]: parsed };
        return updated;
      });

      const key = `${set.id}-${field}`;
      const existing = updateTimers.current.get(key);
      if (existing) clearTimeout(existing);
      updateTimers.current.set(
        key,
        setTimeout(() => {
          updateTimers.current.delete(key);
          updateSet(set.id, { [field]: parsed });
        }, 500)
      );
    },
    []
  );

  const handleComplete = useCallback(
    async (index: number, completed: boolean) => {
      const set = setsRef.current[index];
      if (!set?.id) return;

      setSets((prev) => {
        const updated = [...prev];
        updated[index] = { ...updated[index], completed };
        return updated;
      });

      if (completed) {
        await completeSet(set.id);

        if (set.weight_kg > 0 && set.reps > 0) {
          const { newPRs } = await checkAndUpdatePR(
            set.exercise_name,
            set.weight_kg,
            set.reps,
            set.id
          );

          if (newPRs.length > 0) {
            setPrSets((prev) => new Set([...prev, set.id]));
            addToast(t("newPR", { exercise: set.exercise_name }), "success");
          }
        }

        setTimerDuration(set.rest_seconds || defaultRestSeconds);
        if (set.rest_seconds !== 0) {
          setShowTimer(true);
        }
      } else {
        await uncompleteSet(set.id);
      }
    },
    [defaultRestSeconds, addToast]
  );

  const handleDelete = useCallback(
    async (index: number) => {
      const set = setsRef.current[index];
      if (!set?.id) return;

      setSets((prev) => prev.filter((_, i) => i !== index));
      await deleteSet(set.id);
    },
    []
  );

  const handleDeleteExercise = useCallback(
    async (exerciseName: string) => {
      const exerciseSets = setsRef.current.filter((s) => s.exercise_name === exerciseName);
      setSets((prev) => prev.filter((s) => s.exercise_name !== exerciseName));
      await Promise.all(exerciseSets.map((s) => deleteSet(s.id)));
    },
    []
  );

  const handleFinish = useCallback(async () => {
    setFinishing(true);
    await withInvalidation(
      () => finishWorkout(session.id),
      "sessions", "profile", "records", "achievements", "streakData"
    );

    const { newAchievements } = await checkAchievements(session.id);
    for (const a of newAchievements) {
      addToast(a.name, "achievement");
    }

    router.push(`/workouts/${session.id}/summary`);
  }, [session.id, router, addToast]);

  const handleDeleteSession = useCallback(async () => {
    setDeleting(true);
    const store = useAppStore.getState();
    const current = store.sessions.data;
    if (current) {
      store.set("sessions", current.filter((s) => s.id !== session.id));
    }
    const result = await deleteSession(session.id);
    if (result.error) {
      if (current) store.set("sessions", current);
      addToast(result.error, "error");
      setDeleting(false);
      setConfirmDelete(false);
    } else {
      store.invalidate("sessions");
      router.push("/workouts");
    }
  }, [session.id, router, addToast]);

  const toggleCollapse = useCallback((exerciseName: string) => {
    setCollapsedExercises((prev) => {
      const next = new Set(prev);
      if (next.has(exerciseName)) {
        next.delete(exerciseName);
      } else {
        next.add(exerciseName);
      }
      return next;
    });
  }, []);

  const completedSets = useMemo(() => sets.filter((s) => s.completed).length, [sets]);
  const totalVolume = useMemo(() => calculateVolume(sets), [sets]);
  const grouped = useMemo(() => groupSetsByExercise(sets), [sets]);

  return (
    <div className="p-4 max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-lg font-bold text-text-primary">
          {isCompleted ? t("complete") : t("active")}
        </h1>
        <span className="text-xs text-text-muted tabular-nums">
          {formatDate(session.started_at)}
        </span>
      </div>

      {/* Stats */}
      <div className="mb-6">
        <p className="text-xs font-medium text-text-secondary mb-3">
          {t("overview")}
        </p>
        <div className="card overflow-hidden">
          <div className="flex items-center px-4 py-2.5 border-b border-accent/20 bg-accent/[0.04]">
            <span className="flex-1 text-[10px] font-semibold uppercase tracking-wider text-accent/60">
              {t("sets")}
            </span>
            <span className="w-24 text-right text-[10px] font-semibold uppercase tracking-wider text-accent/60">
              {t("volume")}
            </span>
          </div>
          <div className="flex items-center px-4 py-3">
            <span className="flex-1 text-sm font-medium tabular-nums text-accent">
              {completedSets}/{sets.length}
            </span>
            <span className="w-24 text-right text-sm font-medium tabular-nums text-accent">
              {totalVolume.toLocaleString()} {tc("kg")}
            </span>
          </div>
        </div>
      </div>

      {/* View summary link */}
      {isCompleted && (
        <Link
          href={`/workouts/${session.id}/summary`}
          className="block mb-6 bg-accent text-white p-3 text-center text-sm font-semibold rounded-md hover:bg-accent-hover transition-colors"
        >
          {t("viewSummary")}
        </Link>
      )}

      {/* Rest Timer */}
      {showTimer && (
        <div className="mb-4">
          <RestTimer
            duration={timerDuration}
            onComplete={() => setShowTimer(false)}
            onSkip={() => setShowTimer(false)}
            timerSound={timerSound}
            timerVibration={timerVibration}
            timerFlash={timerFlash}
          />
        </div>
      )}

      {/* Exercise Groups */}
      <div className="mb-6">
        <p className="text-xs font-medium text-text-secondary mb-3">
          {t("exercises")}
        </p>
        {grouped.length === 0 ? (
          <div className="card p-6 text-center text-text-muted text-sm">
            {t("noExercises")}
          </div>
        ) : (
          grouped.map((group) => (
            <ExerciseGroup
              key={group.exerciseName}
              exerciseName={group.exerciseName}
              sets={group.sets}
              globalIndices={group.globalIndices}
              collapsed={collapsedExercises.has(group.exerciseName)}
              onToggleCollapse={() => toggleCollapse(group.exerciseName)}
              onAddSet={() => handleAddSetForExercise(group.exerciseName)}
              onUpdateSet={handleUpdate}
              onCompleteSet={handleComplete}
              onDeleteSet={handleDelete}
              onDeleteExercise={() => handleDeleteExercise(group.exerciseName)}
              prSets={prSets}
              disabled={isCompleted}
            />
          ))
        )}
      </div>

      {/* Actions */}
      {!isCompleted && (
        <div className="flex gap-2 mb-4">
          <Button onClick={() => setShowExercisePicker(true)} className="flex-1">
            {t("addExercise")}
          </Button>
          <Button
            variant="success"
            onClick={handleFinish}
            disabled={finishing || sets.length === 0}
          >
            {finishing ? t("finishing") : t("finish")}
          </Button>
        </div>
      )}

      {/* Delete workout */}
      <div className="mb-4">
        <button
          onClick={() => setConfirmDelete(true)}
          className="text-xs text-destructive/60 hover:text-destructive transition-colors"
        >
          {t("deleteWorkout")}
        </button>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={handleDeleteSession}
        title={t("deleteTitle")}
        description={t("deleteDescription")}
        confirmLabel={t("yesDelete")}
        loadingLabel={t("deleting")}
        loading={deleting}
      />

      <ExercisePickerModal
        open={showExercisePicker}
        onClose={() => setShowExercisePicker(false)}
        onSelect={handleAddExercise}
      />

      <SaveTemplateDialog
        open={showSaveTemplate}
        onClose={() => {
          setShowSaveTemplate(false);
          router.push("/workouts");
        }}
        sessionId={session.id}
      />
    </div>
  );
}
