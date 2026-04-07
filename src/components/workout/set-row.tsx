"use client";

import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";

interface SetData {
  id?: string;
  exercise_name: string;
  set_number: number;
  weight_kg: number;
  reps: number;
  rest_seconds: number;
  completed: boolean;
  note?: string | null;
}

interface SetRowProps {
  set: SetData;
  displayNumber?: number;
  onUpdate: (field: string, value: string | number | boolean) => void;
  onComplete: (completed: boolean) => void;
  onDelete: () => void;
  isPR?: boolean;
  disabled?: boolean;
}

export function SetRow({ set, displayNumber, onUpdate, onComplete, onDelete, isPR, disabled }: SetRowProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className={`border-b border-term-gray py-3 px-2 ${
        set.completed ? "opacity-60" : ""
      }`}
    >
      <div className="flex items-center gap-3">
        {/* Set number */}
        <span className="text-[10px] text-term-gray-light w-6 shrink-0 tabular-nums">
          #{displayNumber ?? set.set_number}
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
            type="number"
            value={set.weight_kg || ""}
            onChange={(e) => onUpdate("weight_kg", parseFloat(e.target.value) || 0)}
            placeholder="kg"
            className="bg-transparent border-b border-term-gray text-term-white font-mono text-sm py-1 w-full text-right focus:border-term-green outline-none placeholder:text-term-gray tabular-nums"
            disabled={disabled}
          />
        </div>

        {/* Reps */}
        <div className="w-16 shrink-0">
          <input
            type="number"
            value={set.reps || ""}
            onChange={(e) => onUpdate("reps", parseInt(e.target.value) || 0)}
            placeholder="reps"
            className="bg-transparent border-b border-term-gray text-term-white font-mono text-sm py-1 w-full text-right focus:border-term-green outline-none placeholder:text-term-gray tabular-nums"
            disabled={disabled}
          />
        </div>

        {/* PR badge */}
        {isPR && <Badge variant="amber">PR</Badge>}

        {/* Note indicator */}
        {set.note && !expanded && (
          <span className="text-[10px] text-term-amber shrink-0">*</span>
        )}

        {/* Expand for note */}
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="text-term-gray-light hover:text-term-white text-xs shrink-0"
        >
          {expanded ? "[-]" : "[+]"}
        </button>

        {/* Delete */}
        {!disabled && (
          <button
            type="button"
            onClick={onDelete}
            className="text-term-red text-xs shrink-0 opacity-60 hover:opacity-100"
          >
            [x]
          </button>
        )}
      </div>

      {/* Expanded: note + rest time */}
      {expanded && (
        <div className="mt-2 ml-9 flex flex-col gap-2">
          {/* Note */}
          <div>
            <input
              type="text"
              value={set.note ?? ""}
              onChange={(e) => onUpdate("note", e.target.value)}
              placeholder="note (e.g. felt heavy, too easy...)"
              className="bg-transparent border-b border-term-gray text-term-white font-mono text-xs py-1 w-full focus:border-term-green outline-none placeholder:text-term-gray"
              disabled={disabled}
            />
          </div>

          {/* Rest time */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-term-gray-light uppercase tracking-widest">
              rest
            </span>
            <input
              type="number"
              value={set.rest_seconds}
              onChange={(e) => onUpdate("rest_seconds", parseInt(e.target.value) || 60)}
              className="bg-transparent border-b border-term-gray text-term-white font-mono text-xs py-1 w-12 text-right focus:border-term-green outline-none tabular-nums"
              disabled={disabled}
            />
            <span className="text-[10px] text-term-gray-light">s</span>
          </div>
        </div>
      )}
    </div>
  );
}
