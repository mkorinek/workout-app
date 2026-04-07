"use client";

import { useCached } from "@/lib/cache/use-cached";
import { getTemplates } from "@/actions/templates";
import type { TemplatesData } from "@/lib/cache/app-store";
import Link from "next/link";

export function TemplatesClient({ initialTemplates }: { initialTemplates: TemplatesData }) {
  const templates = useCached("templates", getTemplates, initialTemplates) ?? [];

  return (
    <div className="p-4 max-w-lg mx-auto">
      <h1 className="text-lg font-bold text-text-primary mb-6">
        Saved Templates
      </h1>

      {templates.length === 0 ? (
        <div className="card p-8 text-center">
          <p className="text-sm text-text-muted">
            No templates saved yet. Finish a workout to save one.
          </p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          {templates.map((template, i) => {
            const exercises = template.exercises as { exercise_name: string; sets: number; reps: number }[];
            return (
              <Link
                key={template.id}
                href={`/templates/${template.id}`}
                className={`hover:bg-surface-elevated/50 transition-colors p-4 block ${i < templates.length - 1 ? "border-b border-border-subtle" : ""}`}
              >
                <p className="text-sm font-medium text-text-primary mb-1">
                  {template.name}
                </p>
                <p className="text-xs text-text-muted">
                  {exercises
                    ?.map((e) => `${e.exercise_name} (${e.sets}x${e.reps})`)
                    .join(" / ")}
                </p>
                <p className="text-[10px] text-text-muted mt-1">
                  {new Date(template.updated_at).toLocaleDateString()}
                </p>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
