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
      <div className="border border-term-gray p-6 text-center">
        <p className="text-xs text-term-gray-light">
          &gt; save some exercises to track progress
        </p>
      </div>
    );
  }

  return (
    <div className="border border-term-gray p-4">
      {/* Exercise selector */}
      <div className="flex gap-2 mb-4 overflow-x-auto">
        {exerciseNames.map((name) => (
          <button
            key={name}
            onClick={() => setSelectedExercise(name)}
            className={`text-[10px] uppercase tracking-widest px-2 py-1 border whitespace-nowrap transition-colors ${
              selectedExercise === name
                ? "border-term-green text-term-green"
                : "border-term-gray text-term-gray-light hover:text-term-white"
            }`}
          >
            {name}
          </button>
        ))}
      </div>

      {/* Metric selector */}
      <div className="flex gap-2 mb-4">
        {(["maxWeight", "totalVolume", "maxReps"] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMetric(m)}
            className={`text-[10px] uppercase tracking-widest transition-colors ${
              metric === m ? "text-term-green" : "text-term-gray-light hover:text-term-white"
            }`}
          >
            [{m === "maxWeight" ? "weight" : m === "totalVolume" ? "volume" : "reps"}]
          </button>
        ))}
      </div>

      {selectedExercise && (
        <ExerciseChart exerciseName={selectedExercise} metric={metric} />
      )}
    </div>
  );
}
