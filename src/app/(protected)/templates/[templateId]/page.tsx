"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { getTemplate, updateTemplate, deleteTemplate } from "@/actions/templates";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ExerciseAutocomplete } from "@/components/workout/exercise-autocomplete";
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

  const [name, setName] = useState("");
  const [exercises, setExercises] = useState<TemplateExercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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
    await updateTemplate(templateId, { name, exercises });
    setSaving(false);
  }

  async function handleDelete() {
    await deleteTemplate(templateId);
    router.push("/templates");
  }

  function addExercise() {
    setExercises((prev) => [...prev, { exercise_name: "", sets: 3, reps: 10 }]);
  }

  function updateExercise(index: number, field: string, value: string | number) {
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
        <span className="animate-pulse-subtle">Loading...</span>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-lg mx-auto">
      <h1 className="text-lg font-bold text-text-primary mb-6">
        Edit Template
      </h1>

      <div className="mb-4">
        <Input
          label="Template name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div className="card mb-4 overflow-hidden">
        <div className="border-b border-border-subtle px-4 py-2.5">
          <span className="text-xs font-medium text-text-secondary">
            Exercises
          </span>
        </div>

        {exercises.map((ex, index) => (
          <div key={index} className="border-b border-border-subtle p-3 flex items-center gap-3">
            <span className="text-xs text-text-muted w-4">{index + 1}</span>
            <div className="flex-1">
              <ExerciseAutocomplete
                value={ex.exercise_name}
                onChange={(v) => updateExercise(index, "exercise_name", v)}
              />
            </div>
            <div className="w-14">
              <input
                type="number"
                value={ex.sets}
                onChange={(e) => updateExercise(index, "sets", parseInt(e.target.value) || 0)}
                className="bg-surface-elevated shadow-sm border-0 rounded-sm text-text-primary text-xs py-1.5 px-2 w-full text-right focus:border-accent outline-none tabular-nums"
                placeholder="sets"
              />
            </div>
            <span className="text-xs text-text-muted">x</span>
            <div className="w-14">
              <input
                type="number"
                value={ex.reps}
                onChange={(e) => updateExercise(index, "reps", parseInt(e.target.value) || 0)}
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
          onClick={addExercise}
          className="w-full p-3 text-sm text-accent font-medium hover:bg-surface-elevated transition-colors"
        >
          + Add exercise
        </button>
      </div>

      <div className="flex gap-2">
        <Button onClick={handleSave} disabled={saving} className="flex-1">
          {saving ? "Saving..." : "Save Changes"}
        </Button>
        <Button variant="danger" size="sm" onClick={handleDelete}>
          Delete
        </Button>
      </div>
    </div>
  );
}
