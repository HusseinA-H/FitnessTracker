// src/features/workouts/data/exercises.js

/**
 * Single source of truth for exercise names (and optional default alt text).
 * البرامج هتشير للتمرين بـ exerciseId بدل تكرار name في كل مكان.
 */

export const EXERCISES = {
  // Chest / Push
  bench_press: { name: "Bench Press", defaultAlt: "DB Press" },
  barbell_bench_press: { name: "Barbell Bench Press", defaultAlt: "DB Press" },
  incline_bench: { name: "Incline Bench", defaultAlt: "Machine Press" },
  incline_db_press: { name: "Incline DB Press", defaultAlt: "Machine Press" },
  cable_chest_fly: { name: "Cable Chest Fly", defaultAlt: "Pec Deck" },
  incline_fly: { name: "Incline Fly", defaultAlt: "Cable Fly" },
  close_grip_bench: { name: "Close Grip Bench", defaultAlt: "Pushdown" },

  overhead_press: { name: "Overhead Press", defaultAlt: "Arnold Press" },
  shoulder_press: { name: "Shoulder Press", defaultAlt: "Arnold Press" },
  db_shoulder_press: { name: "DB Shoulder Press", defaultAlt: "Machine Press" },
  lateral_raises: { name: "Lateral Raises", defaultAlt: "Cable Lateral" },

  triceps_pushdown: { name: "Triceps Pushdown", defaultAlt: "Dips" },
  triceps_dips: { name: "Triceps Dips", defaultAlt: "Pushdown" },
  triceps_extension: { name: "Triceps Extension", defaultAlt: "Skull Crushers" },
  skull_crushers: { name: "Skull Crushers", defaultAlt: "Overhead Extension" },
  dips: { name: "Dips", defaultAlt: "Pushdown" },

  // Pull / Back / Biceps
  barbell_row: { name: "Barbell Row", defaultAlt: "Cable Row" },
  cable_row: { name: "Cable Row", defaultAlt: "Barbell Row" },
  seated_row: { name: "Seated Row", defaultAlt: "Cable Row" },
  pull_ups: { name: "Pull Ups", defaultAlt: "Lat Pulldown" },
  weighted_pull_up: { name: "Weighted Pull Up", defaultAlt: "Lat Pulldown" },
  lat_pulldown: { name: "Lat Pulldown", defaultAlt: "Pull Ups" },
  face_pull: { name: "Face Pull", defaultAlt: "Rear Delt Fly" },
  straight_arm_pulldown: { name: "Straight Arm Pulldown", defaultAlt: "Cable Pullover" },

  barbell_curl: { name: "Barbell Curl", defaultAlt: "EZ Curl" },
  preacher_curl: { name: "Preacher Curl", defaultAlt: "Cable Curl" },
  hammer_curl: { name: "Hammer Curl", defaultAlt: "Cable Curl" },

  // Lower / Legs
  back_squat: { name: "Back Squat", defaultAlt: "Leg Press" },
  front_squat: { name: "Front Squat", defaultAlt: "Hack Squat" },
  smith_squat: { name: "Smith Squat", defaultAlt: "Goblet Squat" },
  leg_press: { name: "Leg Press", defaultAlt: "Goblet Squat" },
  leg_press_high_foot: { name: "Leg Press (High Foot)", defaultAlt: "Goblet Squat" },
  leg_extension: { name: "Leg Extension", defaultAlt: "Sissy Squat" },
  walking_lunges: { name: "Walking Lunges", defaultAlt: "Split Squat" },
  bulgarian_split_squat: { name: "Bulgarian Split Squat", defaultAlt: "Step Ups" },
  step_ups: { name: "Step Ups", defaultAlt: "Bulgarian Split Squat" },

  deadlift: { name: "Deadlift", defaultAlt: "Trap Bar DL" },
  romanian_deadlift: { name: "Romanian Deadlift", defaultAlt: "Good Morning" },
  rdl: { name: "RDL", defaultAlt: "Hip Thrust" },
  hip_thrust: { name: "Hip Thrust", defaultAlt: "Glute Bridge" },
  barbell_hip_thrust: { name: "Barbell Hip Thrust", defaultAlt: "Glute Bridge" },
  hamstring_curl: { name: "Hamstring Curl", defaultAlt: "Nordic Curl" },
  leg_curl: { name: "Leg Curl", defaultAlt: "Nordic Curl" },
  ham_curl: { name: "Ham Curl", defaultAlt: "Nordic Curl" },
  cable_pull_through: { name: "Cable Pull Through", defaultAlt: "Kettlebell Swing" },

  calf_raises: { name: "Calf Raises", defaultAlt: "Seated Calf Raise" },
  calf_raise: { name: "Calf Raise", defaultAlt: "Seated Calf" },

  // Glutes / Accessories
  cable_kickback: { name: "Cable Kickback", defaultAlt: "Machine Kickback" },
  seated_abduction: { name: "Seated Abduction", defaultAlt: "Band Abduction" },
  abduction_machine: { name: "Abduction Machine", defaultAlt: "Band Walk" },
  core_circuit: { name: "Core Circuit", defaultAlt: "Plank Hold" },

  // Generic placeholder exercise (لو عندك عناصر زي Arms Finisher)
  arms_finisher: { name: "Arms Finisher", defaultAlt: "Superset" },
};