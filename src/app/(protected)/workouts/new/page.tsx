"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { createSession, getSessionForTemplate } from "@/actions/sessions";
import { getTemplates } from "@/actions/templates";
import { addSet } from "@/actions/sessions";

interface Template {
  id: string;
  name: string;
  exercises: { exercise_name: string; sets: number; reps: number }[];
}

export default function NewWorkoutPage() {
  const router = useRouter();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    getTemplates().then((data) => {
      setTemplates(data as Template[]);
      setLoading(false);
    });
  }, []);

  async function startBlank() {
    setStarting(true);
    const result = await createSession();
    if (result.id) {
      router.push(`/workouts/${result.id}`);
    }
  }

  async function startFromTemplate(template: Template) {
    setStarting(true);
    const result = await createSession(template.id);
    if (!result.id) return;

    // Get last session's weights for this template
    const lastSets = await getSessionForTemplate(template.id);

    // Pre-fill sets from template, using last session's weights if available
    let setNumber = 0;
    for (const ex of template.exercises) {
      for (let i = 0; i < ex.sets; i++) {
        setNumber++;
        const lastSet = lastSets?.find(
          (s) => s.exercise_name === ex.exercise_name && s.set_number === setNumber
        );
        await addSet(
          result.id,
          ex.exercise_name,
          setNumber,
          lastSet ? Number(lastSet.weight_kg) : 0,
          lastSet ? lastSet.reps : ex.reps,
          lastSet ? lastSet.rest_seconds : 60
        );
      }
    }

    router.push(`/workouts/${result.id}`);
  }

  return (
    <div className="p-4 max-w-lg mx-auto">
      <h1 className="text-xs text-term-green uppercase tracking-widest mb-6">
        &gt; new workout
      </h1>

      {/* Blank workout */}
      <div className="border border-term-gray p-4 mb-4">
        <p className="text-xs text-term-white mb-3">&gt; start from scratch</p>
        <Button onClick={startBlank} disabled={starting} className="w-full">
          {starting ? (
            <span>
              initializing<span className="cursor-blink">_</span>
            </span>
          ) : (
            "blank workout"
          )}
        </Button>
      </div>

      {/* Templates */}
      {loading ? (
        <div className="text-xs text-term-gray-light">
          loading templates<span className="cursor-blink">_</span>
        </div>
      ) : templates.length > 0 ? (
        <div>
          <p className="text-[10px] text-term-gray-light uppercase tracking-widest mb-3">
            or start from a saved template
          </p>
          <div className="flex flex-col gap-1">
            {templates.map((template) => (
              <button
                key={template.id}
                onClick={() => startFromTemplate(template)}
                disabled={starting}
                className="border border-term-gray hover:border-term-green-dim transition-colors p-3 text-left w-full disabled:opacity-50"
              >
                <p className="text-xs text-term-white mb-1">
                  &gt; {template.name}
                </p>
                <p className="text-[10px] text-term-gray-light">
                  {template.exercises
                    ?.map(
                      (e: { exercise_name: string; sets: number; reps: number }) =>
                        `${e.exercise_name} (${e.sets}x${e.reps})`
                    )
                    .join(" / ")}
                </p>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <p className="text-[10px] text-term-gray-light">
          &gt; no saved templates yet. finish a workout to save one.
        </p>
      )}
    </div>
  );
}
