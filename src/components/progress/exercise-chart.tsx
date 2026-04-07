"use client";

import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { getExerciseProgress } from "@/actions/records";

interface ExerciseChartProps {
  exerciseName: string;
  metric: "maxWeight" | "totalVolume" | "maxReps";
}

export function ExerciseChart({ exerciseName, metric }: ExerciseChartProps) {
  const [data, setData] = useState<{ date: string; maxWeight: number; totalVolume: number; maxReps: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!exerciseName) return;
    setLoading(true);
    getExerciseProgress(exerciseName).then((d) => {
      setData(d);
      setLoading(false);
    });
  }, [exerciseName]);

  if (loading) {
    return (
      <div className="h-48 flex items-center justify-center text-sm text-text-muted">
        <span className="animate-pulse-subtle">Loading...</span>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-sm text-text-muted">
        No data for {exerciseName}
      </div>
    );
  }

  const metricLabels = {
    maxWeight: "Max Weight (kg)",
    totalVolume: "Total Volume (kg)",
    maxReps: "Max Reps",
  };

  return (
    <div>
      <p className="text-xs font-medium text-text-secondary mb-3">
        {metricLabels[metric]}
      </p>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data}>
          <XAxis
            dataKey="date"
            tick={{ fontSize: 10, fill: "var(--color-text-muted)" }}
            tickFormatter={(v) => {
              const d = new Date(v);
              return `${d.getMonth() + 1}/${d.getDate()}`;
            }}
            stroke="var(--color-border)"
          />
          <YAxis
            tick={{ fontSize: 10, fill: "var(--color-text-muted)" }}
            stroke="var(--color-border)"
            width={40}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--color-surface-elevated)",
              border: "none",
              borderRadius: "var(--radius-md)",
              fontSize: "12px",
              color: "var(--color-text-primary)",
              boxShadow: "var(--shadow-lg)",
            }}
          />
          <Line
            type="monotone"
            dataKey={metric}
            stroke="var(--color-accent)"
            strokeWidth={2}
            dot={{ fill: "var(--color-accent)", r: 3, strokeWidth: 0 }}
            activeDot={{ fill: "var(--color-accent)", r: 5, strokeWidth: 0 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
