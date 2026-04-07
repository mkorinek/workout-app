"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Modal } from "@/components/ui/modal";
import { searchExercises, addExercise } from "@/actions/exercises";

interface ExercisePickerModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (exerciseName: string) => void;
}

export function ExercisePickerModal({ open, onClose, onSelect }: ExercisePickerModalProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<string[]>([]);
  const [searching, setSearching] = useState(false);
  const [showSavePrompt, setShowSavePrompt] = useState(false);
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(null);

  // Focus input when modal opens
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

    // Check if it matches an existing result
    const match = results.find((r) => r.toLowerCase() === trimmed.toLowerCase());
    if (match) {
      handleSelect(match);
      return;
    }

    // Show save prompt for new exercise
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
    <Modal open={open} onClose={onClose} title="add exercise">
      <div className="flex flex-col gap-3">
        {/* Search input */}
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
          placeholder="search exercises..."
          className="bg-transparent border-b border-term-gray text-term-white font-mono text-sm py-2 px-0 w-full focus:border-term-green outline-none transition-colors placeholder:text-term-gray"
        />

        {/* Results */}
        <div className="max-h-60 overflow-y-auto">
          {searching && (
            <p className="text-[10px] text-term-gray-light uppercase tracking-widest py-2">
              searching...
            </p>
          )}

          {!searching && results.length > 0 && results.map((name) => (
            <button
              key={name}
              type="button"
              onClick={() => handleSelect(name)}
              className="w-full text-left px-2 py-2.5 text-xs text-term-white hover:bg-term-gray font-mono border-b border-term-gray last:border-0 transition-colors"
            >
              &gt; {name}
            </button>
          ))}

          {!searching && query.length > 0 && results.length === 0 && !showSavePrompt && (
            <p className="text-[10px] text-term-gray-light uppercase tracking-widest py-2">
              no matches. press enter to add &quot;{query.trim()}&quot;
            </p>
          )}
        </div>

        {/* Save prompt for new exercise */}
        {showSavePrompt && (
          <div className="border border-term-amber p-3">
            <p className="text-[10px] text-term-amber uppercase tracking-widest mb-3">
              save &quot;{query.trim()}&quot; for future use?
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleSaveAndSelect}
                disabled={saving}
                className="text-[10px] text-term-green uppercase tracking-widest hover:underline"
              >
                {saving ? "saving..." : "[y] save & add"}
              </button>
              <button
                type="button"
                onClick={handleUseWithoutSaving}
                className="text-[10px] text-term-gray-light uppercase tracking-widest hover:underline"
              >
                [n] just use it
              </button>
            </div>
          </div>
        )}

        {/* Use custom name button (when there are results but user wants their typed name) */}
        {query.trim() && results.length > 0 && !results.some((r) => r.toLowerCase() === query.trim().toLowerCase()) && (
          <button
            type="button"
            onClick={handleConfirmCustom}
            className="text-[10px] text-term-gray-light uppercase tracking-widest hover:text-term-white text-left py-1"
          >
            + use &quot;{query.trim()}&quot; as new exercise
          </button>
        )}
      </div>
    </Modal>
  );
}
