import { openDB, type IDBPDatabase } from "idb";

const DB_NAME = "workout-offline";
const DB_VERSION = 1;

interface MutationEntry {
  id: string;
  timestamp: number;
  action: string;
  payload: Record<string, unknown>;
  status: "pending" | "failed";
}

export async function getDB() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains("exercises")) {
        db.createObjectStore("exercises", { keyPath: "name" });
      }
      if (!db.objectStoreNames.contains("active-session")) {
        db.createObjectStore("active-session", { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains("personal-records")) {
        db.createObjectStore("personal-records", { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains("mutation-queue")) {
        const store = db.createObjectStore("mutation-queue", { keyPath: "id" });
        store.createIndex("timestamp", "timestamp");
      }
    },
  });
}

export async function cacheExercises(exercises: { name: string }[]) {
  const db = await getDB();
  const tx = db.transaction("exercises", "readwrite");
  await tx.store.clear();
  for (const ex of exercises) {
    await tx.store.put(ex);
  }
  await tx.done;
}

export async function getCachedExercises(): Promise<{ name: string }[]> {
  const db = await getDB();
  return db.getAll("exercises");
}

export async function queueMutation(action: string, payload: Record<string, unknown>) {
  const db = await getDB();
  const entry: MutationEntry = {
    id: crypto.randomUUID(),
    timestamp: Date.now(),
    action,
    payload,
    status: "pending",
  };
  await db.put("mutation-queue", entry);
  return entry;
}

export async function getPendingMutations(): Promise<MutationEntry[]> {
  const db = await getDB();
  const all = await db.getAllFromIndex("mutation-queue", "timestamp");
  return all.filter((m) => m.status === "pending");
}

export async function removeMutation(id: string) {
  const db = await getDB();
  await db.delete("mutation-queue", id);
}

export async function getPendingCount(): Promise<number> {
  const db = await getDB();
  const all = await db.getAll("mutation-queue");
  return all.filter((m) => m.status === "pending").length;
}
