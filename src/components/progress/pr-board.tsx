"use client";

import { Badge } from "@/components/ui/badge";

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
  const grouped = records.reduce((acc, pr) => {
    if (!acc[pr.exercise_name]) acc[pr.exercise_name] = [];
    acc[pr.exercise_name].push(pr);
    return acc;
  }, {} as Record<string, PR[]>);

  const typeLabels: Record<string, string> = {
    max_weight: "Weight",
    max_reps: "Reps",
    max_volume: "Volume",
  };

  const typeUnits: Record<string, string> = {
    max_weight: "kg",
    max_reps: "",
    max_volume: "kg",
  };

  if (records.length === 0) {
    return (
      <div className="card p-6 text-center">
        <p className="text-sm text-text-muted">
          No personal records yet. Start lifting.
        </p>
      </div>
    );
  }

  return (
    <div className="card overflow-hidden">
      <div className="border-b border-border-subtle px-4 py-2.5">
        <span className="text-xs font-semibold text-warning">
          Personal Records
        </span>
      </div>
      {Object.entries(grouped).map(([exercise, prs], i) => (
        <div
          key={exercise}
          className={`px-4 py-3 ${
            i < Object.keys(grouped).length - 1 ? "border-b border-border-subtle" : ""
          }`}
        >
          <p className="text-sm text-text-primary font-medium mb-1.5">{exercise}</p>
          <div className="flex gap-3 flex-wrap">
            {prs.map((pr) => (
              <div key={pr.id} className="flex items-center gap-1.5">
                <Badge variant="warning">{typeLabels[pr.record_type]}</Badge>
                <span className="text-sm text-text-primary tabular-nums">
                  {Number(pr.value)}{typeUnits[pr.record_type]}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
