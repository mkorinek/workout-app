"use client";

import { useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ExerciseGroup } from "@/components/workout/exercise-group";
import { ExercisePickerModal } from "@/components/workout/exercise-picker-modal";
import { RestTimer } from "@/components/workout/rest-timer";
import { SaveTemplateDialog } from "@/components/workout/save-template-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import Link from "next/link";

interface SetData {
  id: string;
  exercise_name: string;
  set_number: number;
  weight_kg: number;
  reps: number;
  rest_seconds: number;
  completed: boolean;
  completed_at: string | null;
  note?: string | null;
}

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
      // Find last set for this exercise to copy weight/reps
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

  const handleUpdate = useCallback(
    async (index: number, field: string, value: string | number | boolean) => {
      const set = sets[index];
      if (!set?.id) return;

      setSets((prev) => {
        const updated = [...prev];
        updated[index] = { ...updated[index], [field]: value };
        return updated;
      });

      await updateSet(set.id, { [field]: value });
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

        // Check for PRs
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

        // Start rest timer
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

    // Check achievements
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
          <h1 className="text-xs text-term-green uppercase tracking-widest">
            {isCompleted ? "> workout complete" : "> active workout"}
          </h1>
          <span className="text-[10px] text-term-gray-light tabular-nums">
            {formatDate(session.started_at)}
          </span>
        </div>

        {/* Stats bar */}
        <div className="flex gap-4 text-[10px] text-term-gray-light uppercase tracking-widest">
          <span>
            sets: <span className="text-term-white">{completedSets}/{sets.length}</span>
          </span>
          <span>
            vol: <span className="text-term-white">{totalVolume.toLocaleString()}kg</span>
          </span>
        </div>
      </div>

      {/* View summary link for completed workouts */}
      {isCompleted && (
        <Link
          href={`/workouts/${session.id}/summary`}
          className="block mb-4 border border-term-green p-3 text-center text-xs text-term-green uppercase tracking-widest hover:bg-term-green hover:text-term-black transition-colors"
        >
          view summary
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
        <div className="border border-term-gray p-6 text-center text-term-gray-light text-xs mb-4">
          &gt; no exercises yet. add one below.
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
            + add exercise
          </Button>
          <Button
            variant="ghost"
            onClick={handleFinish}
            disabled={finishing || sets.length === 0}
          >
            {finishing ? "finishing..." : "finish"}
          </Button>
        </div>
      )}

      {/* Delete workout */}
      <div className="mt-4 border-t border-term-gray pt-4">
        <button onClick={() => setConfirmDelete(true)}>
          <Badge variant="red">delete workout</Badge>
        </button>
      </div>

      {/* Delete confirmation modal */}
      {confirmDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          onClick={() => { if (!deleting) setConfirmDelete(false); }}
        >
          <div className="absolute inset-0 bg-black/80" />
          <div
            className="relative border border-term-red bg-term-black p-6 max-w-sm w-[calc(100%-2rem)]"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-xs text-term-red uppercase tracking-widest mb-1 font-bold">
              &gt; delete workout
            </p>
            <p className="text-[10px] text-term-gray-light mb-6">
              this action cannot be undone. all sets and data for this workout will be permanently removed.
            </p>
            <div className="flex gap-2">
              <Button
                variant="danger"
                size="sm"
                className="flex-1"
                onClick={handleDeleteSession}
                disabled={deleting}
              >
                {deleting ? "deleting..." : "yes, delete"}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="flex-1"
                onClick={() => setConfirmDelete(false)}
                disabled={deleting}
              >
                cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Exercise picker modal */}
      <ExercisePickerModal
        open={showExercisePicker}
        onClose={() => setShowExercisePicker(false)}
        onSelect={handleAddExercise}
      />

      {/* Save template dialog (for completed non-template workouts viewed directly) */}
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
