"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { createSession, getSessionForTemplate, addSets } from "@/actions/sessions";
import { getTemplates } from "@/actions/templates";

interface Template {
  id: string;
  name: string;
  exercises: { exercise_name: string; sets: number; reps: number }[];
}

export default function NewWorkoutPage() {
  const router = useRouter();
  const t = useTranslations("newWorkout");
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

    const lastSets = await getSessionForTemplate(template.id);

    const setsToAdd: Parameters<typeof addSets>[1] = [];
    let setNumber = 0;
    for (const ex of template.exercises) {
      for (let i = 0; i < ex.sets; i++) {
        setNumber++;
        const lastSet = lastSets?.find(
          (s) => s.exercise_name === ex.exercise_name && s.set_number === setNumber
        );
        setsToAdd.push({
          exerciseName: ex.exercise_name,
          setNumber,
          weightKg: lastSet ? Number(lastSet.weight_kg) : 0,
          reps: lastSet ? lastSet.reps : ex.reps,
          restSeconds: lastSet ? lastSet.rest_seconds : 60,
        });
      }
    }
    await addSets(result.id, setsToAdd);

    router.push(`/workouts/${result.id}`);
  }

  return (
    <div className="p-4 max-w-lg mx-auto">
      <h1 className="text-lg font-bold text-text-primary mb-6">
        {t("title")}
      </h1>

      {/* Blank workout */}
      <div className="card p-4 mb-4">
        <p className="text-sm text-text-primary mb-3">{t("startFromScratch")}</p>
        <Button onClick={startBlank} disabled={starting} className="w-full">
          {starting ? (
            <span className="animate-pulse-subtle">{t("starting")}</span>
          ) : (
            t("blankWorkout")
          )}
        </Button>
      </div>

      {/* Templates */}
      {loading ? (
        <div className="text-sm text-text-muted">
          <span className="animate-pulse-subtle">{t("loadingTemplates")}</span>
        </div>
      ) : templates.length > 0 ? (
        <div>
          <p className="text-xs text-text-secondary uppercase tracking-wider px-1 mb-1.5">
            {t("fromTemplate")}
          </p>
          <div className="card overflow-hidden">
            {templates.map((template, i) => (
              <button
                key={template.id}
                onClick={() => startFromTemplate(template)}
                disabled={starting}
                className={`hover:bg-surface-elevated/50 transition-colors p-4 text-left w-full disabled:opacity-50 ${i < templates.length - 1 ? "border-b border-border-subtle" : ""}`}
              >
                <p className="text-sm font-medium text-text-primary mb-1">
                  {template.name}
                </p>
                <p className="text-xs text-text-muted">
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
        <p className="text-xs text-text-muted">
          {t("noTemplates")}
        </p>
      )}
    </div>
  );
}
