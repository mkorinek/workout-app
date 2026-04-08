"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Modal } from "@/components/ui/modal";
import { searchExercises, addExercise } from "@/actions/exercises";
import { Button } from "@/components/ui/button";

interface ExercisePickerModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (exerciseName: string) => void;
}

export function ExercisePickerModal({
  open,
  onClose,
  onSelect,
}: ExercisePickerModalProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<string[]>([]);
  const [searching, setSearching] = useState(false);
  const [showSavePrompt, setShowSavePrompt] = useState(false);
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(null);

  useEffect(() => {
    if (open) {
      setQuery("");
      setResults([]);
      setShowSavePrompt(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  const doSearch = useCallback(async (q: string) => {
    if (q.length < 1) {
      setResults([]);
      setSearching(false);
      return;
    }
    setSearching(true);
    const r = await searchExercises(q);
    setResults(r);
    setSearching(false);
  }, []);

  useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => doSearch(query), 200);
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [query, doSearch]);

  function handleSelect(name: string) {
    onSelect(name);
    onClose();
  }

  function handleConfirmCustom() {
    const trimmed = query.trim();
    if (!trimmed) return;

    const match = results.find(
      (r) => r.toLowerCase() === trimmed.toLowerCase(),
    );
    if (match) {
      handleSelect(match);
      return;
    }

    setShowSavePrompt(true);
  }

  async function handleSaveAndSelect() {
    const trimmed = query.trim();
    setSaving(true);
    await addExercise(trimmed);
    setSaving(false);
    handleSelect(trimmed);
  }

  function handleUseWithoutSaving() {
    handleSelect(query.trim());
  }

  return (
    <Modal open={open} onClose={onClose} title="Add Exercise">
      <div className="flex flex-col gap-3">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowSavePrompt(false);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleConfirmCustom();
            }
          }}
          placeholder="Search exercises..."
          className="bg-surface-elevated shadow-sm border-0 rounded-sm text-text-primary text-sm py-2.5 px-3 w-full focus:ring-2 focus:ring-accent outline-none transition-colors placeholder:text-text-muted"
        />
        {!showSavePrompt && !searching && query.length > 0 && (
          <Button onClick={() => handleConfirmCustom()} className="flex-1">
            Add
          </Button>
        )}
        {showSavePrompt && (
          <div className="bg-warning-muted shadow-sm rounded-sm p-3">
            <p className="text-xs text-warning font-medium mb-3">
              Save &quot;{query.trim()}&quot; for future use?
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleSaveAndSelect}
                disabled={saving}
                className="text-xs text-accent font-medium hover:underline"
              >
                {saving ? "Saving..." : "Save & add"}
              </button>
              <button
                type="button"
                onClick={handleUseWithoutSaving}
                className="text-xs text-text-muted hover:underline"
              >
                Just use it
              </button>
            </div>
          </div>
        )}

        <div className="max-h-60 overflow-y-auto">
          {searching && (
            <p className="text-xs text-text-muted py-2">Searching...</p>
          )}

          {!searching &&
            results.length > 0 &&
            results.map((name) => (
              <button
                key={name}
                type="button"
                onClick={() => handleSelect(name)}
                className="w-full text-left px-3 py-2.5 text-sm text-text-primary hover:bg-surface rounded-sm transition-colors"
              >
                {name}
              </button>
            ))}
        </div>

        {query.trim() &&
          results.length > 0 &&
          !results.some(
            (r) => r.toLowerCase() === query.trim().toLowerCase(),
          ) && (
            <button
              type="button"
              onClick={handleConfirmCustom}
              className="text-xs text-text-muted hover:text-text-secondary text-left py-1"
            >
              + Use &quot;{query.trim()}&quot; as new exercise
            </button>
          )}
      </div>
    </Modal>
  );
}
