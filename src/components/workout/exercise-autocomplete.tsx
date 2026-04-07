"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { searchExercises, addExercise } from "@/actions/exercises";

interface ExerciseAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSavePrompt?: (name: string) => void;
  placeholder?: string;
}

export function ExerciseAutocomplete({
  value,
  onChange,
  placeholder = "Exercise name",
}: ExerciseAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showSavePrompt, setShowSavePrompt] = useState(false);
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(null);
  const blurTimeoutRef = useRef<ReturnType<typeof setTimeout>>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const fetchSuggestions = useCallback(async (query: string) => {
    if (query.length < 1) {
      setSuggestions([]);
      return;
    }
    const results = await searchExercises(query);
    setSuggestions(results);
  }, []);

  useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => fetchSuggestions(value), 200);
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (blurTimeoutRef.current) clearTimeout(blurTimeoutRef.current);
    };
  }, [value, fetchSuggestions]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function handleBlur() {
    blurTimeoutRef.current = setTimeout(() => {
      setShowSuggestions(false);
      if (value.trim() && !suggestions.includes(value.trim())) {
        setShowSavePrompt(true);
      }
    }, 200);
  }

  async function handleSave() {
    setSaving(true);
    await addExercise(value.trim());
    setSaving(false);
    setShowSavePrompt(false);
  }

  return (
    <div ref={containerRef} className="relative">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setShowSuggestions(true);
          setShowSavePrompt(false);
        }}
        onFocus={() => {
          if (value.length > 0) setShowSuggestions(true);
        }}
        onBlur={handleBlur}
        placeholder={placeholder}
        className="bg-surface border border-border rounded-sm text-text-primary text-sm py-1.5 px-2 w-full focus:border-accent outline-none transition-colors placeholder:text-text-muted"
      />

      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-surface-elevated rounded-sm z-10 max-h-40 overflow-y-auto" style={{ boxShadow: "var(--shadow-lg)" }}>
          {suggestions.map((name) => (
            <button
              key={name}
              type="button"
              className="w-full text-left px-3 py-2 text-sm text-text-primary hover:bg-surface transition-colors"
              onMouseDown={(e) => {
                e.preventDefault();
                onChange(name);
                setShowSuggestions(false);
                setShowSavePrompt(false);
              }}
            >
              {name}
            </button>
          ))}
        </div>
      )}

      {showSavePrompt && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-surface-elevated rounded-sm z-10 px-3 py-2" style={{ boxShadow: "var(--shadow-lg)" }}>
          <p className="text-xs text-warning font-medium mb-2">
            Save &quot;{value.trim()}&quot; for future use?
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="text-xs text-accent font-medium hover:underline"
            >
              {saving ? "Saving..." : "Yes"}
            </button>
            <button
              type="button"
              onClick={() => setShowSavePrompt(false)}
              className="text-xs text-text-muted hover:underline"
            >
              No
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
