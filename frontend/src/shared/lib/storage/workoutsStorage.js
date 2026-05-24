// src/shared/lib/storage/workoutsStorage.js

const UNLIMITED_KEY = "fitness_tracker_unlimited_v1";
const GUEST_KEY = "fitness_tracker_guest_v1";

function safeParse(json, fallback) {
  try {
    return json ? JSON.parse(json) : fallback;
  } catch {
    return fallback;
  }
}

export function getWorkoutsKey(isAuthed) {
  return isAuthed ? UNLIMITED_KEY : GUEST_KEY;
}

export function readWorkoutsByKey(key) {
  return safeParse(localStorage.getItem(key), []);
}

export function writeWorkoutsByKey(key, workouts) {
  localStorage.setItem(key, JSON.stringify(workouts));
}

export function migrateGuestToUnlimitedIfNeeded() {
  const guestData = safeParse(localStorage.getItem(GUEST_KEY), []);
  const userData = safeParse(localStorage.getItem(UNLIMITED_KEY), []);

  if (guestData.length > 0 && userData.length === 0) {
    localStorage.setItem(UNLIMITED_KEY, JSON.stringify(guestData));
  }
}