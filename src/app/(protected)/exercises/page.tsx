"use client";

import { useState, useEffect } from "react";
import { getExercises, addExercise, deleteExercise } from "@/actions/exercises";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Exercise {
  id: string;
  name: string;
  created_at: string;
}

export default function ExercisesPage() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [newName, setNewName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadExercises();
  }, []);

  async function loadExercises() {
    const data = await getExercises();
    setExercises(data as Exercise[]);
    setLoading(false);
  }

  async function handleAdd() {
    if (!newName.trim()) return;
    await addExercise(newName.trim());
    setNewName("");
    loadExercises();
  }

  async function handleDelete(id: string) {
    await deleteExercise(id);
    loadExercises();
  }

  return (
    <div className="p-4 max-w-lg mx-auto">
      <h1 className="text-xs text-term-green uppercase tracking-widest mb-6">
        &gt; saved exercises
      </h1>

      {/* Add new */}
      <div className="flex gap-2 mb-6">
        <div className="flex-1">
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="exercise name"
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          />
        </div>
        <Button size="sm" onClick={handleAdd} disabled={!newName.trim()}>
          + add
        </Button>
      </div>

      {loading ? (
        <div className="text-xs text-term-gray-light">
          loading<span className="cursor-blink">_</span>
        </div>
      ) : exercises.length === 0 ? (
        <div className="border border-term-gray p-8 text-center">
          <p className="text-xs text-term-gray-light">
            &gt; no saved exercises yet
          </p>
        </div>
      ) : (
        <div className="border border-term-gray">
          {exercises.map((exercise, i) => (
            <div
              key={exercise.id}
              className={`flex items-center justify-between px-3 py-2 ${
                i < exercises.length - 1 ? "border-b border-term-gray" : ""
              }`}
            >
              <span className="text-xs text-term-white">&gt; {exercise.name}</span>
              <button
                onClick={() => handleDelete(exercise.id)}
                className="text-[10px] text-term-red hover:underline uppercase tracking-widest"
              >
                [del]
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
