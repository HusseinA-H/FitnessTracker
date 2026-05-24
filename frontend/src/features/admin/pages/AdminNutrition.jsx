import { motion, AnimatePresence } from "framer-motion";
import {
  Apple,
  Plus,
  Edit2,
  Trash2,
  AlertCircle,
  RefreshCw,
  X,
  Flame
} from "lucide-react";
import { useEffect, useState } from "react";

import { adminRepository } from "../../../data/api/admin/adminRepository";

import ConfirmationDialog from "@shared/components/ConfirmationDialog";
import { SkeletonCard } from "@shared/components/Skeleton";
import { useToast } from "@shared/components/Toast";

export default function AdminNutrition() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const toast = useToast();

  // Form State
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Fields
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [calories, setCalories] = useState("2000");
  const [protein, setProtein] = useState("150");
  const [carbs, setCarbs] = useState("200");
  const [fats, setFats] = useState("65");
  const [isActive, setIsActive] = useState(true);

  // Meals Data fields
  const [breakfast, setBreakfast] = useState("");
  const [lunch, setLunch] = useState("");
  const [dinner, setDinner] = useState("");
  const [snack, setSnack] = useState("");

  // Confirmation state
  const [pendingDeleteId, setPendingDeleteId] = useState(null);

  const fetchNutritionTemplates = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await adminRepository.getNutritionTemplates();
      setTemplates(response?.data || response || []);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch nutrition and diet plans templates catalog.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNutritionTemplates();
  }, []);

  const handleOpenCreate = () => {
    setEditId(null);
    setName("");
    setDescription("");
    setCalories("2000");
    setProtein("150");
    setCarbs("200");
    setFats("65");
    setIsActive(true);
    setBreakfast("");
    setLunch("");
    setDinner("");
    setSnack("");
    setShowModal(true);
  };

  const handleOpenEdit = (temp) => {
    setEditId(temp.id);
    setName(temp.name || "");
    setDescription(temp.description || "");
    setCalories(String(temp.calories || "2000"));
    setProtein(String(temp.protein || "150"));
    setCarbs(String(temp.carbs || "200"));
    setFats(String(temp.fats || "65"));
    setIsActive(temp.is_active !== false);

    const meals = temp.meals_data || {};
    setBreakfast(meals.breakfast || "");
    setLunch(meals.lunch || "");
    setDinner(meals.dinner || "");
    setSnack(meals.snack || "");
    setShowModal(true);
  };

  const triggerDelete = (id) => {
    setPendingDeleteId(id);
  };

  const executeDelete = async () => {
    if (!pendingDeleteId) return;
    const id = pendingDeleteId;
    setPendingDeleteId(null);
    try {
      await adminRepository.deleteNutritionTemplate(id);
      setTemplates(prev => prev.filter(t => t.id !== id));
      toast.success("Nutrition template deleted successfully.");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete nutrition plan template.");
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!name || !calories) return;

    setSubmitting(true);
    const payload = {
      name,
      description,
      calories: parseInt(calories),
      protein: parseInt(protein),
      carbs: parseInt(carbs),
      fats: parseInt(fats),
      is_active: isActive,
      meals_data: {
        breakfast,
        lunch,
        border: "1px solid #ff6b00",
        dinner,
        snack
      }
    };

    try {
      if (editId) {
        const response = await adminRepository.updateNutritionTemplate(editId, payload);
        const updated = response?.data || response;
        setTemplates(prev => prev.map(t => t.id === editId ? updated : t));
        toast.success("Diet plan template updated successfully!");
      } else {
        const response = await adminRepository.createNutritionTemplate(payload);
        const created = response?.data || response;
        setTemplates(prev => [...prev, created]);
        toast.success("New diet plan template published!");
      }
      setShowModal(false);
    } catch (err) {
      toast.error("Failed to save diet template: " + (err?.body?.detail || err?.message));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-8 space-y-8 pt-24">
      {/* Title */}
      <div className="flex items-center justify-between border-b border-white/5 pb-5">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tight">Nutrition Templates</h1>
          <p className="text-xs text-gray-500 uppercase tracking-widest mt-1">Manage macro presets and structured meal plan templates for premium users</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="px-4 py-2.5 bg-orange-500 hover:bg-orange-400 text-black font-black uppercase text-xs rounded-xl transition flex items-center gap-2"
        >
          <Plus size={14} /> Add Diet Plan
        </button>
      </div>

      {/* Main List */}
      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : error ? (
        <div className="bg-red-500/10 border border-red-500/30 p-6 rounded-2xl flex items-center gap-3 text-red-400 text-sm">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      ) : templates.length === 0 ? (
        <div className="bg-white/[0.02] border border-white/5 p-16 rounded-3xl text-center text-gray-500 text-sm">
          No nutrition templates found. Click the button above to publish meal schedules presets.
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((temp) => (
            <div key={temp.id} className="p-6 bg-[#111] border border-white/5 rounded-2xl space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start">
                  <h4 className="font-bold text-white uppercase text-sm leading-tight">{temp.name}</h4>
                  <span className="text-[10px] font-bold text-orange-500 flex items-center gap-1">
                    <Flame size={12} /> {temp.calories} kcal
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-2 line-clamp-3 leading-relaxed">
                  {temp.description || "No description provided."}
                </p>

                {/* Macro breakdown preview */}
                <div className="grid grid-cols-3 gap-2 mt-4 text-center bg-black/40 border border-white/5 p-3 rounded-xl text-[10px] font-bold">
                  <div>
                    <span className="text-gray-500 block uppercase">Prot</span>
                    <span className="text-white">{temp.protein}g</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block uppercase">Carb</span>
                    <span className="text-white">{temp.carbs}g</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block uppercase">Fat</span>
                    <span className="text-white">{temp.fats}g</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-white/5 mt-3 flex items-center justify-between">
                <span className={`text-[9px] font-bold uppercase ${temp.is_active ? "text-green-500" : "text-gray-500"}`}>
                  {temp.is_active ? "Visible to Users" : "Draft Status"}
                </span>
                <div className="flex gap-1.5 shrink-0">
                  <button
                    onClick={() => handleOpenEdit(temp)}
                    className="p-1.5 bg-white/5 border border-white/5 hover:border-orange-500/30 hover:bg-orange-500/10 text-gray-400 hover:text-orange-500 rounded-lg transition"
                  >
                    <Edit2 size={12} />
                  </button>
                  <button
                    onClick={() => triggerDelete(temp.id)}
                    className="p-1.5 bg-white/5 border border-white/5 hover:border-red-500/30 hover:bg-red-500/10 text-gray-400 hover:text-red-500 rounded-lg transition"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ================= EDIT/CREATE NUTRITION TEMPLATE MODAL ================= */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-[98] p-4">
            <motion.div
              className="bg-[#111] border border-gray-800 max-w-lg w-full p-8 rounded-3xl overflow-hidden shadow-2xl relative space-y-5 max-h-[90vh] overflow-y-auto custom-scrollbar"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
            >
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white p-2 rounded-xl transition"
              >
                <X size={18} />
              </button>

              <h3 className="text-2xl font-black uppercase tracking-tight flex items-center gap-3">
                <Apple className="text-orange-500" size={22} />
                {editId ? "Edit Diet Plan Blueprint" : "Create Diet Plan Blueprint"}
              </h3>

              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {/* Name */}
                  <div className="space-y-1.5 col-span-2">
                    <span className="block text-[10px] font-black text-gray-500 uppercase">Template Name</span>
                    <input
                      type="text"
                      placeholder="e.g. 2000 kcal Lean Bulk High Protein"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full p-3 bg-black border border-gray-800 rounded-xl text-xs outline-none focus:border-orange-500 transition text-gray-200"
                      required
                    />
                  </div>

                  {/* Description */}
                  <div className="space-y-1.5 col-span-2">
                    <span className="block text-[10px] font-black text-gray-500 uppercase">Brief Description</span>
                    <textarea
                      placeholder="Specify who this plan is tailored for..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={2}
                      className="w-full p-3 bg-black border border-gray-800 rounded-xl text-xs outline-none focus:border-orange-500 transition text-gray-200 resize-none"
                    />
                  </div>

                  {/* Calories */}
                  <div className="space-y-1.5">
                    <span className="block text-[10px] font-black text-gray-500 uppercase">Calories (kcal)</span>
                    <input
                      type="number"
                      value={calories}
                      onChange={(e) => setCalories(e.target.value)}
                      className="w-full p-3 bg-black border border-gray-800 rounded-xl text-xs outline-none focus:border-orange-500 transition text-gray-200"
                      required
                    />
                  </div>

                  {/* Protein */}
                  <div className="space-y-1.5">
                    <span className="block text-[10px] font-black text-gray-500 uppercase">Protein (grams)</span>
                    <input
                      type="number"
                      value={protein}
                      onChange={(e) => setProtein(e.target.value)}
                      className="w-full p-3 bg-black border border-gray-800 rounded-xl text-xs outline-none focus:border-orange-500 transition text-gray-200"
                      required
                    />
                  </div>

                  {/* Carbs */}
                  <div className="space-y-1.5">
                    <span className="block text-[10px] font-black text-gray-500 uppercase">Carbohydrates (grams)</span>
                    <input
                      type="number"
                      value={carbs}
                      onChange={(e) => setCarbs(e.target.value)}
                      className="w-full p-3 bg-black border border-gray-800 rounded-xl text-xs outline-none focus:border-orange-500 transition text-gray-200"
                      required
                    />
                  </div>

                  {/* Fats */}
                  <div className="space-y-1.5">
                    <span className="block text-[10px] font-black text-gray-500 uppercase">Fats (grams)</span>
                    <input
                      type="number"
                      value={fats}
                      onChange={(e) => setFats(e.target.value)}
                      className="w-full p-3 bg-black border border-gray-800 rounded-xl text-xs outline-none focus:border-orange-500 transition text-gray-200"
                      required
                    />
                  </div>

                  {/* Meals JSON breakdown header */}
                  <div className="col-span-2 border-t border-white/5 pt-4 text-xs font-black uppercase text-orange-500 tracking-wide">
                    Meals Layout Details
                  </div>

                  {/* Breakfast */}
                  <div className="space-y-1.5 col-span-2">
                    <span className="block text-[10px] font-black text-gray-500 uppercase">Breakfast Option</span>
                    <input
                      type="text"
                      placeholder="e.g. 4 scrambled egg whites + 80g oats with blueberries"
                      value={breakfast}
                      onChange={(e) => setBreakfast(e.target.value)}
                      className="w-full p-3 bg-black border border-gray-800 rounded-xl text-xs outline-none focus:border-orange-500 transition text-gray-200"
                    />
                  </div>

                  {/* Lunch */}
                  <div className="space-y-1.5 col-span-2">
                    <span className="block text-[10px] font-black text-gray-500 uppercase">Lunch Option</span>
                    <input
                      type="text"
                      placeholder="e.g. 150g grilled chicken breast + 150g white rice + green salad"
                      value={lunch}
                      onChange={(e) => setLunch(e.target.value)}
                      className="w-full p-3 bg-black border border-gray-800 rounded-xl text-xs outline-none focus:border-orange-500 transition text-gray-200"
                    />
                  </div>

                  {/* Dinner */}
                  <div className="space-y-1.5 col-span-2">
                    <span className="block text-[10px] font-black text-gray-500 uppercase">Dinner Option</span>
                    <input
                      type="text"
                      placeholder="e.g. 150g baked salmon fillet + 100g sweet potato + broccoli"
                      value={dinner}
                      onChange={(e) => setDinner(e.target.value)}
                      className="w-full p-3 bg-black border border-gray-800 rounded-xl text-xs outline-none focus:border-orange-500 transition text-gray-200"
                    />
                  </div>

                  {/* Snack */}
                  <div className="space-y-1.5 col-span-2">
                    <span className="block text-[10px] font-black text-gray-500 uppercase">Snack Option</span>
                    <input
                      type="text"
                      placeholder="e.g. 1 scoop whey protein + 30g raw almonds"
                      value={snack}
                      onChange={(e) => setSnack(e.target.value)}
                      className="w-full p-3 bg-black border border-gray-800 rounded-xl text-xs outline-none focus:border-orange-500 transition text-gray-200"
                    />
                  </div>

                  {/* Active checkbox */}
                  <div className="col-span-2 flex items-center gap-3 p-3 bg-black border border-gray-800 rounded-xl">
                    <input
                      id="isActive"
                      type="checkbox"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="w-4 h-4 accent-orange-500"
                    />
                    <label htmlFor="isActive" className="text-xs text-gray-300 font-semibold cursor-pointer">
                      Make this diet plan active and searchable by platform users
                    </label>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-4 bg-orange-500 hover:bg-orange-400 text-black font-black uppercase text-xs rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-50 mt-4"
                >
                  {submitting ? <RefreshCw size={14} className="animate-spin" /> : "Save Diet Template"}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ConfirmationDialog
        isOpen={pendingDeleteId !== null}
        title="Delete Diet Plan Template"
        message="Are you sure you want to permanently delete this nutrition meal plan template? Users won't be able to view or load these macro targets."
        confirmLabel="Delete Template"
        cancelLabel="Keep Template"
        onConfirm={executeDelete}
        onCancel={() => setPendingDeleteId(null)}
        isDanger={true}
      />
    </div>
  );
}
