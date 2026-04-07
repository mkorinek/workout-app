"use client";

import { useState, useEffect } from "react";
import { getExercises, addExercise, deleteExercise } from "@/actions/exercises";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TrashIcon } from "@/components/icons";

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
      <h1 className="text-lg font-bold text-text-primary mb-6">
        Saved Exercises
      </h1>

      {/* Add new */}
      <div className="flex gap-2 mb-6">
        <div className="flex-1">
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Exercise name"
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          />
        </div>
        <Button size="sm" onClick={handleAdd} disabled={!newName.trim()}>
          + Add
        </Button>
      </div>

      {loading ? (
        <div className="text-sm text-text-muted">
          <span className="animate-pulse-subtle">Loading...</span>
        </div>
      ) : exercises.length === 0 ? (
        <div className="card p-8 text-center">
          <p className="text-sm text-text-muted">
            No saved exercises yet
          </p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          {exercises.map((exercise, i) => (
            <div
              key={exercise.id}
              className={`flex items-center justify-between px-4 py-3 ${
                i < exercises.length - 1 ? "border-b border-border-subtle" : ""
              }`}
            >
              <span className="text-sm text-text-primary">{exercise.name}</span>
              <button
                onClick={() => handleDelete(exercise.id)}
                className="text-destructive opacity-60 hover:opacity-100 transition-opacity"
              >
                <TrashIcon size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
