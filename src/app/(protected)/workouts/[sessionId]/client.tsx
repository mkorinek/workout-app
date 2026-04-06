"use client";

import { useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { SetRow } from "@/components/workout/set-row";
import { RestTimer } from "@/components/workout/rest-timer";
import { SaveTemplateDialog } from "@/components/workout/save-template-dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import {
  addSet,
  completeSet,
  uncompleteSet,
  updateSet,
  deleteSet,
  finishWorkout,
} from "@/actions/sessions";
import { checkAndUpdatePR } from "@/actions/records";
import { checkAchievements } from "@/actions/achievements";
import { formatDate, calculateVolume } from "@/lib/utils";

interface SetData {
  id: string;
  exercise_name: string;
  set_number: number;
  weight_kg: number;
  reps: number;
  rest_seconds: number;
  completed: boolean;
  completed_at: string | null;
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
  const isCompleted = !!session.completed_at;

  const handleAddSet = useCallback(async () => {
    const lastSet = sets[sets.length - 1];
    const newSetNumber = sets.length + 1;

    const result = await addSet(
      session.id,
      lastSet?.exercise_name ?? "",
      newSetNumber,
      lastSet?.weight_kg ?? 0,
      lastSet?.reps ?? 0,
      defaultRestSeconds
    );

    if (result.data) {
      setSets((prev) => [...prev, result.data as SetData]);
    }
  }, [sets, session.id, defaultRestSeconds]);

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

  const handleFinish = useCallback(async () => {
    setFinishing(true);
    await finishWorkout(session.id);

    // Check achievements
    const { newAchievements } = await checkAchievements(session.id);
    for (const a of newAchievements) {
      addToast(a.name, "achievement");
    }

    // If not from a template, offer to save
    if (!session.template_id) {
      setShowSaveTemplate(true);
      setFinishing(false);
    } else {
      router.push("/workouts");
    }
  }, [session.id, session.template_id, router, addToast]);

  const completedSets = useMemo(() => sets.filter((s) => s.completed).length, [sets]);
  const totalVolume = useMemo(() => calculateVolume(sets), [sets]);

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

      {/* Sets */}
      <div className="border border-term-gray mb-4">
        <div className="border-b border-term-gray px-3 py-2 flex items-center">
          <span className="text-[10px] text-term-gray-light uppercase tracking-widest flex-1">
            # | done | exercise | kg | reps
          </span>
        </div>

        {sets.length === 0 ? (
          <div className="p-6 text-center text-term-gray-light text-xs">
            &gt; no sets yet. add one below.
          </div>
        ) : (
          sets.map((set, index) => (
            <SetRow
              key={set.id || index}
              set={set}
              onUpdate={(field, value) => handleUpdate(index, field, value)}
              onComplete={(completed) => handleComplete(index, completed)}
              onDelete={() => handleDelete(index)}
              isPR={prSets.has(set.id)}
              disabled={isCompleted}
            />
          ))
        )}
      </div>

      {/* Actions */}
      {!isCompleted && (
        <div className="flex gap-2">
          <Button onClick={handleAddSet} className="flex-1">
            + add set
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

      {/* Save template dialog */}
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
