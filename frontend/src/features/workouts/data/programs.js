// src/features/workouts/data/programs.js
import { hydratePrograms, validatePrograms } from "./hydratePrograms";

/* ===================================================== */
/* 💪 RESISTANCE PROGRAMS (RAW + NORMALIZED) */
/* ===================================================== */

const rawPrograms = [
  /* 1️⃣ ANTERIOR x POSTERIOR */
  {
    id: "anterior-posterior",
    title: "Anterior x Posterior",
    level: "6 Days High Frequency",
    days: [
      {
        name: "Day 1 – Anterior Upper",
        exercises: [
          { exerciseId: "barbell_bench_press", sets: 4, reps: "6-8", rest: "120s", rpe: "8", alt: "DB Press" },
          { exerciseId: "incline_db_press", sets: 3, reps: "8-10", rest: "90s", rpe: "8", alt: "Machine Press" },
          { exerciseId: "overhead_press", sets: 3, reps: "8-10", rest: "90s", rpe: "8", alt: "Arnold Press" },
          { exerciseId: "cable_chest_fly", sets: 3, reps: "12-15", rest: "60s", rpe: "9", alt: "Pec Deck" },
          { exerciseId: "triceps_pushdown", sets: 3, reps: "12-15", rest: "60s", rpe: "9", alt: "Dips" },
        ],
      },
      {
        name: "Day 2 – Posterior Upper",
        exercises: [
          { exerciseId: "barbell_row", sets: 4, reps: "6-8", rest: "120s", rpe: "8", alt: "Cable Row" },
          { exerciseId: "pull_ups", sets: 4, reps: "8-10", rest: "90s", rpe: "8", alt: "Lat Pulldown" },
          { exerciseId: "face_pull", sets: 3, reps: "12-15", rest: "60s", rpe: "9", alt: "Rear Delt Fly" },
          { exerciseId: "barbell_curl", sets: 3, reps: "10-12", rest: "60s", rpe: "8", alt: "EZ Curl" },
          { exerciseId: "hammer_curl", sets: 3, reps: "12", rest: "60s", rpe: "9", alt: "Cable Curl" },
        ],
      },
      {
        name: "Day 3 – Anterior Lower",
        exercises: [
          { exerciseId: "front_squat", sets: 4, reps: "6-8", rest: "120s", rpe: "8", alt: "Hack Squat" },
          { exerciseId: "leg_press", sets: 4, reps: "10", rest: "90s", rpe: "8", alt: "Goblet Squat" },
          { exerciseId: "leg_extension", sets: 3, reps: "12-15", rest: "60s", rpe: "9", alt: "Sissy Squat" },
          { exerciseId: "walking_lunges", sets: 3, reps: "12", rest: "60s", rpe: "8", alt: "Split Squat" },
          { exerciseId: "calf_raises", sets: 4, reps: "15-20", rest: "45s", rpe: "9", alt: "Seated Calf Raise" },
        ],
      },
      {
        name: "Day 4 – Posterior Lower",
        exercises: [
          { exerciseId: "deadlift", sets: 4, reps: "4-6", rest: "150s", rpe: "8", alt: "Trap Bar DL" },
          { exerciseId: "romanian_deadlift", sets: 4, reps: "8", rest: "120s", rpe: "8", alt: "Good Morning" },
          { exerciseId: "hip_thrust", sets: 4, reps: "10", rest: "90s", rpe: "8", alt: "Glute Bridge" },
          { exerciseId: "hamstring_curl", sets: 3, reps: "12-15", rest: "60s", rpe: "9", alt: "Nordic Curl" },
          { exerciseId: "cable_pull_through", sets: 3, reps: "15", rest: "60s", rpe: "9", alt: "Kettlebell Swing" },
        ],
      },
      {
        name: "Day 5 – Upper Volume",
        exercises: [
          { exerciseId: "incline_bench", sets: 3, reps: "10-12", rest: "90s", rpe: "8", alt: "Machine Press" },
          { exerciseId: "lat_pulldown", sets: 3, reps: "10-12", rest: "90s", rpe: "8", alt: "Pull Ups" },
          { exerciseId: "lateral_raises", sets: 4, reps: "15", rest: "45s", rpe: "9", alt: "Cable Lateral" },
          { exerciseId: "skull_crushers", sets: 3, reps: "12", rest: "60s", rpe: "9", alt: "Overhead Extension" },
          { exerciseId: "preacher_curl", sets: 3, reps: "12", rest: "60s", rpe: "9", alt: "Cable Curl" },
        ],
      },
      {
        name: "Day 6 – Lower Volume",
        exercises: [
          { exerciseId: "back_squat", sets: 3, reps: "10", rest: "90s", rpe: "8", alt: "Leg Press" },
          { exerciseId: "rdl", sets: 3, reps: "10-12", rest: "90s", rpe: "8", alt: "Hip Thrust" },
          { exerciseId: "step_ups", sets: 3, reps: "12", rest: "60s", rpe: "8", alt: "Bulgarian Split Squat" },
          { exerciseId: "leg_curl", sets: 3, reps: "15", rest: "60s", rpe: "9", alt: "Nordic Curl" },
          { exerciseId: "calf_raises", sets: 4, reps: "20", rest: "45s", rpe: "9", alt: "Seated Calf" },
        ],
      },
    ],
  },

  /* 2️⃣ ARNOLD x UL (5 Days) */
  {
    id: "arnold-ul",
    title: "Arnold x U-L",
    level: "5 Days Hybrid",
    days: [
      {
        name: "Day 1 – Chest & Back",
        exercises: [
          { exerciseId: "bench_press", sets: 4, reps: "8", rest: "90s", rpe: "8", alt: "DB Press" },
          { exerciseId: "pull_ups", sets: 4, reps: "8-10", rest: "90s", rpe: "8", alt: "Lat Pulldown" },
          { exerciseId: "incline_fly", sets: 3, reps: "12", rest: "60s", rpe: "9", alt: "Cable Fly" },
          { exerciseId: "barbell_row", sets: 3, reps: "8-10", rest: "90s", rpe: "8", alt: "Machine Row" },
          { exerciseId: "straight_arm_pulldown", sets: 3, reps: "15", rest: "60s", rpe: "9", alt: "Cable Pullover" },
        ],
      },
      {
        name: "Day 2 – Shoulders & Arms",
        exercises: [
          { exerciseId: "overhead_press", sets: 4, reps: "6-8", rest: "120s", rpe: "8", alt: "DB Press" },
          { exerciseId: "lateral_raises", sets: 4, reps: "15", rest: "45s", rpe: "9", alt: "Cable Lateral" },
          { exerciseId: "barbell_curl", sets: 3, reps: "10", rest: "60s", rpe: "8", alt: "EZ Curl" },
          { exerciseId: "triceps_dips", sets: 3, reps: "10-12", rest: "60s", rpe: "8", alt: "Pushdown" },
          { exerciseId: "hammer_curl", sets: 3, reps: "12", rest: "60s", rpe: "9", alt: "Cable Curl" },
        ],
      },
      {
        name: "Day 3 – Shoulders & Arms",
        exercises: [
          { exerciseId: "overhead_press", sets: 4, reps: "6-8", rest: "120s", rpe: "8", alt: "DB Press" },
          { exerciseId: "lateral_raises", sets: 4, reps: "15", rest: "45s", rpe: "9", alt: "Cable Lateral" },
          { exerciseId: "barbell_curl", sets: 3, reps: "10", rest: "60s", rpe: "8", alt: "EZ Curl" },
          { exerciseId: "triceps_dips", sets: 3, reps: "10-12", rest: "60s", rpe: "8", alt: "Pushdown" },
          { exerciseId: "hammer_curl", sets: 3, reps: "12", rest: "60s", rpe: "9", alt: "Cable Curl" },
        ],
      },
      {
        name: "Day 4 – Shoulders & Arms",
        exercises: [
          { exerciseId: "overhead_press", sets: 4, reps: "6-8", rest: "120s", rpe: "8", alt: "DB Press" },
          { exerciseId: "lateral_raises", sets: 4, reps: "15", rest: "45s", rpe: "9", alt: "Cable Lateral" },
          { exerciseId: "barbell_curl", sets: 3, reps: "10", rest: "60s", rpe: "8", alt: "EZ Curl" },
          { exerciseId: "triceps_dips", sets: 3, reps: "10-12", rest: "60s", rpe: "8", alt: "Pushdown" },
          { exerciseId: "hammer_curl", sets: 3, reps: "12", rest: "60s", rpe: "9", alt: "Cable Curl" },
        ],
      },
      {
        name: "Day 5 – Lower",
        exercises: [
          { exerciseId: "back_squat", sets: 4, reps: "6-8", rest: "120s", rpe: "8", alt: "Leg Press" },
          { exerciseId: "rdl", sets: 4, reps: "8", rest: "90s", rpe: "8", alt: "Hip Thrust" },
          { exerciseId: "leg_extension", sets: 3, reps: "15", rest: "60s", rpe: "9", alt: "Sissy Squat" },
          { exerciseId: "ham_curl", sets: 3, reps: "12", rest: "60s", rpe: "9", alt: "Nordic Curl" },
          { exerciseId: "calf_raise", sets: 4, reps: "20", rest: "45s", rpe: "9", alt: "Seated Calf" },
        ],
      },
    ],
  },

  /* 3️⃣ 3-Day Mass Builder */
  {
    id: "3day-mass",
    title: "The 3-Day Mass Builder",
    level: "3 Days",
    days: [
      {
        name: "Day 1 – Push",
        exercises: [
          { exerciseId: "bench_press", sets: 4, reps: "6-8", rest: "120s", rpe: "8", alt: "DB Press" },
          { exerciseId: "overhead_press", sets: 4, reps: "8", rest: "90s", rpe: "8", alt: "Machine Press" },
          { exerciseId: "dips", sets: 3, reps: "10-12", rest: "60s", rpe: "8", alt: "Pushdown" },
          { exerciseId: "lateral_raises", sets: 3, reps: "15", rest: "45s", rpe: "9", alt: "Cable Lateral" },
          { exerciseId: "triceps_extension", sets: 3, reps: "12", rest: "60s", rpe: "9", alt: "Skull Crushers" },
        ],
      },
      {
        name: "Day 2 – Pull",
        exercises: [
          { exerciseId: "deadlift", sets: 4, reps: "5", rest: "150s", rpe: "8", alt: "Trap Bar DL" },
          { exerciseId: "barbell_row", sets: 4, reps: "8", rest: "90s", rpe: "8", alt: "Cable Row" },
          { exerciseId: "pull_ups", sets: 3, reps: "8-10", rest: "90s", rpe: "8", alt: "Lat Pulldown" },
          { exerciseId: "barbell_curl", sets: 3, reps: "12", rest: "60s", rpe: "9", alt: "EZ Curl" },
          { exerciseId: "face_pull", sets: 3, reps: "15", rest: "60s", rpe: "9", alt: "Rear Delt Fly" },
        ],
      },
      {
        name: "Day 3 – Legs",
        exercises: [
          { exerciseId: "back_squat", sets: 4, reps: "6-8", rest: "120s", rpe: "8", alt: "Leg Press" },
          { exerciseId: "rdl", sets: 4, reps: "8", rest: "90s", rpe: "8", alt: "Hip Thrust" },
          { exerciseId: "walking_lunges", sets: 3, reps: "12", rest: "60s", rpe: "8", alt: "Split Squat" },
          { exerciseId: "leg_curl", sets: 3, reps: "12-15", rest: "60s", rpe: "9", alt: "Nordic Curl" },
          { exerciseId: "calf_raise", sets: 4, reps: "20", rest: "45s", rpe: "9", alt: "Seated Calf" },
        ],
      },
    ],
  },

  /* 4️⃣ MUSCLE MOMMIES – 4 Days */
  {
    id: "muscle-mommies",
    title: "Muscle Mommies",
    level: "4 Days",
    days: [
      {
        name: "Day 1 – Glutes Focus",
        exercises: [
          { exerciseId: "barbell_hip_thrust", sets: 4, reps: "8-10", rest: "90s", alt: "Glute Bridge" },
          { exerciseId: "bulgarian_split_squat", sets: 3, reps: "10", rest: "60s", alt: "Step Ups" },
          { exerciseId: "cable_kickback", sets: 3, reps: "15", rest: "45s", alt: "Machine Kickback" },
          { exerciseId: "leg_press_high_foot", sets: 3, reps: "12", rest: "60s", alt: "Goblet Squat" },
          { exerciseId: "seated_abduction", sets: 4, reps: "20", rest: "45s", alt: "Band Abduction" },
        ],
      },
      {
        name: "Day 2 – Upper Body",
        exercises: [
          { exerciseId: "lat_pulldown", sets: 4, reps: "8-10", rest: "90s", alt: "Pull Ups" },
          { exerciseId: "seated_row", sets: 3, reps: "10-12", rest: "60s", alt: "Cable Row" },
          { exerciseId: "db_shoulder_press", sets: 3, reps: "10", rest: "60s", alt: "Machine Press" },
          { exerciseId: "lateral_raises", sets: 4, reps: "15", rest: "45s", alt: "Cable Lateral" },
          { exerciseId: "triceps_pushdown", sets: 3, reps: "12-15", rest: "60s", alt: "Dips" },
        ],
      },
      {
        name: "Day 3 – Lower Strength",
        exercises: [
          { exerciseId: "back_squat", sets: 4, reps: "6-8", rest: "120s", alt: "Leg Press" },
          { exerciseId: "rdl", sets: 4, reps: "8", rest: "90s", alt: "Hip Thrust" },
          { exerciseId: "walking_lunges", sets: 3, reps: "12", rest: "60s", alt: "Split Squat" },
          { exerciseId: "leg_curl", sets: 3, reps: "15", rest: "60s", alt: "Nordic Curl" },
          { exerciseId: "calf_raise", sets: 4, reps: "20", rest: "45s", alt: "Seated Calf" },
        ],
      },
      {
        name: "Day 4 – Glute Volume",
        exercises: [
          { exerciseId: "hip_thrust", sets: 4, reps: "12", rest: "60s", alt: "Glute Bridge" },
          { exerciseId: "cable_kickback", sets: 4, reps: "15", rest: "45s", alt: "Band Kickback" },
          { exerciseId: "smith_squat", sets: 3, reps: "12", rest: "60s", alt: "Goblet Squat" },
          { exerciseId: "abduction_machine", sets: 4, reps: "20", rest: "45s", alt: "Band Walk" },
          { exerciseId: "core_circuit", sets: 3, reps: "AMRAP", rest: "60s", alt: "Plank Hold" },
        ],
      },
    ],
  },

  /* 5️⃣ PUSH PULL LEGS x U-L – 5 Days */
  {
    id: "ppl-ul",
    title: "Push Pull Legs x Upper Lower",
    level: "5 Days",
    days: [
      {
        name: "Day 1 – Push",
        exercises: [
          { exerciseId: "bench_press", sets: 4, reps: "6-8", rest: "120s", alt: "DB Press" },
          { exerciseId: "overhead_press", sets: 3, reps: "8-10", rest: "90s", alt: "Machine Press" },
          { exerciseId: "incline_db_press", sets: 3, reps: "10", rest: "90s", alt: "Cable Fly" },
          { exerciseId: "lateral_raises", sets: 4, reps: "15", rest: "45s", alt: "Cable Lateral" },
          { exerciseId: "triceps_pushdown", sets: 3, reps: "12-15", rest: "60s", alt: "Dips" },
        ],
      },
      {
        name: "Day 2 – Pull",
        exercises: [
          { exerciseId: "deadlift", sets: 4, reps: "5", rest: "150s", alt: "Trap Bar DL" },
          { exerciseId: "barbell_row", sets: 4, reps: "8", rest: "90s", alt: "Cable Row" },
          { exerciseId: "pull_ups", sets: 3, reps: "8-10", rest: "90s", alt: "Lat Pulldown" },
          { exerciseId: "barbell_curl", sets: 3, reps: "12", rest: "60s", alt: "EZ Curl" },
          { exerciseId: "face_pull", sets: 3, reps: "15", rest: "60s", alt: "Rear Delt Fly" },
        ],
      },
      {
        name: "Day 3 – Legs",
        exercises: [
          { exerciseId: "back_squat", sets: 4, reps: "6-8", rest: "120s", alt: "Leg Press" },
          { exerciseId: "rdl", sets: 4, reps: "8", rest: "90s", alt: "Hip Thrust" },
          { exerciseId: "walking_lunges", sets: 3, reps: "12", rest: "60s", alt: "Split Squat" },
          { exerciseId: "leg_curl", sets: 3, reps: "12-15", rest: "60s", alt: "Nordic Curl" },
          { exerciseId: "calf_raise", sets: 4, reps: "20", rest: "45s", alt: "Seated Calf" },
        ],
      },
      {
        name: "Day 4 – Upper",
        exercises: [
          { exerciseId: "incline_bench", sets: 4, reps: "8", rest: "90s", alt: "Machine Press" },
          { exerciseId: "lat_pulldown", sets: 4, reps: "8-10", rest: "90s", alt: "Pull Ups" },
          { exerciseId: "shoulder_press", sets: 3, reps: "10", rest: "60s", alt: "Arnold Press" },
          { exerciseId: "cable_row", sets: 3, reps: "12", rest: "60s", alt: "Barbell Row" },
          { exerciseId: "arms_finisher", sets: 3, reps: "AMRAP", rest: "60s", alt: "Superset" },
        ],
      },
      {
        name: "Day 5 – Lower",
        exercises: [
          { exerciseId: "front_squat", sets: 4, reps: "6-8", rest: "120s", alt: "Hack Squat" },
          { exerciseId: "hip_thrust", sets: 4, reps: "8-10", rest: "90s", alt: "Glute Bridge" },
          { exerciseId: "leg_press", sets: 3, reps: "12", rest: "60s", alt: "Goblet Squat" },
          { exerciseId: "ham_curl", sets: 3, reps: "15", rest: "60s", alt: "Nordic Curl" },
          { exerciseId: "calf_raise", sets: 4, reps: "20", rest: "45s", alt: "Seated Calf" },
        ],
      },
    ],
  },

  /* 6️⃣ ELITE STRENGTH FORMULA */
  {
    id: "elite-strength",
    title: "Elite Strength Formula",
    level: "4 Days Power",
    days: [
      {
        name: "Day 1 – Push",
        exercises: [
          { exerciseId: "bench_press", sets: 4, reps: "6-8", rest: "120s", alt: "DB Press" },
          { exerciseId: "overhead_press", sets: 3, reps: "8-10", rest: "90s", alt: "Machine Press" },
          { exerciseId: "incline_db_press", sets: 3, reps: "10", rest: "90s", alt: "Cable Fly" },
          { exerciseId: "lateral_raises", sets: 4, reps: "15", rest: "45s", alt: "Cable Lateral" },
          { exerciseId: "triceps_pushdown", sets: 3, reps: "12-15", rest: "60s", alt: "Dips" },
        ],
      },
      {
        name: "Day 2 – Pull",
        exercises: [
          { exerciseId: "deadlift", sets: 4, reps: "5", rest: "150s", alt: "Trap Bar DL" },
          { exerciseId: "barbell_row", sets: 4, reps: "8", rest: "90s", alt: "Cable Row" },
          { exerciseId: "pull_ups", sets: 3, reps: "8-10", rest: "90s", alt: "Lat Pulldown" },
          { exerciseId: "barbell_curl", sets: 3, reps: "12", rest: "60s", alt: "EZ Curl" },
          { exerciseId: "face_pull", sets: 3, reps: "15", rest: "60s", alt: "Rear Delt Fly" },
        ],
      },
      {
        name: "Day 3 – Legs",
        exercises: [
          { exerciseId: "back_squat", sets: 4, reps: "6-8", rest: "120s", alt: "Leg Press" },
          { exerciseId: "rdl", sets: 4, reps: "8", rest: "90s", alt: "Hip Thrust" },
          { exerciseId: "walking_lunges", sets: 3, reps: "12", rest: "60s", alt: "Split Squat" },
          { exerciseId: "leg_curl", sets: 3, reps: "12-15", rest: "60s", alt: "Nordic Curl" },
          { exerciseId: "calf_raise", sets: 4, reps: "20", rest: "45s", alt: "Seated Calf" },
        ],
      },
      {
        name: "Upper Power",
        exercises: [
          { exerciseId: "bench_press", sets: 5, reps: "5", rest: "150s", rpe: "8", alt: "DB Press" },
          { exerciseId: "weighted_pull_up", sets: 4, reps: "6", rest: "120s", rpe: "8", alt: "Lat Pulldown" },
          { exerciseId: "overhead_press", sets: 4, reps: "6", rest: "120s", rpe: "8", alt: "Machine Press" },
          { exerciseId: "barbell_curl", sets: 3, reps: "8", rest: "90s", rpe: "8", alt: "EZ Curl" },
          { exerciseId: "close_grip_bench", sets: 3, reps: "8", rest: "90s", rpe: "8", alt: "Pushdown" },
        ],
      },
    ],
  },
];

