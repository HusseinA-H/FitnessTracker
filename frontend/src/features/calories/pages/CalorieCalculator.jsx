import confetti from "canvas-confetti";
import { motion } from "framer-motion";
import { useState } from "react";

import NumberInput from "../components/NumberInput";

export default function CalorieCalculator() {
  const [form, setForm] = useState({
    gender: "male",
    age: "",
    weight: "",
    height: "",
    activity: "1.55",
    goal: "maintain",
  });

  const [result, setResult] = useState(null);
  const [mealPlan, setMealPlan] = useState("");

  const calculate = (e) => {
    e.preventDefault();

    const { gender, age, weight, height, activity, goal } = form;

    if (!age || !weight || !height) return;

    let bmr =
      gender === "male"
        ? 10 * weight + 6.25 * height - 5 * age + 5
        : 10 * weight + 6.25 * height - 5 * age - 161;

    let calories = bmr * parseFloat(activity);

    if (goal === "cut") calories -= 400;
    if (goal === "bulk") calories += 400;

    calories = Math.round(calories);

    let macros = {};
    if (goal === "cut") macros = { protein: 35, carbs: 35, fats: 30 };
    else if (goal === "bulk") macros = { protein: 30, carbs: 50, fats: 20 };
    else macros = { protein: 30, carbs: 40, fats: 30 };

    const protein = Math.round((calories * macros.protein) / 4 / 100);
    const carbs = Math.round((calories * macros.carbs) / 4 / 100);
    const fats = Math.round((calories * macros.fats) / 9 / 100);

    const bmi = (weight / ((height / 100) ** 2)).toFixed(1);

    const bodyFat =
      gender === "male"
        ? (1.2 * bmi + 0.23 * age - 16.2).toFixed(1)
        : (1.2 * bmi + 0.23 * age - 5.4).toFixed(1);

    setResult({ calories, protein, carbs, fats, bmi, bodyFat });

    generateMealPlan(goal, calories, protein);

    confetti({
      particleCount: 70,
      spread: 60,
      colors: ["#ff6b00", "#ff8c42", "#ffffff"],
      origin: { y: 0.6 },
    });
  };

  const generateMealPlan = (goal, calories, protein) => {
    let text = "";

    if (goal === "cut") {
      text = `
AI Nutrition Plan (Fat Loss Mode)

• Breakfast: Egg whites + oats
• Lunch: Chicken breast + rice + salad
• Dinner: Lean beef or fish + vegetables
• Snack: Greek yogurt

High protein intake (${protein}g) preserves muscle while cutting.
`;
    }

    if (goal === "bulk") {
      text = `
AI Nutrition Plan (Muscle Gain Mode)

• Breakfast: Whole eggs + oats + peanut butter
• Lunch: Chicken + rice + avocado
• Dinner: Beef + potatoes
• Snack: Protein shake + banana

Caloric surplus (~${calories}) optimized for lean mass gain.
`;
    }

    if (goal === "maintain") {
      text = `
AI Nutrition Plan (Performance Mode)

• Balanced meals around training
• Moderate carbs
• Lean protein focus

Designed for strength & recovery.
`;
    }

    setMealPlan(text);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f0f0f] text-white px-4 md:px-6 py-10">
      <div className="w-full max-w-4xl bg-[#111] p-6 md:p-10 rounded-3xl border border-gray-800 shadow-[0_0_60px_rgba(255,107,0,0.15)]">
        <h1 className="text-2xl md:text-4xl font-bold text-center mb-6 md:mb-8 leading-tight">
          Smart <span className="text-orange-500">AI Macro Calculator</span>
        </h1>

        <form onSubmit={calculate} className="grid md:grid-cols-2 gap-4 md:gap-6">
          <select
            name="gender"
            value={form.gender}
            onChange={(e) => setForm({ ...form, gender: e.target.value })}
            className="p-3 md:p-4 bg-black border border-gray-700 rounded-xl"
          >
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>

          <NumberInput
            value={form.age}
            setValue={(val) => setForm({ ...form, age: val })}
            placeholder="Age"
          />

          <NumberInput
            value={form.weight}
            setValue={(val) => setForm({ ...form, weight: val })}
            placeholder="Weight (kg)"
          />

          <NumberInput
            value={form.height}
            setValue={(val) => setForm({ ...form, height: val })}
            placeholder="Height (cm)"
          />

          <select
            name="activity"
            value={form.activity}
            onChange={(e) => setForm({ ...form, activity: e.target.value })}
            className="p-3 md:p-4 bg-black border border-gray-700 rounded-xl md:col-span-2"
          >
            <option value="1.2">Sedentary (1.2)</option>
            <option value="1.375">Light (1.375)</option>
            <option value="1.55">Moderate (1.55)</option>
            <option value="1.725">Active (1.725)</option>
            <option value="1.9">Very Active (1.9)</option>
          </select>

          <select
            name="goal"
            value={form.goal}
            onChange={(e) => setForm({ ...form, goal: e.target.value })}
            className="p-3 md:p-4 bg-black border border-gray-700 rounded-xl md:col-span-2"
          >
            <option value="cut">Cut</option>
            <option value="maintain">Maintain</option>
            <option value="bulk">Bulk</option>
          </select>

          <button
            type="submit"
            className="md:col-span-2 py-3 md:py-4 bg-orange-500 text-black font-bold rounded-xl hover:bg-orange-400 transition"
          >
            Calculate
          </button>
        </form>

        {result && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-8 md:mt-10 text-center space-y-2 md:space-y-3"
          >
            <p>
              Calories:{" "}
              <span className="text-orange-500 font-bold">{result.calories}</span>
            </p>
            <p>Protein: {result.protein}g</p>
            <p>Carbs: {result.carbs}g</p>
            <p>Fats: {result.fats}g</p>
            <p>BMI: {result.bmi}</p>
            <p>Estimated Body Fat: {result.bodyFat}%</p>

            <div className="mt-5 md:mt-6 text-left whitespace-pre-line bg-black p-4 md:p-6 rounded-xl border border-gray-700">
              {mealPlan}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}