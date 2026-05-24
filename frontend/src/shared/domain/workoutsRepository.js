// src/shared/domain/workoutsRepository.js
import { workoutsRepository } from "@/data/api/workouts/workoutsRepository";
import {
  getWorkoutsKey,
  readWorkoutsByKey,
  writeWorkoutsByKey,
  migrateGuestToUnlimitedIfNeeded,
} from "@/shared/lib/storage/workoutsStorage";

export async function loadWorkouts(isAuthed) {
  if (isAuthed) {
    try {
      const response = await workoutsRepository.getWorkouts();
      const logs = response?.data || response;

      if (Array.isArray(logs)) {
        return logs.map(log => {
          const isoDate = log.date || "";
          return {
            id: log.id,
            exercise: log.exercise_details?.name || log.exercise || "",
            sets: Number(log.sets),
            reps: log.reps,
            weight: Number(log.weight),
            date: isoDate,
            is_locked: log.is_locked
          };
        });
      }
    } catch (e) {
      console.warn("Failed to fetch workouts from API, using local storage fallback:", e);
    }
  }

  const key = getWorkoutsKey(isAuthed);
  return readWorkoutsByKey(key);
}

export function saveWorkouts(isAuthed, workouts) {
  const key = getWorkoutsKey(isAuthed);
  writeWorkoutsByKey(key, workouts);
}

export function migrateIfNeeded(isAuthed) {
  if (isAuthed) migrateGuestToUnlimitedIfNeeded();
}