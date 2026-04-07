"use client";

import { useState, useCallback, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { ExerciseGroup } from "@/components/workout/exercise-group";
import { ExercisePickerModal } from "@/components/workout/exercise-picker-modal";
import { RestTimer } from "@/components/workout/rest-timer";
import { SaveTemplateDialog } from "@/components/workout/save-template-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  const [sets, setSets] = useState<SetData[]>(session.workout_sets);
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
      const exerciseSets = sets.filter((s) => s.exercise_name === exerciseName);
      const lastSet = exerciseSets[exerciseSets.length - 1];
      const newSetNumber = sets.length + 1;

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
    [sets, session.id, defaultRestSeconds]
  );

  const updateTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const handleUpdate = useCallback(
    (index: number, field: SetMutableField, value: string | number) => {
      const set = sets[index];
      if (!set?.id) return;

      setSets((prev) => {
        const updated = [...prev];
        updated[index] = { ...updated[index], [field]: value };
        return updated;
      });

      const key = `${set.id}-${field}`;
      const existing = updateTimers.current.get(key);
      if (existing) clearTimeout(existing);
      updateTimers.current.set(
        key,
        setTimeout(() => {
          updateTimers.current.delete(key);
          updateSet(set.id, { [field]: value });
        }, 500)
      );
    },
    [sets]
  );

  const handleComplete = useCallback(
    async (index: number, completed: boolean) => {
      const set = sets[index];
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
            addToast(`${set.exercise_name} — new PR!`, "success");
          }
        }

        setTimerDuration(set.rest_seconds || defaultRestSeconds);
        setShowTimer(true);
      } else {
        await uncompleteSet(set.id);
      }
    },
    [sets, defaultRestSeconds, addToast]
  );

  const handleDelete = useCallback(
    async (index: number) => {
      const set = sets[index];
      if (!set?.id) return;

      setSets((prev) => prev.filter((_, i) => i !== index));
      await deleteSet(set.id);
    },
    [sets]
  );

  const handleDeleteExercise = useCallback(
    async (exerciseName: string) => {
      const exerciseSets = sets.filter((s) => s.exercise_name === exerciseName);
      setSets((prev) => prev.filter((s) => s.exercise_name !== exerciseName));
      await Promise.all(exerciseSets.map((s) => deleteSet(s.id)));
    },
    [sets]
  );

  const handleFinish = useCallback(async () => {
    setFinishing(true);
    await finishWorkout(session.id);

    const { newAchievements } = await checkAchievements(session.id);
    for (const a of newAchievements) {
      addToast(a.name, "achievement");
    }

    router.push(`/workouts/${session.id}/summary`);
  }, [session.id, router, addToast]);

  const handleDeleteSession = useCallback(async () => {
    setDeleting(true);
    const result = await deleteSession(session.id);
    if (result.error) {
      addToast(result.error, "error");
      setDeleting(false);
      setConfirmDelete(false);
    } else {
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
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-lg font-bold text-text-primary">
            {isCompleted ? "Workout Complete" : "Active Workout"}
          </h1>
          <span className="text-xs text-text-muted tabular-nums">
            {formatDate(session.started_at)}
          </span>
        </div>

        {/* Stats bar */}
        <div className="flex gap-4 text-xs text-text-secondary">
          <span>
            Sets: <span className="text-text-primary font-medium">{completedSets}/{sets.length}</span>
          </span>
          <span>
            Volume: <span className="text-text-primary font-medium">{totalVolume.toLocaleString()} kg</span>
          </span>
        </div>
      </div>

      {/* View summary link for completed workouts */}
      {isCompleted && (
        <Link
          href={`/workouts/${session.id}/summary`}
          className="block mb-4 bg-accent text-white p-3 text-center text-sm font-semibold rounded-md hover:bg-accent-hover transition-colors"
        >
          View Summary
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
      {grouped.length === 0 ? (
        <div className="bg-surface shadow-sm rounded-lg p-6 text-center text-text-muted text-sm mb-4">
          No exercises yet. Add one below.
        </div>
      ) : (
        <div className="mb-4">
          {grouped.map((group) => (
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
          ))}
        </div>
      )}

      {/* Actions */}
      {!isCompleted && (
        <div className="flex gap-2">
          <Button onClick={() => setShowExercisePicker(true)} className="flex-1">
            + Add Exercise
          </Button>
          <Button
            variant="ghost"
            onClick={handleFinish}
            disabled={finishing || sets.length === 0}
          >
            {finishing ? "Finishing..." : "Finish"}
          </Button>
        </div>
      )}

      {/* Delete workout */}
      <div className="mt-6 pt-4">
        <button onClick={() => setConfirmDelete(true)}>
          <Badge variant="destructive">Delete workout</Badge>
        </button>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={handleDeleteSession}
        title="Delete Workout"
        description="This action cannot be undone. All sets and data for this workout will be permanently removed."
        confirmLabel="Yes, delete"
        loadingLabel="Deleting..."
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
