"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  getTemplate,
  updateTemplate,
  deleteTemplate,
} from "@/actions/templates";
import { withInvalidation } from "@/lib/cache/invalidate";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ExercisePickerModal } from "@/components/workout/exercise-picker-modal";
import { ExerciseImage } from "@/components/ui/exercise-image";
import { TrashIcon } from "@/components/icons";

interface TemplateExercise {
  exercise_name: string;
  sets: number;
  reps: number;
}

export default function TemplateDetailPage() {
  const router = useRouter();
  const params = useParams();
  const templateId = params.templateId as string;
  const t = useTranslations("templateEdit");
  const tc = useTranslations("common");

  const [name, setName] = useState("");
  const [exercises, setExercises] = useState<TemplateExercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);

  useEffect(() => {
    getTemplate(templateId).then((data) => {
      if (data) {
        setName(data.name);
        setExercises(data.exercises as TemplateExercise[]);
      }
      setLoading(false);
    });
  }, [templateId]);

  async function handleSave() {
    setSaving(true);
    await withInvalidation(
      () => updateTemplate(templateId, { name, exercises }),
      "templates",
    );
    setSaving(false);
  }

  async function handleDelete() {
    await withInvalidation(() => deleteTemplate(templateId), "templates");
    router.push("/templates");
  }

  function addExercise(exerciseName: string) {
    setExercises((prev) => [...prev, { exercise_name: exerciseName, sets: 3, reps: 10 }]);
  }

  function updateExercise(
    index: number,
    field: string,
    value: string | number,
  ) {
    setExercises((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  }

  function removeExercise(index: number) {
    setExercises((prev) => prev.filter((_, i) => i !== index));
  }

  if (loading) {
    return (
      <div className="p-4 text-sm text-text-muted">
        <span className="animate-pulse-subtle">{t("loading")}</span>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-lg mx-auto">
      <h1 className="text-lg font-bold text-text-primary mb-6">
        {t("title")}
      </h1>

      <div className="mb-4">
        <Input
          label={t("templateName")}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div className="card mb-4 overflow-hidden">
        <div className="border-b border-border-subtle px-4 py-2.5">
          <span className="text-xs font-medium text-text-secondary">
            {t("exercises")}
          </span>
        </div>

        {exercises.map((ex, index) => (
          <div
            key={index}
            className="border-b border-border-subtle p-3 flex items-center gap-3"
          >
            <ExerciseImage
              exerciseName={ex.exercise_name}
              size={40}
              className="rounded-md"
            />
            <span className="flex-1 text-sm text-text-primary truncate">
              {ex.exercise_name || t("unnamed")}
            </span>
            <div className="w-14">
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={ex.sets}
                onChange={(e) =>
                  updateExercise(index, "sets", parseInt(e.target.value) || 0)
                }
                className="bg-surface-elevated shadow-sm border-0 rounded-sm text-text-primary text-xs py-1.5 px-2 w-full text-right focus:border-accent outline-none tabular-nums"
                placeholder={tc("sets")}
              />
            </div>
            <span className="text-xs text-text-muted">x</span>
            <div className="w-14">
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={ex.reps}
                onChange={(e) =>
                  updateExercise(index, "reps", parseInt(e.target.value) || 0)
                }
                className="bg-surface-elevated shadow-sm border-0 rounded-sm text-text-primary text-xs py-1.5 px-2 w-full text-right focus:border-accent outline-none tabular-nums"
                placeholder="reps"
              />
            </div>
            <button
              onClick={() => removeExercise(index)}
              className="text-destructive opacity-60 hover:opacity-100 transition-opacity"
            >
              <TrashIcon size={14} />
            </button>
          </div>
        ))}

        <button
          onClick={() => setPickerOpen(true)}
          className="w-full p-3 text-sm text-accent font-medium hover:bg-surface-elevated transition-colors"
        >
          {t("addExercise")}
        </button>

        <ExercisePickerModal
          open={pickerOpen}
          onClose={() => setPickerOpen(false)}
          onSelect={(name) => addExercise(name)}
        />
      </div>

      <div className="flex gap-2">
        <Button onClick={handleSave} disabled={saving} className="flex-1">
          {saving ? t("saving") : t("saveChanges")}
        </Button>
        <Button variant="danger" size="sm" onClick={handleDelete}>
          {t("delete")}
        </Button>
      </div>
    </div>
  );
}
