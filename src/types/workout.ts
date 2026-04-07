export interface SetData {
  id: string;
  exercise_name: string;
  set_number: number;
  weight_kg: number;
  reps: number;
  rest_seconds: number;
  completed: boolean;
  completed_at: string | null;
  note?: string | null;
}

export type SetMutableField = keyof Pick<SetData, "weight_kg" | "reps" | "rest_seconds" | "note">;
