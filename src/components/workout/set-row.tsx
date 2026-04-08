"use client";

import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ChevronDownIcon, ChevronUpIcon, TrashIcon } from "@/components/icons";
import type { SetData, SetMutableField } from "@/types/workout";

interface SetRowProps {
  set: SetData;
  displayNumber?: number;
  onUpdate: (field: SetMutableField, value: string | number) => void;
  onComplete: (completed: boolean) => void;
  onDelete: () => void;
  isPR?: boolean;
  disabled?: boolean;
}

export function SetRow({ set, displayNumber, onUpdate, onComplete, onDelete, isPR, disabled }: SetRowProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className={`border-b border-border-subtle py-3 px-3 ${
        set.completed ? "opacity-60" : ""
      }`}
    >
      <div className="flex items-center gap-3">
        {/* Set number */}
        <span className="text-xs text-text-muted w-5 shrink-0 tabular-nums">
          {displayNumber ?? set.set_number}
        </span>

        {/* Checkbox */}
        <Checkbox
          checked={set.completed}
          onChange={onComplete}
          disabled={disabled}
        />

        {/* Weight */}
        <div className="w-20 shrink-0">
          <input
            type="text"
            inputMode="decimal"
            pattern="[0-9]*\.?[0-9]*"
            value={set.weight_kg || ""}
            onChange={(e) => {
              const v = e.target.value;
              if (v === "" || /^\d*\.?\d*$/.test(v)) {
                onUpdate("weight_kg", v === "" ? 0 : v);
              }
            }}
            placeholder="kg"
            className="bg-surface-elevated shadow-sm border-0 rounded-sm text-text-primary text-sm py-1.5 px-2 w-full text-right focus:border-accent focus:ring-1 focus:ring-accent outline-none placeholder:text-text-muted tabular-nums"
            disabled={disabled}
          />
        </div>

        {/* Reps */}
        <div className="w-16 shrink-0">
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={set.reps || ""}
            onChange={(e) => {
              const v = e.target.value;
              if (v === "" || /^\d+$/.test(v)) {
                onUpdate("reps", v === "" ? 0 : parseInt(v));
              }
            }}
            placeholder="reps"
            className="bg-surface-elevated shadow-sm border-0 rounded-sm text-text-primary text-sm py-1.5 px-2 w-full text-right focus:border-accent focus:ring-1 focus:ring-accent outline-none placeholder:text-text-muted tabular-nums"
            disabled={disabled}
          />
        </div>

        {/* PR badge */}
        {isPR && <Badge variant="warning">PR</Badge>}

        {/* Note indicator */}
        {set.note && !expanded && (
          <span className="text-[10px] text-accent-pink shrink-0">*</span>
        )}

        {/* Expand for note */}
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="text-text-muted hover:text-text-secondary transition-colors shrink-0"
        >
          {expanded ? <ChevronUpIcon size={16} /> : <ChevronDownIcon size={16} />}
        </button>

        {/* Delete */}
        {!disabled && (
          <button
            type="button"
            onClick={onDelete}
            className="text-destructive shrink-0 opacity-60 hover:opacity-100 transition-opacity"
          >
            <TrashIcon size={14} />
          </button>
        )}
      </div>

      {/* Expanded: note + rest time */}
      {expanded && (
        <div className="mt-3 ml-8 flex flex-col gap-2">
          <input
            type="text"
            value={set.note ?? ""}
            onChange={(e) => onUpdate("note", e.target.value)}
            placeholder="Add a note..."
            className="bg-surface-elevated shadow-sm border-0 rounded-sm text-text-primary text-xs py-1.5 px-2 w-full focus:border-accent outline-none placeholder:text-text-muted"
            disabled={disabled}
          />
          <div className="flex items-center gap-2">
            <span className="text-xs text-text-muted">Rest</span>
            <input
              type="number"
              value={set.rest_seconds}
              onChange={(e) => onUpdate("rest_seconds", parseInt(e.target.value) || 60)}
              className="bg-surface-elevated shadow-sm border-0 rounded-sm text-text-primary text-xs py-1.5 px-2 w-14 text-right focus:border-accent outline-none tabular-nums"
              disabled={disabled}
            />
            <span className="text-xs text-text-muted">s</span>
          </div>
        </div>
      )}
    </div>
  );
}
