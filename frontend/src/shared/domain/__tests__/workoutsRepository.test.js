// src/shared/domain/__tests__/workoutsRepository.test.js
import { describe, it, expect, vi, beforeEach } from "vitest";

import { loadWorkouts, saveWorkouts, migrateIfNeeded } from "../workoutsRepository";

// Mock the storage layer
vi.mock("@/shared/lib/storage/workoutsStorage", () => {
  return {
    getWorkoutsKey: vi.fn(),
    readWorkoutsByKey: vi.fn(),
    writeWorkoutsByKey: vi.fn(),
    migrateGuestToUnlimitedIfNeeded: vi.fn(),
  };
});

// Mock the API layer
vi.mock("@/data/api/workouts/workoutsRepository", () => {
  return {
    workoutsRepository: {
      getWorkouts: vi.fn(),
    },
  };
});

import { workoutsRepository } from "@/data/api/workouts/workoutsRepository";
import {
  getWorkoutsKey,
  readWorkoutsByKey,
  writeWorkoutsByKey,
  migrateGuestToUnlimitedIfNeeded,
} from "@/shared/lib/storage/workoutsStorage";


describe("workoutsRepository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("loadWorkouts (guest): uses getWorkoutsKey and returns readWorkoutsByKey result", async () => {
    const fakeKey = "some_key";
    const fakeData = [{ id: 1, exercise: "Bench" }];

    getWorkoutsKey.mockReturnValue(fakeKey);
    readWorkoutsByKey.mockReturnValue(fakeData);

    const result = await loadWorkouts(false);

    expect(getWorkoutsKey).toHaveBeenCalledTimes(1);
    expect(getWorkoutsKey).toHaveBeenCalledWith(false);

    expect(readWorkoutsByKey).toHaveBeenCalledTimes(1);
    expect(readWorkoutsByKey).toHaveBeenCalledWith(fakeKey);

    expect(result).toEqual(fakeData);
  });

  it("loadWorkouts (authed): calls API and maps response fields", async () => {
    const apiData = [
      {
        id: 42,
        exercise_details: { name: "Deadlift" },
        sets: "3",
        reps: [10, 8, 6],
        weight: "140",
        date: "2026-05-24",
        is_locked: false,
      },
    ];

    workoutsRepository.getWorkouts.mockResolvedValue(apiData);

    const result = await loadWorkouts(true);

    expect(workoutsRepository.getWorkouts).toHaveBeenCalledTimes(1);
    expect(result).toEqual([
      {
        id: 42,
        exercise: "Deadlift",
        sets: 3,
        reps: [10, 8, 6],
        weight: 140,
        date: "2026-05-24",
        is_locked: false,
      },
    ]);
  });

  it("saveWorkouts: uses getWorkoutsKey and calls writeWorkoutsByKey with workouts", () => {
    const fakeKey = "another_key";
    const workouts = [{ id: 2, exercise: "Squat" }];

    getWorkoutsKey.mockReturnValue(fakeKey);

    saveWorkouts(false, workouts);

    expect(getWorkoutsKey).toHaveBeenCalledTimes(1);
    expect(getWorkoutsKey).toHaveBeenCalledWith(false);

    expect(writeWorkoutsByKey).toHaveBeenCalledTimes(1);
    expect(writeWorkoutsByKey).toHaveBeenCalledWith(fakeKey, workouts);
  });

  it("migrateIfNeeded: calls migrateGuestToUnlimitedIfNeeded only when authed", () => {
    migrateIfNeeded(false);
    expect(migrateGuestToUnlimitedIfNeeded).not.toHaveBeenCalled();

    migrateIfNeeded(true);
    expect(migrateGuestToUnlimitedIfNeeded).toHaveBeenCalledTimes(1);
  });
});