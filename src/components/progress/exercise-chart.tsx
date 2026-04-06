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
      <div className="h-48 flex items-center justify-center text-xs text-term-gray-light">
        loading<span className="cursor-blink">_</span>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-xs text-term-gray-light">
        &gt; no data for {exerciseName}
      </div>
    );
  }

  const metricLabels = {
    maxWeight: "max weight (kg)",
    totalVolume: "total volume (kg)",
    maxReps: "max reps",
  };

  return (
    <div>
      <p className="text-[10px] text-term-gray-light uppercase tracking-widest mb-2">
        {metricLabels[metric]}
      </p>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data}>
          <XAxis
            dataKey="date"
            tick={{ fontSize: 9, fill: "#555555" }}
            tickFormatter={(v) => {
              const d = new Date(v);
              return `${d.getMonth() + 1}/${d.getDate()}`;
            }}
            stroke="#333333"
          />
          <YAxis
            tick={{ fontSize: 9, fill: "#555555" }}
            stroke="#333333"
            width={40}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#0a0a0a",
              border: "1px solid #333333",
              fontFamily: "JetBrains Mono, monospace",
              fontSize: "10px",
              color: "#e0e0e0",
            }}
          />
          <Line
            type="monotone"
            dataKey={metric}
            stroke="#00ff41"
            strokeWidth={2}
            dot={{ fill: "#00ff41", r: 3, strokeWidth: 0 }}
            activeDot={{ fill: "#00ff41", r: 5, strokeWidth: 0 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
