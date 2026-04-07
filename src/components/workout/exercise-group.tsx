"use client";

import { SetRow } from "@/components/workout/set-row";
import { Button } from "@/components/ui/button";

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

interface ExerciseGroupProps {
  exerciseName: string;
  sets: SetData[];
  globalIndices: number[];
  collapsed: boolean;
  onToggleCollapse: () => void;
  onAddSet: () => void;
  onUpdateSet: (globalIndex: number, field: string, value: string | number | boolean) => void;
  onCompleteSet: (globalIndex: number, completed: boolean) => void;
  onDeleteSet: (globalIndex: number) => void;
  onDeleteExercise: () => void;
  prSets: Set<string>;
  disabled: boolean;
}

export function ExerciseGroup({
  exerciseName,
  sets,
  globalIndices,
  collapsed,
  onToggleCollapse,
  onAddSet,
  onUpdateSet,
  onCompleteSet,
  onDeleteSet,
  onDeleteExercise,
  prSets,
  disabled,
}: ExerciseGroupProps) {
  const completedCount = sets.filter((s) => s.completed).length;

  return (
    <div className="border border-term-gray mb-2">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-term-gray">
        <button
          type="button"
          onClick={onToggleCollapse}
          className="flex items-center gap-2 flex-1 min-w-0 text-left"
        >
          <span className="text-xs text-term-green uppercase tracking-widest truncate">
            {exerciseName || "unnamed exercise"}
          </span>
          <span className="text-[10px] text-term-gray-light tabular-nums shrink-0">
            {completedCount}/{sets.length}
          </span>
        </button>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onToggleCollapse}
            className="text-term-gray-light hover:text-term-white text-xs"
          >
            {collapsed ? "[+]" : "[-]"}
          </button>
          {!disabled && (
            <button
              type="button"
              onClick={onDeleteExercise}
              className="text-term-red hover:text-term-red text-xs opacity-60 hover:opacity-100"
            >
              [x]
            </button>
          )}
        </div>
      </div>

      {/* Sets */}
      {!collapsed && (
        <div>
          {sets.map((set, localIndex) => (
            <SetRow
              key={set.id || localIndex}
              set={set}
              displayNumber={localIndex + 1}
              onUpdate={(field, value) => onUpdateSet(globalIndices[localIndex], field, value)}
              onComplete={(completed) => onCompleteSet(globalIndices[localIndex], completed)}
              onDelete={() => onDeleteSet(globalIndices[localIndex])}
              isPR={prSets.has(set.id)}
              disabled={disabled}
            />
          ))}

          {/* Add set button */}
          {!disabled && (
            <div className="px-3 py-2">
              <Button size="sm" onClick={onAddSet} className="w-full">
                + add set
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
