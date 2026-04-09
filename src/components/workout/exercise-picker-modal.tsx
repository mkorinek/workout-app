"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useTranslations } from "next-intl";
import { Modal } from "@/components/ui/modal";
import { searchExercises, addExercise } from "@/actions/exercises";
import { Button } from "@/components/ui/button";
import defaultExercises from "@/data/default-exercises.json";
import { ExerciseImage } from "@/components/ui/exercise-image";
import { useToast } from "@/components/ui/toast";
import { useAppStore } from "@/lib/cache/app-store";

interface SearchResult {
  name: string;
  category?: string;
  isDefault?: boolean;
}

interface ExercisePickerModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (exerciseName: string) => void;
}

const PAGE_SIZE = 20;

export function ExercisePickerModal({
  open,
  onClose,
  onSelect,
}: ExercisePickerModalProps) {
  const t = useTranslations("exercisePicker");
  const tc = useTranslations("common");
  const [query, setQuery] = useState("");
  const [userResults, setUserResults] = useState<string[]>([]);
  const [searching, setSearching] = useState(false);
  const [showSavePrompt, setShowSavePrompt] = useState(false);
  const [saving, setSaving] = useState(false);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const { addToast } = useToast();
  const invalidate = useAppStore((s) => s.invalidate);
  const inputRef = useRef<HTMLInputElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const allResults: SearchResult[] = useMemo(() => {
    const q = query.trim().toLowerCase();
    const userSet = new Set(userResults.map((r) => r.toLowerCase()));
    const merged: SearchResult[] = userResults.map((name) => ({ name }));

    const matchingDefaults = defaultExercises
      .filter(
        (ex) =>
          !userSet.has(ex.name.toLowerCase()) &&
          (q.length < 1 ||
            ex.name.toLowerCase().includes(q) ||
            ex.category.toLowerCase().includes(q)),
      )
      .map((ex) => ({ name: ex.name, category: ex.category, isDefault: true }));

    merged.push(...matchingDefaults);
    return merged;
  }, [query, userResults]);

  const results = useMemo(
    () => allResults.slice(0, visibleCount),
    [allResults, visibleCount],
  );
  const hasMore = visibleCount < allResults.length;

  // Reset visible count when query or results change
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [query, userResults]);

  // Reset state when modal opens
  useEffect(() => {
    if (open) {
      setQuery("");
      setUserResults([]);
      setShowSavePrompt(false);
      setVisibleCount(PAGE_SIZE);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  // Infinite scroll via scroll event
  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el || !hasMore) return;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 100) {
      setVisibleCount((prev) => prev + PAGE_SIZE);
    }
  }, [hasMore]);

  const doSearch = useCallback(async (q: string) => {
    if (q.length < 1) {
      setUserResults([]);
      setSearching(false);
      return;
    }
    setSearching(true);
    const r = await searchExercises(q);
    setUserResults(r);
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

    const match = allResults.find(
      (r) => r.name.toLowerCase() === trimmed.toLowerCase(),
    );
    if (match) {
      handleSelect(match.name);
      return;
    }

    setShowSavePrompt(true);
  }

  async function handleSaveAndSelect() {
    const trimmed = query.trim();
    setSaving(true);
    const result = await addExercise(trimmed);
    setSaving(false);
    if (result && "error" in result) {
      addToast(result.error ?? t("failedToSave"), "error");
      return;
    }
    addToast(t("saved", { name: trimmed }), "success");
    invalidate("exercises");
    handleSelect(trimmed);
  }

  function handleUseWithoutSaving() {
    handleSelect(query.trim());
  }

  return (
    <Modal open={open} onClose={onClose} title={t("title")}>
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
          placeholder={t("searchPlaceholder")}
          className="bg-surface-elevated shadow-sm border-0 rounded-sm text-text-primary text-sm py-2.5 px-3 w-full focus:ring-2 focus:ring-accent outline-none transition-colors placeholder:text-text-muted"
        />
        {!showSavePrompt && !searching && query.length > 0 && (
          <Button onClick={() => handleConfirmCustom()} className="flex-1">
            {t("add")}
          </Button>
        )}
        {showSavePrompt && (
          <div className="bg-warning-muted shadow-sm rounded-sm p-3">
            <p className="text-xs text-warning font-medium mb-3">
              {t("saveForFuture", { query: query.trim() })}
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleSaveAndSelect}
                disabled={saving}
                className="text-xs text-accent font-medium hover:underline"
              >
                {saving ? tc("saving") : t("saveAndAdd")}
              </button>
              <button
                type="button"
                onClick={handleUseWithoutSaving}
                className="text-xs text-text-muted hover:underline"
              >
                {t("justUseIt")}
              </button>
            </div>
          </div>
        )}

        <div ref={scrollRef} onScroll={handleScroll} className="max-h-96 overflow-y-auto">
          {searching && (
            <p className="text-xs text-text-muted py-2">{t("searching")}</p>
          )}

          {!searching &&
            results.length > 0 &&
            results.map((result) => (
              <button
                key={result.name}
                type="button"
                onClick={() => handleSelect(result.name)}
                className="w-full text-left px-3 py-2.5 text-sm text-text-primary hover:bg-surface rounded-sm transition-colors flex items-center gap-3"
              >
                <ExerciseImage
                  exerciseName={result.name}
                  size={80}
                  className="rounded-md"
                />
                <div className="flex-1 min-w-0">
                  <span className="block truncate">{result.name}</span>
                  {result.category && (
                    <span className="text-xs text-text-muted">
                      {result.category}
                    </span>
                  )}
                </div>
              </button>
            ))}

          {hasMore && (
            <div className="py-3 text-center">
              <span className="text-xs text-text-muted">{t("scrollForMore")}</span>
            </div>
          )}
        </div>

        {query.trim() &&
          allResults.length > 0 &&
          !allResults.some(
            (r) => r.name.toLowerCase() === query.trim().toLowerCase(),
          ) && (
            <button
              type="button"
              onClick={handleConfirmCustom}
              className="text-xs text-text-muted hover:text-text-secondary text-left py-1"
            >
              {t("useAsNew", { query: query.trim() })}
            </button>
          )}
      </div>
    </Modal>
  );
}
