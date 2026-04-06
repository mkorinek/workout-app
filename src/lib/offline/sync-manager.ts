import { getPendingMutations, removeMutation } from "./idb-store";
import {
  addSet,
  completeSet,
  uncompleteSet,
  updateSet,
  deleteSet,
  finishWorkout,
} from "@/actions/sessions";
import { addExercise } from "@/actions/exercises";

type ActionMap = Record<string, (payload: Record<string, unknown>) => Promise<unknown>>;

const actionHandlers: ActionMap = {
  addSet: async (p) =>
    addSet(
      p.sessionId as string,
      p.exerciseName as string,
      p.setNumber as number,
      p.weightKg as number,
      p.reps as number,
      p.restSeconds as number
    ),
  completeSet: async (p) => completeSet(p.setId as string),
  uncompleteSet: async (p) => uncompleteSet(p.setId as string),
  updateSet: async (p) =>
    updateSet(p.setId as string, p.updates as Record<string, unknown>),
  deleteSet: async (p) => deleteSet(p.setId as string),
  finishWorkout: async (p) => finishWorkout(p.sessionId as string),
  addExercise: async (p) => addExercise(p.name as string),
};

export async function replayMutations(): Promise<number> {
  const pending = await getPendingMutations();
  let replayed = 0;

  for (const mutation of pending) {
    const handler = actionHandlers[mutation.action];
    if (!handler) {
      await removeMutation(mutation.id);
      continue;
    }

    try {
      await handler(mutation.payload);
      await removeMutation(mutation.id);
      replayed++;
    } catch {
      // Stop on first failure, retry later
      break;
    }
  }

  return replayed;
}
