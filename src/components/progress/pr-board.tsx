"use client";

import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

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
  // Group by exercise
  const grouped = records.reduce((acc, pr) => {
    if (!acc[pr.exercise_name]) acc[pr.exercise_name] = [];
    acc[pr.exercise_name].push(pr);
    return acc;
  }, {} as Record<string, PR[]>);

  const typeLabels: Record<string, string> = {
    max_weight: "weight",
    max_reps: "reps",
    max_volume: "volume",
  };

  const typeUnits: Record<string, string> = {
    max_weight: "kg",
    max_reps: "",
    max_volume: "kg",
  };

  if (records.length === 0) {
    return (
      <div className="border border-term-gray p-6 text-center">
        <p className="text-xs text-term-gray-light">
          &gt; no personal records yet. start lifting.
        </p>
      </div>
    );
  }

  return (
    <div className="border border-term-gray">
      <div className="border-b border-term-gray px-3 py-2">
        <span className="text-[10px] text-term-amber uppercase tracking-widest font-bold">
          personal records
        </span>
      </div>
      {Object.entries(grouped).map(([exercise, prs], i) => (
        <div
          key={exercise}
          className={`px-3 py-2 ${
            i < Object.keys(grouped).length - 1 ? "border-b border-term-gray" : ""
          }`}
        >
          <p className="text-xs text-term-white mb-1">&gt; {exercise}</p>
          <div className="flex gap-3 flex-wrap">
            {prs.map((pr) => (
              <div key={pr.id} className="flex items-center gap-1">
                <Badge variant="amber">{typeLabels[pr.record_type]}</Badge>
                <span className="text-xs text-term-white tabular-nums">
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
