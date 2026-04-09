"use client";

import { useTranslations } from "next-intl";

interface PR {
  id: string;
  exercise_name: string;
  record_type: string;
  value: number;
  achieved_at: string;
}

interface PRBoardProps {
  records: PR[];
}

export function PRBoard({ records }: PRBoardProps) {
  const t = useTranslations("prBoard");
  const grouped = records.reduce(
    (acc, pr) => {
      if (!acc[pr.exercise_name]) acc[pr.exercise_name] = {};
      acc[pr.exercise_name][pr.record_type] = pr;
      return acc;
    },
    {} as Record<string, Record<string, PR>>,
  );

  const exercises = Object.keys(grouped);

  if (exercises.length === 0) {
    return (
      <div className="card p-6 text-center">
        <p className="text-sm text-text-muted">
          {t("noRecords")}
        </p>
      </div>
    );
  }

  return (
    <div>
      <p className="text-xs font-medium text-text-secondary mb-3">
        {t("title")}
      </p>
      <div className="card overflow-hidden">
        {/* Header */}
        <div className="flex items-center px-4 py-2.5 border-b border-accent/20 bg-accent/[0.04]">
          <span className="flex-1 text-xs font-medium text-text-muted">
            {t("exercise")}
          </span>
          <span className="w-16 text-right text-[10px] font-semibold uppercase tracking-wider text-accent/60">
            {t("weight")}
          </span>
          <span className="w-14 text-right text-[10px] font-semibold uppercase tracking-wider text-accent/60">
            {t("reps")}
          </span>
          <span className="w-16 text-right text-[10px] font-semibold uppercase tracking-wider text-accent/60">
            {t("volume")}
          </span>
        </div>

        {/* Rows */}
        {exercises.map((exercise, i) => {
          const prs = grouped[exercise];
          return (
            <div
              key={exercise}
              className={`flex items-center px-4 py-2.5 ${
                i < exercises.length - 1
                  ? "border-b border-border-subtle"
                  : ""
              }`}
            >
              <span className="flex-1 text-sm text-text-primary truncate pr-2">
                {exercise}
              </span>
              <span className={`w-16 text-right text-sm font-medium tabular-nums ${prs.max_weight ? "text-accent" : "text-text-muted/40"}`}>
                {prs.max_weight
                  ? `${Number(prs.max_weight.value)}kg`
                  : "—"}
              </span>
              <span className={`w-14 text-right text-sm font-medium tabular-nums ${prs.max_reps ? "text-accent" : "text-text-muted/40"}`}>
                {prs.max_reps ? Number(prs.max_reps.value) : "—"}
              </span>
              <span className={`w-16 text-right text-sm font-medium tabular-nums ${prs.max_volume ? "text-accent" : "text-text-muted/40"}`}>
                {prs.max_volume
                  ? `${Number(prs.max_volume.value)}kg`
                  : "—"}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
