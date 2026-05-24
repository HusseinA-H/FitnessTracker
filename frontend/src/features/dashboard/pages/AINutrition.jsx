import { motion, AnimatePresence } from "framer-motion";
import { Apple, Calculator, Sparkles, MessageSquare, AlertCircle, RefreshCw } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { aiRepository, extractError } from "@/data/api/ai/aiRepository";

export default function AINutrition() {
  const navigate = useNavigate();

  // Calculator Form
  const [form, setForm] = useState({
    gender: "male",
    age: "25",
    height: "175",
    weight: "75",
    activity: "1.55", // Moderate
    goal: "lose", // lose / maintain / gain
    preference: "no_restrictions",
  });

  const [results, setResults] = useState(null);
  const [mealPlan, setMealPlan] = useState("");
  const [generatingPlan, setGeneratingPlan] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const calculateTargets = (e) => {
    e.preventDefault();
    const w = parseFloat(form.weight);
    const h = parseFloat(form.height);
    const a = parseFloat(form.age);
    const act = parseFloat(form.activity);

    if (isNaN(w) || isNaN(h) || isNaN(a)) return;

    // BMR using Mifflin-St Jeor
    let bmr = 10 * w + 6.25 * h - 5 * a;
    if (form.gender === "male") {
      bmr += 5;
    } else {
      bmr -= 161;
    }

    const tdee = bmr * act;

    // Calorie targets based on goal
    let calories = tdee;
    if (form.goal === "lose") calories -= 500;
    if (form.goal === "gain") calories += 500;
    calories = Math.round(calories);

    // Macros: 30% Protein, 40% Carbs, 30% Fats
    const protein = Math.round((calories * 0.3) / 4);
    const carbs = Math.round((calories * 0.4) / 4);
    const fats = Math.round((calories * 0.3) / 9);

    setResults({
      bmr: Math.round(bmr),
      tdee: Math.round(tdee),
      calories,
      protein,
      carbs,
      fats,
    });
    setMealPlan("");
  };

  const handleGenerateAIPlan = async () => {
    if (!results) return;
    setGeneratingPlan(true);
    setErrorMessage("");
    try {
      // 1. Prepare detailed prompt
      const prompt = (
        `Generate a daily meal plan and goal-based diet suggestions for a ${form.gender} user. ` +
        `Targets: ${results.calories} kcal, ${results.protein}g protein, ${results.carbs}g carbs, ${results.fats}g fat. ` +
        `Dietary Preference: ${form.preference.replace("_", " ")}. ` +
        `Provide 4 meals (Breakfast, Lunch, Dinner, Snack) with estimated macronutrients and brief, practical recipes.`
      );

      // 2. Fetch conversations to find a thread or create one
      const convsResponse = await aiRepository.getConversations();
      const conversations = convsResponse?.data || convsResponse || [];
      
      let targetConv;
      if (conversations.length > 0) {
        targetConv = conversations[0];
      } else {
        const createRes = await aiRepository.createConversation("Nutrition Thread");
        targetConv = createRes?.data || createRes;
      }

      // 3. Send message
      const sendRes = await aiRepository.sendMessage(targetConv.id, prompt);
      const data = sendRes?.data || sendRes;
      
      if (data.assistant_message) {
        setMealPlan(data.assistant_message.content);
      }
    } catch (err) {
      const parsed = extractError(err);
      setErrorMessage(parsed.message);
    } finally {
      setGeneratingPlan(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white px-6 md:px-12 py-24 space-y-16">
      {/* Title */}
      <header className="text-center space-y-4">
        <div className="mx-auto w-14 h-14 rounded-2xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-500 shadow-[0_0_20px_rgba(255,107,0,0.1)]">
          <Apple size={28} />
        </div>
        <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter">
          AI Nutrition <span className="text-orange-500">Planner</span>
        </h1>
        <p className="text-gray-400 max-w-xl mx-auto uppercase tracking-widest text-xs">
          Calorie target estimations, interactive macronutrient splits, and AI generated diet schedules
        </p>
      </header>

      {errorMessage && (
        <div className="max-w-4xl mx-auto p-4 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-between text-red-400 text-sm">
          <div className="flex items-center gap-3">
            <AlertCircle size={18} />
            <span>{errorMessage}</span>
          </div>
          <button
            onClick={() => setErrorMessage("")}
            className="text-xs font-black uppercase px-3 py-1.5 rounded-lg border border-red-500/20 hover:bg-red-500/20"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-start">
        {/* ================= CALCULATOR FORM ================= */}
        <form
          onSubmit={calculateTargets}
          className="bg-[#111] p-8 rounded-3xl border border-gray-800 space-y-6 shadow-xl"
        >
          <h2 className="text-2xl font-bold uppercase tracking-tight flex items-center gap-3">
            <Calculator className="text-orange-500" /> Target Calculator
          </h2>

          <div className="grid grid-cols-2 gap-4">
            {/* Gender */}
            <div className="space-y-1.5 col-span-2">
              <span className="block text-xs font-bold uppercase text-gray-500">Gender</span>
              <div className="grid grid-cols-2 gap-3">
                {["male", "female"].map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setForm({ ...form, gender: g })}
                    className={`py-3 rounded-xl border text-xs font-bold uppercase tracking-wider transition ${
                      form.gender === g
                        ? "bg-orange-500 border-orange-600 text-black"
                        : "bg-black border-gray-800 text-gray-400 hover:text-white"
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            {/* Age */}
            <div className="space-y-1.5">
              <span className="block text-xs font-bold uppercase text-gray-500">Age (Years)</span>
              <input
                type="number"
                value={form.age}
                onChange={(e) => setForm({ ...form, age: e.target.value })}
                className="w-full p-3 bg-black border border-gray-800 rounded-xl outline-none focus:border-orange-500 transition text-sm"
                required
              />
            </div>

            {/* Height */}
            <div className="space-y-1.5">
              <span className="block text-xs font-bold uppercase text-gray-500">Height (CM)</span>
              <input
                type="number"
                value={form.height}
                onChange={(e) => setForm({ ...form, height: e.target.value })}
                className="w-full p-3 bg-black border border-gray-800 rounded-xl outline-none focus:border-orange-500 transition text-sm"
                required
              />
            </div>

            {/* Weight */}
            <div className="space-y-1.5">
              <span className="block text-xs font-bold uppercase text-gray-500">Weight (KG)</span>
              <input
                type="number"
                value={form.weight}
                onChange={(e) => setForm({ ...form, weight: e.target.value })}
                className="w-full p-3 bg-black border border-gray-800 rounded-xl outline-none focus:border-orange-500 transition text-sm"
                required
              />
            </div>

            {/* Target Goal */}
            <div className="space-y-1.5">
              <span className="block text-xs font-bold uppercase text-gray-500">Weight Goal</span>
              <select
                value={form.goal}
                onChange={(e) => setForm({ ...form, goal: e.target.value })}
                className="w-full p-3 bg-black border border-gray-800 rounded-xl outline-none focus:border-orange-500 transition text-sm"
              >
                <option value="lose">Lose Weight</option>
                <option value="maintain">Maintain Weight</option>
                <option value="gain">Gain Weight</option>
              </select>
            </div>

            {/* Activity Level */}
            <div className="space-y-1.5 col-span-2">
              <span className="block text-xs font-bold uppercase text-gray-500">Activity Level</span>
              <select
                value={form.activity}
                onChange={(e) => setForm({ ...form, activity: e.target.value })}
                className="w-full p-3 bg-black border border-gray-800 rounded-xl outline-none focus:border-orange-500 transition text-sm"
              >
                <option value="1.2">Sedentary (Little to no exercise)</option>
                <option value="1.375">Lightly Active (1-3 days/week)</option>
                <option value="1.55">Moderately Active (3-5 days/week)</option>
                <option value="1.725">Very Active (6-7 days/week)</option>
              </select>
            </div>

            {/* Dietary Preference */}
            <div className="space-y-1.5 col-span-2">
              <span className="block text-xs font-bold uppercase text-gray-500">Diet Preference</span>
              <select
                value={form.preference}
                onChange={(e) => setForm({ ...form, preference: e.target.value })}
                className="w-full p-3 bg-black border border-gray-800 rounded-xl outline-none focus:border-orange-500 transition text-sm"
              >
                <option value="no_restrictions">No Restrictions</option>
                <option value="high_protein">High Protein</option>
                <option value="vegan">Vegan</option>
                <option value="keto">Keto</option>
                <option value="vegetarian">Vegetarian</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-4 bg-orange-500 text-black font-black uppercase text-xs rounded-xl hover:bg-orange-400 transition"
          >
            Calculate targets
          </button>
        </form>

        {/* ================= CALCULATOR RESULTS & AI GENERATOR ================= */}
        <div className="space-y-8">
          {results ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-[#111] p-8 rounded-3xl border border-gray-800 space-y-6 shadow-xl relative overflow-hidden"
            >
              <div className="absolute top-[-10%] right-[-10%] w-32 h-32 bg-orange-500/10 blur-3xl rounded-full" />
              <h2 className="text-2xl font-bold uppercase tracking-tight">Your Macro Targets</h2>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-black rounded-2xl border border-white/5 text-center col-span-2">
                  <div className="text-[10px] text-gray-500 font-bold uppercase">Daily Calories Target</div>
                  <div className="text-4xl font-black text-orange-500 mt-1 italic">{results.calories} kcal</div>
                </div>

                <div className="p-4 bg-black rounded-2xl border border-white/5 text-center">
                  <div className="text-[10px] text-gray-500 font-bold uppercase">Protein (30%)</div>
                  <div className="text-2xl font-black mt-1">{results.protein} g</div>
                </div>

                <div className="p-4 bg-black rounded-2xl border border-white/5 text-center">
                  <div className="text-[10px] text-gray-500 font-bold uppercase">Carbohydrates (40%)</div>
                  <div className="text-2xl font-black mt-1">{results.carbs} g</div>
                </div>

                <div className="p-4 bg-black rounded-2xl border border-white/5 text-center">
                  <div className="text-[10px] text-gray-500 font-bold uppercase">Fats (30%)</div>
                  <div className="text-2xl font-black mt-1">{results.fats} g</div>
                </div>

                <div className="p-4 bg-black rounded-2xl border border-white/5 text-center">
                  <div className="text-[10px] text-gray-500 font-bold uppercase">Est. TDEE Maintenance</div>
                  <div className="text-xl font-bold text-gray-400 mt-1">{results.tdee} kcal</div>
                </div>
              </div>

              {!mealPlan && (
                <button
                  onClick={handleGenerateAIPlan}
                  disabled={generatingPlan}
                  className="w-full py-4 bg-orange-500 text-black font-black uppercase text-xs rounded-xl hover:bg-orange-400 transition flex items-center justify-center gap-2"
                >
                  {generatingPlan ? (
                    <>
                      <RefreshCw size={16} className="animate-spin" /> Generating Plan...
                    </>
                  ) : (
                    <>
                      <Sparkles size={16} /> Generate AI Diet & Meal Plan
                    </>
                  )}
                </button>
              )}
            </motion.div>
          ) : (
            <div className="bg-white/[0.02] border border-white/5 p-12 rounded-3xl text-center text-gray-500 text-sm flex flex-col items-center gap-4">
              <Calculator size={36} className="text-orange-500/40" />
              <span>Fill in the calculator form and submit to calculate target macros and generate AI meal plans.</span>
            </div>
          )}

          {/* Meal Plan Results */}
          <AnimatePresence>
            {mealPlan && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#111] border border-gray-800 p-8 rounded-3xl space-y-6"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold uppercase tracking-tight flex items-center gap-2">
                    <Sparkles className="text-orange-500" size={18} /> FitCoach AI Diet Plan
                  </h3>
                  <button
                    onClick={() => {
                      // Navigate to AI Chat to discuss plan
                      navigate("/ai/chat");
                    }}
                    className="text-xs font-black uppercase text-orange-500 hover:underline flex items-center gap-1"
                  >
                    <MessageSquare size={14} /> Discuss in Chat
                  </button>
                </div>

                <div className="bg-black/40 border border-white/5 rounded-2xl p-6 text-sm text-gray-300 leading-relaxed whitespace-pre-wrap max-h-[450px] overflow-y-auto custom-scrollbar">
                  {mealPlan}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
