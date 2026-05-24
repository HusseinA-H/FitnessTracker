import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Edit2,
  Trash2,
  AlertCircle,
  RefreshCw,
  X,
  Sparkles,
  BookOpen,
} from "lucide-react";
import { useEffect, useState } from "react";

import { adminRepository } from "../../../data/api/admin/adminRepository";

import ConfirmationDialog from "@shared/components/ConfirmationDialog";
import { SkeletonCard } from "@shared/components/Skeleton";
import { useToast } from "@shared/components/Toast";

export default function AdminWorkouts() {
  const [activeTab, setActiveTab] = useState("exercises");
  const toast = useToast();
  
  // Exercises List
  const [exercises, setExercises] = useState([]);
  const [loadingEx, setLoadingEx] = useState(true);
  const [errorEx, setErrorEx] = useState(null);

  // Templates List
  const [templates, setTemplates] = useState([]);
  const [loadingTemp, setLoadingTemp] = useState(true);
  const [errorTemp, setErrorTemp] = useState(null);

  // Exercise Form Modal State
  const [showExModal, setShowExModal] = useState(false);
  const [editExId, setEditExId] = useState(null);
  const [submittingEx, setSubmittingEx] = useState(false);

  // Exercise Form Fields
  const [exName, setExName] = useState("");
  const [exCategory, setExCategory] = useState("Strength");
  const [exEquipment, setExEquipment] = useState("");
  const [exMuscles, setExMuscles] = useState("");
  const [exDescription, setExDescription] = useState("");

  // Template Form Modal State
  const [showTempModal, setShowTempModal] = useState(false);
  const [editTempId, setEditTempId] = useState(null);
  const [submittingTemp, setSubmittingTemp] = useState(false);

  // Template Form Fields
  const [tempName, setTempName] = useState("");
  const [tempDescription, setTempDescription] = useState("");
  const [tempLevel, setTempLevel] = useState("BEGINNER");
  const [tempIsBlueprint, setTempIsBlueprint] = useState(true);

  // Confirmation States
  const [pendingDeleteExId, setPendingDeleteExId] = useState(null);
  const [pendingDeleteTempId, setPendingDeleteTempId] = useState(null);

  const fetchExercises = async () => {
    setLoadingEx(true);
    setErrorEx(null);
    try {
      const response = await adminRepository.getExercises();
      setExercises(response?.data || response || []);
    } catch (err) {
      console.error(err);
      setErrorEx("Failed to load exercise database.");
    } finally {
      setLoadingEx(false);
    }
  };

  const fetchTemplates = async () => {
    setLoadingTemp(true);
    setErrorTemp(null);
    try {
      const response = await adminRepository.getWorkoutTemplates();
      // filter only blueprints (workout templates) for clean admin control
      const list = response?.data || response || [];
      const blueprints = list.filter(w => w.is_blueprint);
      setTemplates(blueprints);
    } catch (err) {
      console.error(err);
      setErrorTemp("Failed to load workout templates.");
    } finally {
      setLoadingTemp(false);
    }
  };

  useEffect(() => {
    if (activeTab === "exercises") {
      fetchExercises();
    } else {
      fetchTemplates();
    }
  }, [activeTab]);

  const handleOpenCreateEx = () => {
    setEditExId(null);
    setExName("");
    setExCategory("Strength");
    setExEquipment("");
    setExMuscles("");
    setExDescription("");
    setShowExModal(true);
  };

  const handleOpenEditEx = (ex) => {
    setEditExId(ex.id);
    setExName(ex.name || "");
    setExCategory(ex.category || "Strength");
    setExEquipment(Array.isArray(ex.equipment) ? ex.equipment.join(", ") : "");
    setExMuscles(Array.isArray(ex.muscles) ? ex.muscles.join(", ") : "");
    setExDescription(ex.description || "");
    setShowExModal(true);
  };

  const triggerDeleteExercise = (id) => {
    setPendingDeleteExId(id);
  };

  const executeDeleteExercise = async () => {
    if (!pendingDeleteExId) return;
    const id = pendingDeleteExId;
    setPendingDeleteExId(null);
    try {
      await adminRepository.deleteExercise(id);
      setExercises(prev => prev.filter(ex => ex.id !== id));
      toast.success("Exercise database entry deleted.");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete exercise.");
    }
  };

  const handleExFormSubmit = async (e) => {
    e.preventDefault();
    if (!exName) return;
    setSubmittingEx(true);

    const payload = {
      name: exName,
      category: exCategory,
      equipment: exEquipment ? exEquipment.split(",").map(s => s.trim()) : [],
      muscles: exMuscles ? exMuscles.split(",").map(s => s.trim()) : [],
      description: exDescription
    };

    try {
      if (editExId) {
        const response = await adminRepository.updateExercise(editExId, payload);
        const updated = response?.data || response;
        setExercises(prev => prev.map(ex => ex.id === editExId ? updated : ex));
        toast.success("Exercise details updated!");
      } else {
        const response = await adminRepository.createExercise(payload);
        const created = response?.data || response;
        setExercises(prev => [...prev, created]);
        toast.success("New exercise catalog entry created.");
      }
      setShowExModal(false);
    } catch (err) {
      console.error(err);
      toast.error("Failed to save exercise.");
    } finally {
      setSubmittingEx(false);
    }
  };

  const handleOpenCreateTemp = () => {
    setEditTempId(null);
    setTempName("");
    setTempDescription("");
    setTempLevel("BEGINNER");
    setTempIsBlueprint(true);
    setShowTempModal(true);
  };

  const handleOpenEditTemp = (temp) => {
    setEditTempId(temp.id);
    setTempName(temp.name || "");
    setTempDescription(temp.description || "");
    setTempLevel(temp.level || "BEGINNER");
    setTempIsBlueprint(temp.is_blueprint !== false);
    setShowTempModal(true);
  };

  const triggerDeleteTemplate = (id) => {
    setPendingDeleteTempId(id);
  };

  const executeDeleteTemplate = async () => {
    if (!pendingDeleteTempId) return;
    const id = pendingDeleteTempId;
    setPendingDeleteTempId(null);
    try {
      await adminRepository.deleteWorkoutTemplate(id);
      setTemplates(prev => prev.filter(t => t.id !== id));
      toast.success("Workout routine template deleted.");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete routine template.");
    }
  };

  const handleTempFormSubmit = async (e) => {
    e.preventDefault();
    if (!tempName) return;
    setSubmittingTemp(true);

    const payload = {
      name: tempName,
      description: tempDescription,
      level: tempLevel,
      is_blueprint: tempIsBlueprint
    };

    try {
      if (editTempId) {
        const response = await adminRepository.updateWorkoutTemplate(editTempId, payload);
        const updated = response?.data || response;
        setTemplates(prev => prev.map(t => t.id === editTempId ? updated : t));
        toast.success("Blueprint routine updated!");
      } else {
        const response = await adminRepository.createWorkoutTemplate(payload);
        const created = response?.data || response;
        setTemplates(prev => [...prev, created]);
        toast.success("New workout template published!");
      }
      setShowTempModal(false);
    } catch (err) {
      console.error(err);
      toast.error("Failed to save blueprint routine.");
    } finally {
      setSubmittingTemp(false);
    }
  };

  return (
    <div className="p-8 space-y-8 pt-24">
      {/* Title */}
      <div className="flex items-center justify-between border-b border-white/5 pb-5">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tight">Workouts Control</h1>
          <p className="text-xs text-gray-500 uppercase tracking-widest mt-1">Configure global exercise database registry and pre-built training blueprints</p>
        </div>
        <button
          onClick={activeTab === "exercises" ? handleOpenCreateEx : handleOpenCreateTemp}
          className="px-4 py-2.5 bg-orange-500 hover:bg-orange-400 text-black font-black uppercase text-xs rounded-xl transition flex items-center gap-2"
        >
          <Plus size={14} /> Add {activeTab === "exercises" ? "Exercise" : "Template"}
        </button>
      </div>

      {/* Tabs Selector */}
      <div className="flex gap-4 border-b border-white/5 pb-1">
        <button
          onClick={() => setActiveTab("exercises")}
          className={`py-2 px-4 text-xs font-black uppercase tracking-wider transition ${
            activeTab === "exercises"
              ? "text-orange-500 border-b-2 border-orange-500 font-bold"
              : "text-gray-500 hover:text-gray-300"
          }`}
        >
          Exercises Catalog ({exercises.length})
        </button>
        <button
          onClick={() => setActiveTab("templates")}
          className={`py-2 px-4 text-xs font-black uppercase tracking-wider transition ${
            activeTab === "templates"
              ? "text-orange-500 border-b-2 border-orange-500 font-bold"
              : "text-gray-500 hover:text-gray-300"
          }`}
        >
          Workout Blueprints ({templates.length})
        </button>
      </div>

      {/* Exercises Tab View */}
      {activeTab === "exercises" && (
        <div className="space-y-6">
          {loadingEx ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </div>
          ) : errorEx ? (
            <div className="bg-red-500/10 border border-red-500/30 p-6 rounded-2xl flex items-center gap-3 text-red-400 text-sm">
              <AlertCircle size={18} />
              <span>{errorEx}</span>
            </div>
          ) : exercises.length === 0 ? (
            <div className="bg-white/[0.02] border border-white/5 p-16 rounded-3xl text-center text-gray-500 text-sm">
              No exercises configured.
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {exercises.map((ex) => (
                <div key={ex.id} className="p-6 bg-[#111] border border-white/5 rounded-2xl space-y-3 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start">
                      <h4 className="font-bold text-white uppercase text-sm leading-tight">{ex.name}</h4>
                      <span className="text-[9px] font-bold text-orange-500 bg-orange-500/10 border border-orange-500/20 px-2 py-0.5 rounded-full uppercase">
                        {ex.category}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed mt-2 line-clamp-3">
                      {ex.description || "No description provided."}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-white/5 mt-3 flex items-center justify-between">
                    <span className="text-[10px] text-gray-600 font-bold uppercase truncate">
                      EQ: {Array.isArray(ex.equipment) && ex.equipment.length > 0 ? ex.equipment.join(", ") : "Bodyweight"}
                    </span>
                    <div className="flex gap-1.5 shrink-0">
                      <button
                        onClick={() => handleOpenEditEx(ex)}
                        className="p-1.5 bg-white/5 border border-white/5 hover:border-orange-500/30 hover:bg-orange-500/10 text-gray-400 hover:text-orange-500 rounded-lg transition"
                      >
                        <Edit2 size={12} />
                      </button>
                      <button
                        onClick={() => triggerDeleteExercise(ex.id)}
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
        </div>
      )}

      {/* Templates Tab View */}
      {activeTab === "templates" && (
        <div className="space-y-6">
          {loadingTemp ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </div>
          ) : errorTemp ? (
            <div className="bg-red-500/10 border border-red-500/30 p-6 rounded-2xl flex items-center gap-3 text-red-400 text-sm">
              <AlertCircle size={18} />
              <span>{errorTemp}</span>
            </div>
          ) : templates.length === 0 ? (
            <div className="bg-white/[0.02] border border-white/5 p-16 rounded-3xl text-center text-gray-500 text-sm">
              No preconfigured templates. Click &quot;+ Add Template&quot; to spin up routines blueprints.
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.map((temp) => (
                <div key={temp.id} className="p-6 bg-[#111] border border-white/5 rounded-2xl space-y-3 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start">
                      <h4 className="font-bold text-white uppercase text-sm leading-tight">{temp.name}</h4>
                      <span className="text-[9px] font-bold text-purple-400 bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded-full uppercase">
                        {temp.level}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed mt-2 line-clamp-3">
                      {temp.description || "No description configured."}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-white/5 mt-3 flex items-center justify-between">
                    <span className="text-[10px] text-gray-600 font-bold uppercase">
                      ⭐ Featured Template Blueprint
                    </span>
                    <div className="flex gap-1.5 shrink-0">
                      <button
                        onClick={() => handleOpenEditTemp(temp)}
                        className="p-1.5 bg-white/5 border border-white/5 hover:border-orange-500/30 hover:bg-orange-500/10 text-gray-400 hover:text-orange-500 rounded-lg transition"
                      >
                        <Edit2 size={12} />
                      </button>
                      <button
                        onClick={() => triggerDeleteTemplate(temp.id)}
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
        </div>
      )}

      {/* ================= EXERCISE EDIT/CREATE MODAL ================= */}
      <AnimatePresence>
        {showExModal && (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-[98] p-4">
            <motion.div
              className="bg-[#111] border border-gray-800 max-w-md w-full p-8 rounded-3xl overflow-hidden shadow-2xl relative space-y-6"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
            >
              <button
                onClick={() => setShowExModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white p-2 rounded-xl transition"
              >
                <X size={18} />
              </button>

              <h3 className="text-2xl font-black uppercase tracking-tight flex items-center gap-3">
                <BookOpen className="text-orange-500" size={22} />
                {editExId ? "Edit Exercise catalog" : "Add New Exercise"}
              </h3>

              <form onSubmit={handleExFormSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <span className="block text-[10px] font-black text-gray-500 uppercase">Exercise Name</span>
                  <input
                    type="text"
                    value={exName}
                    onChange={(e) => setExName(e.target.value)}
                    placeholder="e.g. Incline DB Bench Press"
                    className="w-full p-3 bg-black border border-gray-800 rounded-xl text-xs outline-none focus:border-orange-500 transition text-gray-200"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <span className="block text-[10px] font-black text-gray-500 uppercase">Category</span>
                  <select
                    value={exCategory}
                    onChange={(e) => setExCategory(e.target.value)}
                    className="w-full p-3 bg-black border border-gray-800 rounded-xl text-xs outline-none focus:border-orange-500 transition text-gray-300"
                  >
                    <option value="Strength">Strength</option>
                    <option value="Cardio">Cardio</option>
                    <option value="Flexibility">Flexibility</option>
                    <option value="General">General / Accessory</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <span className="block text-[10px] font-black text-gray-500 uppercase">Target Muscles (Comma Separated)</span>
                  <input
                    type="text"
                    value={exMuscles}
                    onChange={(e) => setExMuscles(e.target.value)}
                    placeholder="e.g. Chest, Shoulders, Triceps"
                    className="w-full p-3 bg-black border border-gray-800 rounded-xl text-xs outline-none focus:border-orange-500 transition text-gray-200"
                  />
                </div>

                <div className="space-y-1.5">
                  <span className="block text-[10px] font-black text-gray-500 uppercase">Equipment Required</span>
                  <input
                    type="text"
                    value={exEquipment}
                    onChange={(e) => setExEquipment(e.target.value)}
                    placeholder="e.g. Dumbbells, Incline Bench"
                    className="w-full p-3 bg-black border border-gray-800 rounded-xl text-xs outline-none focus:border-orange-500 transition text-gray-200"
                  />
                </div>

                <div className="space-y-1.5">
                  <span className="block text-[10px] font-black text-gray-500 uppercase">Execution Summary / Tips</span>
                  <textarea
                    value={exDescription}
                    onChange={(e) => setExDescription(e.target.value)}
                    placeholder="Briefly state target angles, safety advice, or reps guidelines..."
                    className="w-full p-3 bg-black border border-gray-800 rounded-xl text-xs outline-none focus:border-orange-500 transition text-gray-200 h-24 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingEx || !exName}
                  className="w-full py-4 bg-orange-500 hover:bg-orange-400 text-black font-black uppercase text-xs rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {submittingEx ? <RefreshCw size={14} className="animate-spin" /> : "Save Catalog Entry"}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ================= TEMPLATE EDIT/CREATE MODAL ================= */}
      <AnimatePresence>
        {showTempModal && (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-[98] p-4">
            <motion.div
              className="bg-[#111] border border-gray-800 max-w-md w-full p-8 rounded-3xl overflow-hidden shadow-2xl relative space-y-6"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
            >
              <button
                onClick={() => setShowTempModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white p-2 rounded-xl transition"
              >
                <X size={18} />
              </button>

              <h3 className="text-2xl font-black uppercase tracking-tight flex items-center gap-3">
                <Sparkles className="text-orange-500" size={22} />
                {editTempId ? "Edit Workout Blueprint" : "Create Workout Blueprint"}
              </h3>

              <form onSubmit={handleTempFormSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <span className="block text-[10px] font-black text-gray-500 uppercase">Routine Name</span>
                  <input
                    type="text"
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    placeholder="e.g. Master Push Split"
                    className="w-full p-3 bg-black border border-gray-800 rounded-xl text-xs outline-none focus:border-orange-500 transition text-gray-200"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <span className="block text-[10px] font-black text-gray-500 uppercase">Suggested Tier Difficulty</span>
                  <select
                    value={tempLevel}
                    onChange={(e) => setTempLevel(e.target.value)}
                    className="w-full p-3 bg-black border border-gray-800 rounded-xl text-xs outline-none focus:border-orange-500 transition text-gray-300"
                  >
                    <option value="BEGINNER">Beginner</option>
                    <option value="INTERMEDIATE">Intermediate</option>
                    <option value="ADVANCED">Advanced</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <span className="block text-[10px] font-black text-gray-500 uppercase">Description / Setup Instructions</span>
                  <textarea
                    value={tempDescription}
                    onChange={(e) => setTempDescription(e.target.value)}
                    placeholder="Specify routine focus, rest schedules, or warm up sets details..."
                    className="w-full p-3 bg-black border border-gray-800 rounded-xl text-xs outline-none focus:border-orange-500 transition text-gray-200 h-28 resize-none"
                  />
                </div>

                <div className="flex items-center gap-3 p-3 bg-black border border-gray-800 rounded-xl">
                  <input
                    id="isBlueprint"
                    type="checkbox"
                    checked={tempIsBlueprint}
                    onChange={(e) => setTempIsBlueprint(e.target.checked)}
                    className="w-4 h-4 accent-orange-500"
                  />
                  <label htmlFor="isBlueprint" className="text-xs text-gray-300 font-semibold cursor-pointer">
                    Publish blueprint template for all platform users
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={submittingTemp || !tempName}
                  className="w-full py-4 bg-orange-500 hover:bg-orange-400 text-black font-black uppercase text-xs rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {submittingTemp ? <RefreshCw size={14} className="animate-spin" /> : "Save Blueprint Template"}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ConfirmationDialog
        isOpen={pendingDeleteExId !== null}
        title="Delete Exercise Entry"
        message="Are you sure you want to delete this exercise from the catalog? Future logged workouts won't be able to search or select this entry."
        confirmLabel="Delete Exercise"
        cancelLabel="Keep"
        onConfirm={executeDeleteExercise}
        onCancel={() => setPendingDeleteExId(null)}
        isDanger={true}
      />

      <ConfirmationDialog
        isOpen={pendingDeleteTempId !== null}
        title="Delete Routine Template"
        message="Are you sure you want to permanently delete this preconfigured workout routine blueprint?"
        confirmLabel="Delete Blueprint"
        cancelLabel="Keep"
        onConfirm={executeDeleteTemplate}
        onCancel={() => setPendingDeleteTempId(null)}
        isDanger={true}
      />
    </div>
  );
}
