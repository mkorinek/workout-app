"use client";

import { useTranslations } from "next-intl";
import { SetRow } from "@/components/workout/set-row";
import { Button } from "@/components/ui/button";
import { ChevronDownIcon, ChevronUpIcon, TrashIcon } from "@/components/icons";
import { ExerciseImage } from "@/components/ui/exercise-image";
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
  const t = useTranslations("exerciseGroup");
  const completedCount = sets.filter((s) => s.completed).length;

  return (
    <div className="card mb-3 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-accent/20 bg-accent/[0.04]">
        <button
          type="button"
          onClick={onToggleCollapse}
          className="flex items-center gap-2.5 flex-1 min-w-0 text-left"
        >
          <ExerciseImage
            exerciseName={exerciseName}
            size={40}
            className="rounded-md"
          />
          <div className="min-w-0">
            <span className="text-sm font-semibold text-text-primary truncate block">
              {exerciseName || t("unnamed")}
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-accent/60 tabular-nums">
              {t("setsProgress", { completed: completedCount, total: sets.length })}
            </span>
          </div>
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
              className="text-destructive opacity-60 hover:opacity-100 transition-opacity p-1 cursor-pointer"
            >
              <TrashIcon size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Column headers */}
      {!collapsed && (
        <div className="flex items-center px-3 py-1.5 border-b border-border-subtle">
          <span className="text-[10px] text-text-muted w-5 shrink-0 text-center">{t("setNumber")}</span>
          <div className="ml-2 w-5 shrink-0" />
          <div className="flex-1 flex items-center justify-center gap-2 mx-3">
            <span className="flex-1 text-[10px] text-text-muted text-center">{t("kg")}</span>
            <span className="text-[10px] text-text-muted shrink-0 invisible">×</span>
            <span className="flex-1 text-[10px] text-text-muted text-center">{t("reps")}</span>
          </div>
          <div className="w-20 shrink-0" />
        </div>
      )}

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
                {t("addSet")}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
