"use client";

import { useState } from "react";
import { ExerciseChart } from "@/components/progress/exercise-chart";

interface ProgressClientProps {
  exerciseNames: string[];
}

export function ProgressClient({ exerciseNames }: ProgressClientProps) {
  const [selectedExercise, setSelectedExercise] = useState(exerciseNames[0] ?? "");
  const [metric, setMetric] = useState<"maxWeight" | "totalVolume" | "maxReps">("maxWeight");

  if (exerciseNames.length === 0) {
    return (
      <div className="card p-6 text-center">
        <p className="text-sm text-text-muted">
          Save some exercises to track progress
        </p>
      </div>
    );
  }

  return (
    <div className="card p-4">
      {/* Exercise selector */}
      <div className="flex gap-2 mb-4 overflow-x-auto">
        {exerciseNames.map((name) => (
          <button
            key={name}
            onClick={() => setSelectedExercise(name)}
            className={`text-xs px-3 py-1.5 border rounded-full whitespace-nowrap transition-colors ${
              selectedExercise === name
                ? "border-accent text-accent bg-accent-muted"
                : "border-border text-text-muted hover:text-text-secondary hover:border-border"
            }`}
          >
            {name}
          </button>
        ))}
      </div>

      {/* Metric selector */}
      <div className="flex gap-1 mb-4 bg-surface-elevated rounded-sm p-0.5 w-fit">
        {(["maxWeight", "totalVolume", "maxReps"] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMetric(m)}
            className={`text-xs px-3 py-1.5 rounded-sm transition-colors ${
              metric === m
                ? "bg-accent text-white font-medium"
                : "text-text-muted hover:text-text-secondary"
            }`}
          >
            {m === "maxWeight" ? "Weight" : m === "totalVolume" ? "Volume" : "Reps"}
          </button>
        ))}
      </div>

      {selectedExercise && (
        <ExerciseChart exerciseName={selectedExercise} metric={metric} />
      )}
    </div>
  );
}
