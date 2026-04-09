"use client";

import { useState } from "react";
import exerciseImages from "@/data/exercise-images.json";

const imageMap = exerciseImages as Record<string, string>;

interface ExerciseImageProps {
  exerciseName: string;
  size?: number;
  className?: string;
}

export function ExerciseImage({
  exerciseName,
  size = 32,
  className,
}: ExerciseImageProps) {
  const [error, setError] = useState(false);
  const gifUrl = imageMap[exerciseName];

  if (!gifUrl || error) {
    return null;
  }

  return (
    <img
      src={gifUrl}
      alt={exerciseName}
      width={size}
      height={size}
      className={`rounded-sm object-cover shrink-0 ${className ?? ""}`}
      loading="lazy"
      onError={() => setError(true)}
    />
  );
}
