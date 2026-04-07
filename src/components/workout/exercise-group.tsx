"use client";

import { SetRow } from "@/components/workout/set-row";
import { Button } from "@/components/ui/button";
import { ChevronDownIcon, ChevronUpIcon, TrashIcon } from "@/components/icons";
import type { SetData, SetMutableField } from "@/types/workout";

interface ExerciseGroupProps {
  exerciseName: string;
  sets: SetData[];
  globalIndices: number[];
  collapsed: boolean;
  onToggleCollapse: () => void;
  onAddSet: () => void;
  onUpdateSet: (globalIndex: number, field: SetMutableField, value: string | number) => void;
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
    <div className="card mb-3 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border-subtle">
        <button
          type="button"
          onClick={onToggleCollapse}
          className="flex items-center gap-2 flex-1 min-w-0 text-left"
        >
          <span className="text-sm font-semibold text-text-primary truncate">
            {exerciseName || "Unnamed exercise"}
          </span>
          <span className="text-xs text-text-muted tabular-nums shrink-0">
            {completedCount}/{sets.length}
          </span>
        </button>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={onToggleCollapse}
            className="text-text-muted hover:text-text-secondary transition-colors p-1"
          >
            {collapsed ? <ChevronDownIcon size={16} /> : <ChevronUpIcon size={16} />}
          </button>
          {!disabled && (
            <button
              type="button"
              onClick={onDeleteExercise}
              className="text-destructive opacity-60 hover:opacity-100 transition-opacity p-1"
            >
              <TrashIcon size={14} />
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
                + Add set
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
