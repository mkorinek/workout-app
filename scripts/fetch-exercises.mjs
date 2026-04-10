/**
 * One-time script to fetch all 1500 exercises from the open-source ExerciseDB dataset
 * and merge them with existing exercise data.
 *
 * Source: https://github.com/bootstrapping-lab/exercisedb-api
 * All gifUrls point to static.exercisedb.dev
 *
 * Usage: node scripts/fetch-exercises.mjs
 */

import { readFileSync, writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = resolve(__dirname, "../src/data");

const DATASET_URL =
  "https://raw.githubusercontent.com/bootstrapping-lab/exercisedb-api/main/src/data/exercises.json";

// Map ExerciseDB bodyParts → our category names
const BODY_PART_TO_CATEGORY = {
  "upper arms": "Arms",
  "lower arms": "Arms",
  back: "Back",
  cardio: "Cardio",
  chest: "Chest",
  waist: "Core",
  neck: "Shoulders",
  shoulders: "Shoulders",
  "upper legs": "Legs",
  "lower legs": "Legs",
};

async function main() {
  console.log("=== Fetching exercises from ExerciseDB dataset ===\n");

  // Load existing data
  const existingExercises = JSON.parse(
    readFileSync(resolve(DATA_DIR, "default-exercises.json"), "utf-8"),
  );
  const existingImages = JSON.parse(
    readFileSync(resolve(DATA_DIR, "exercise-images.json"), "utf-8"),
  );

  console.log(
    `Existing: ${existingExercises.length} exercises, ${Object.keys(existingImages).length} images\n`,
  );

  // Fetch the full dataset
  console.log("Fetching dataset...");
  const res = await fetch(DATASET_URL);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const dataset = await res.json();
  console.log(`  Fetched ${dataset.length} exercises\n`);

  // Build maps from existing data (keyed by lowercase name for dedup)
  const exerciseMap = new Map();
  const imageMap = new Map();

  // Add existing exercises first (they take priority)
  for (const ex of existingExercises) {
    exerciseMap.set(ex.name.toLowerCase(), {
      name: ex.name,
      category: ex.category,
    });
  }
  for (const [name, url] of Object.entries(existingImages)) {
    imageMap.set(name.toLowerCase(), { name, url });
  }

  // Add dataset exercises
  let newCount = 0;
  let newImageCount = 0;
  for (const ex of dataset) {
    const name = ex.name
      // Title case each word
      .split(" ")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
    const key = name.toLowerCase();

    // Determine category from first bodyPart
    const bodyPart = ex.bodyParts?.[0] || "";
    const category = BODY_PART_TO_CATEGORY[bodyPart] || "Other";

    if (!exerciseMap.has(key)) {
      exerciseMap.set(key, { name, category });
      newCount++;
    }

    // Add image if we don't have one
    if (ex.gifUrl && !imageMap.has(key)) {
      imageMap.set(key, { name, url: ex.gifUrl });
      newImageCount++;
    }
  }

  console.log(`New exercises added: ${newCount}`);
  console.log(`New images added: ${newImageCount}\n`);

  // Sort and write output
  const finalExercises = Array.from(exerciseMap.values())
    .filter((e) => e.category !== "Other")
    .sort(
      (a, b) =>
        a.category.localeCompare(b.category) || a.name.localeCompare(b.name),
    );

  const finalImages = {};
  const sortedImageEntries = Array.from(imageMap.values()).sort((a, b) =>
    a.name.localeCompare(b.name),
  );
  for (const entry of sortedImageEntries) {
    finalImages[entry.name] = entry.url;
  }

  writeFileSync(
    resolve(DATA_DIR, "default-exercises.json"),
    JSON.stringify(finalExercises, null, 2) + "\n",
  );
  writeFileSync(
    resolve(DATA_DIR, "exercise-images.json"),
    JSON.stringify(finalImages, null, 2) + "\n",
  );

  console.log(
    `Final: ${finalExercises.length} exercises, ${Object.keys(finalImages).length} images`,
  );

  // Print category breakdown
  const cats = {};
  for (const ex of finalExercises) {
    cats[ex.category] = (cats[ex.category] || 0) + 1;
  }
  console.log("\nCategory breakdown:");
  for (const [cat, count] of Object.entries(cats).sort()) {
    console.log(`  ${cat}: ${count}`);
  }
}

main().catch(console.error);
