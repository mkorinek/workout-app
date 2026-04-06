"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { getTemplate, updateTemplate, deleteTemplate } from "@/actions/templates";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ExerciseAutocomplete } from "@/components/workout/exercise-autocomplete";

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
      <div className="p-4 text-xs text-term-gray-light">
        loading<span className="cursor-blink">_</span>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-lg mx-auto">
      <h1 className="text-xs text-term-green uppercase tracking-widest mb-6">
        &gt; edit template
      </h1>

      <div className="mb-4">
        <Input
          label="template name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div className="border border-term-gray mb-4">
        <div className="border-b border-term-gray px-3 py-2">
          <span className="text-[10px] text-term-gray-light uppercase tracking-widest">
            exercises
          </span>
        </div>

        {exercises.map((ex, index) => (
          <div key={index} className="border-b border-term-gray p-3 flex items-center gap-3">
            <span className="text-[10px] text-term-gray-light w-4">{index + 1}</span>
            <div className="flex-1">
              <ExerciseAutocomplete
                value={ex.exercise_name}
                onChange={(v) => updateExercise(index, "exercise_name", v)}
              />
            </div>
            <div className="w-12">
              <input
                type="number"
                value={ex.sets}
                onChange={(e) => updateExercise(index, "sets", parseInt(e.target.value) || 0)}
                className="bg-transparent border-b border-term-gray text-term-white font-mono text-xs py-1 w-full text-right focus:border-term-green outline-none tabular-nums"
                placeholder="sets"
              />
            </div>
            <span className="text-[10px] text-term-gray">x</span>
            <div className="w-12">
              <input
                type="number"
                value={ex.reps}
                onChange={(e) => updateExercise(index, "reps", parseInt(e.target.value) || 0)}
                className="bg-transparent border-b border-term-gray text-term-white font-mono text-xs py-1 w-full text-right focus:border-term-green outline-none tabular-nums"
                placeholder="reps"
              />
            </div>
            <button
              onClick={() => removeExercise(index)}
              className="text-[10px] text-term-red hover:underline"
            >
              [x]
            </button>
          </div>
        ))}

        <button
          onClick={addExercise}
          className="w-full p-3 text-xs text-term-green hover:bg-term-gray/20 transition-colors uppercase tracking-widest"
        >
          + add exercise
        </button>
      </div>

      <div className="flex gap-2">
        <Button onClick={handleSave} disabled={saving} className="flex-1">
          {saving ? "saving..." : "save changes"}
        </Button>
        <Button variant="danger" size="sm" onClick={handleDelete}>
          delete
        </Button>
      </div>
    </div>
  );
}
