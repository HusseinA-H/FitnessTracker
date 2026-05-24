// src/features/workouts/data/hydratePrograms.js
import { EXERCISES } from "./exercises";

/**
 * يحول بيانات البرامج من الشكل:
 * { exerciseId, sets, reps, rest, ... }
 * للشكل اللي الـ UI متوقعه:
 * { name, alt, sets, reps, rest, ... }
 */
export function hydrateProgram(program) {
  return {
    ...program,
    days: program.days.map((day) => ({
      ...day,
      exercises: day.exercises.map((ex) => {
        const meta = EXERCISES[ex.exerciseId];

        // لو في ID غلط، نخلي الاسم = exerciseId عشان ما يكسرش الواجهة
        const name = meta?.name ?? ex.exerciseId;
        const alt = ex.alt ?? meta?.defaultAlt;

        return {
          ...ex,
          name,
          alt,
        };
      }),
    })),
  };
}

export function hydratePrograms(programs) {
  return programs.map(hydrateProgram);
}

/** Validation اختياري (ينفع تشغله مرة في dev) */
export function validatePrograms(programs) {
  const missing = [];

  for (const p of programs) {
    for (const d of p.days) {
      for (const e of d.exercises) {
        if (!EXERCISES[e.exerciseId]) {
          missing.push({ programId: p.id, day: d.name, exerciseId: e.exerciseId });
        }
      }
    }
  }

  return missing;
}