// Hydrated export (UI keeps working because it expects ex.name/ex.alt)
export const programs = hydratePrograms(rawPrograms);

// Optional: warn in dev if any exerciseId is missing from catalog
if (typeof window !== "undefined") {
  const missing = validatePrograms(rawPrograms);
  if (missing.length) {
     
    console.warn("Missing exercise IDs in EXERCISES catalog:", missing);
  }
}

/* ===================================================== */
/* 🫀 CARDIO WORKOUTS */
/* ===================================================== */

export const cardioWorkouts = [
  {
    name: "Treadmill Intervals",
    duration: "20 Minutes",
    intensity: "High",
    description: "30s sprint + 60s walk × 10 rounds",
  },
  {
    name: "StairMaster Climb",
    duration: "15 Minutes",
    intensity: "Moderate",
    description: "Steady climb pace with posture control",
  },
  {
    name: "HIIT Bike Sprints",
    duration: "15 Minutes",
    intensity: "Very High",
    description: "20s sprint + 40s slow pedal × 12",
  },
  {
    name: "Rowing Machine",
    duration: "2000m",
    intensity: "High",
    description: "Power focus with controlled strokes",
  },
  {
    name: "Battle Ropes",
    duration: "10 Minutes",
    intensity: "High",
    description: "30s waves + 30s rest",
  },
  {
    name: "Jump Rope",
    duration: "10–15 Minutes",
    intensity: "Moderate",
    description: "Fast tempo rounds",
  },
  {
    name: "Incline Walking",
    duration: "20–30 Minutes",
    intensity: "Low",
    description: "Fat burning steady pace",
  },
  {
    name: "Outdoor Sprint",
    duration: "10 Rounds",
    intensity: "Very High",
    description: "40m sprint + full rest",
  },
];