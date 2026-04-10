"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
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
  const t = useTranslations("setRow");
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className={`border-b border-border-subtle transition-opacity ${
        set.completed ? "opacity-50" : ""
      }`}
    >
      <div className="flex items-center px-3 py-2.5">
        {/* Left: number + checkbox */}
        <span className="text-[10px] text-text-muted w-5 shrink-0 tabular-nums text-center">
          {displayNumber ?? set.set_number}
        </span>
        <div className="ml-2 shrink-0">
          <Checkbox
            checked={set.completed}
            onChange={onComplete}
            disabled={disabled}
          />
        </div>

        {/* Center: weight + reps inputs */}
        <div className="flex-1 flex items-center justify-center gap-2 mx-3">
          <input
            type="text"
            inputMode="decimal"
            pattern="[0-9]*\.?[0-9]*"
            value={set.weight_kg != null && set.weight_kg !== 0 ? set.weight_kg : ""}
            onChange={(e) => {
              const v = e.target.value;
              if (v === "" || /^\d*\.?\d*$/.test(v)) {
                onUpdate("weight_kg", v === "" ? 0 : v);
              }
            }}
            placeholder="0"
            className="w-0 flex-1 bg-surface-elevated rounded-sm text-text-primary text-sm py-1.5 px-2 text-center focus:ring-1 focus:ring-accent outline-none border-0 placeholder:text-text-muted/40 tabular-nums"
            disabled={disabled}
          />
          <span className="text-[10px] text-text-muted shrink-0">×</span>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={set.reps != null && set.reps !== 0 ? set.reps : ""}
            onChange={(e) => {
              const v = e.target.value;
              if (v === "" || /^\d+$/.test(v)) {
                onUpdate("reps", v === "" ? 0 : parseInt(v));
              }
            }}
            placeholder="0"
            className="w-0 flex-1 bg-surface-elevated rounded-sm text-text-primary text-sm py-1.5 px-2 text-center focus:ring-1 focus:ring-accent outline-none border-0 placeholder:text-text-muted/40 tabular-nums"
            disabled={disabled}
          />
        </div>

        {/* Right: PR badge, expand, delete */}
        <div className="flex items-center gap-1 shrink-0">
          {isPR && <Badge variant="warning">PR</Badge>}

          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="text-text-muted hover:text-text-secondary transition-colors p-1"
          >
            {expanded ? <ChevronUpIcon size={14} /> : <ChevronDownIcon size={14} />}
          </button>

          {!disabled && (
            <button
              type="button"
              onClick={onDelete}
              className="text-destructive shrink-0 opacity-40 hover:opacity-100 transition-opacity p-1"
            >
              <TrashIcon size={12} />
            </button>
          )}
        </div>
      </div>

      {/* Note — always visible when it exists */}
      {set.note && !expanded && (
        <div className="px-3 pb-2 -mt-1 ml-7">
          <p className="text-[11px] text-accent/70 italic leading-tight">
            {set.note}
          </p>
        </div>
      )}

      {/* Expanded: note input + rest time */}
      {expanded && (
        <div className="px-3 pb-3 pt-0 flex gap-2">
          <input
            type="text"
            value={set.note ?? ""}
            onChange={(e) => onUpdate("note", e.target.value)}
            placeholder={t("notePlaceholder")}
            className="flex-1 bg-surface-elevated rounded-sm text-text-primary text-xs py-1.5 px-2 focus:ring-1 focus:ring-accent outline-none border-0 placeholder:text-text-muted"
            disabled={disabled}
          />
          <div className="flex items-center gap-1 shrink-0">
            <input
              type="number"
              value={set.rest_seconds}
              onChange={(e) => onUpdate("rest_seconds", parseInt(e.target.value) || 60)}
              className="bg-surface-elevated rounded-sm text-text-primary text-xs py-1.5 px-1.5 w-12 text-center focus:ring-1 focus:ring-accent outline-none border-0 tabular-nums"
              disabled={disabled}
            />
            <span className="text-[10px] text-text-muted">{t("seconds")}</span>
          </div>
        </div>
      )}
    </div>
  );
}
