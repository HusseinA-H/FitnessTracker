import { useEffect, useState, useCallback } from "react";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import { authRepository } from "@data/api/auth/authRepository";
import { progressRepository } from "@data/api/progress/progressRepository";
import { useAuth } from "@features/auth";
import ConfirmationDialog from "@shared/components/ConfirmationDialog";
import ErrorState from "@shared/components/ErrorState";
import { SkeletonLine, SkeletonCard } from "@shared/components/Skeleton";
import { useToast } from "@shared/components/Toast";

export default function Progress() {
  const { user } = useAuth();
  const isAuthed = Boolean(user);
  const toast = useToast();

  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(isAuthed);
  const [error, setError] = useState(null);

  const [goalWeight, setGoalWeight] = useState("");
  const [height, setHeight] = useState("");

  const [editingIndex, setEditingIndex] = useState(null);
  const [deletingLog, setDeletingLog] = useState(null); // stores { index, id }

  const [form, setForm] = useState({
    weight: "",
    bodyFat: "",
  });

  // Load progress data
  const loadData = useCallback(async () => {
    if (isAuthed) {
      setLoading(true);
      setError(null);
      try {
        // Fetch logs
        const response = await progressRepository.getProgressLogs();
        const logs = response?.data || response;
        if (Array.isArray(logs)) {
          setEntries(logs.map(log => ({
            id: log.id,
            weight: Number(log.weight),
            bodyFat: Number(log.body_fat),
            lean: Number(log.lean_mass),
            fat: Number(log.fat_mass),
            date: log.date ? new Date(log.date).toLocaleDateString() : ""
          })));
        }

        // Fetch profile for height & goal weight
        const profileResponse = await authRepository.getProfile();
        const profile = profileResponse?.data || profileResponse;
        if (profile) {
          setHeight(profile.height ? profile.height.toString() : "");
          setGoalWeight(profile.goal_weight ? profile.goal_weight.toString() : "");
        }
      } catch (e) {
        console.error("Failed to load progress from API:", e);
        setError("Failed to synchronize with progress intelligence backend.");
      } finally {
        setLoading(false);
      }
    } else {
      const saved = localStorage.getItem("progressData");
      setEntries(saved ? JSON.parse(saved) : []);
      setGoalWeight(localStorage.getItem("goalWeight") || "");
      setHeight(localStorage.getItem("userHeight") || "");
      setLoading(false);
    }
  }, [isAuthed]);

  useEffect(() => {
    loadData();
  }, [isAuthed, loadData]);

  const saveEntry = async () => {
    if (!form.weight || !form.bodyFat) return;

    const parsedWeight = parseFloat(form.weight);
    const parsedBodyFat = parseFloat(form.bodyFat);

    if (isAuthed) {
      try {
        const payload = {
          weight: parsedWeight,
          body_fat: parsedBodyFat,
          date: new Date().toISOString().split("T")[0]
        };

        if (editingIndex !== null) {
          const entryToEdit = entries[editingIndex];
          const response = await progressRepository.updateProgressLog(entryToEdit.id, payload);
          const log = response?.data || response;
          const updated = [...entries];
          updated[editingIndex] = {
            id: log.id,
            weight: Number(log.weight),
            bodyFat: Number(log.body_fat),
            lean: Number(log.lean_mass),
            fat: Number(log.fat_mass),
            date: new Date(log.date).toLocaleDateString()
          };
          setEntries(updated);
          setEditingIndex(null);
          toast.success("Progress entry updated successfully!");
        } else {
          const response = await progressRepository.createProgressLog(payload);
          const log = response?.data || response;
          const newEntry = {
            id: log.id,
            weight: Number(log.weight),
            bodyFat: Number(log.body_fat),
            lean: Number(log.lean_mass),
            fat: Number(log.fat_mass),
            date: new Date(log.date).toLocaleDateString()
          };
          setEntries([...entries, newEntry]);
          toast.success("Weight log added to timeline!");
        }
        setForm({ weight: "", bodyFat: "" });
      } catch (err) {
        toast.error(err?.message || "Failed to save progress entry.");
      }
    } else {
      const lean = parsedWeight * (1 - parsedBodyFat / 100);
      const fat = parsedWeight * (parsedBodyFat / 100);

      const newEntry = {
        weight: parsedWeight,
        bodyFat: parsedBodyFat,
        lean: parseFloat(lean.toFixed(2)),
        fat: parseFloat(fat.toFixed(2)),
        date: new Date().toLocaleDateString(),
      };

      let updated;
      if (editingIndex !== null) {
        updated = [...entries];
        updated[editingIndex] = newEntry;
        setEditingIndex(null);
        toast.success("Local progress entry updated!");
      } else {
        updated = [...entries, newEntry];
        toast.success("Local weight log saved!");
      }

      setEntries(updated);
      localStorage.setItem("progressData", JSON.stringify(updated));
      setForm({ weight: "", bodyFat: "" });
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingLog) return;
    const { index, id } = deletingLog;

    if (isAuthed && id) {
      try {
        await progressRepository.deleteProgressLog(id);
        setEntries(entries.filter((e) => e.id !== id));
        toast.success("Progress log deleted successfully.");
      } catch (err) {
        toast.error(err?.message || "Failed to delete progress entry.");
      }
    } else {
      const updated = entries.filter((_, i) => i !== index);
      setEntries(updated);
      localStorage.setItem("progressData", JSON.stringify(updated));
      toast.success("Local progress log cleared.");
    }
    setDeletingLog(null);
  };

  const deleteEntry = (index, id = null) => {
    setDeletingLog({ index, id });
  };

  const getAnalysis = () => {
    if (entries.length < 2) return null;

    const first = entries[0];
    const last = entries[entries.length - 1];

    const weightDiff = last.weight - first.weight;
    const fatDiff = last.fat - first.fat;
    const muscleDiff = last.lean - first.lean;

    return {
      weightDiff,
      fatDiff,
      muscleDiff,
      currentLean: last.lean,
    };
  };

  const saveProfileField = async (field, value) => {
    if (!isAuthed || !value) return;
    try {
      const payload = {};
      if (field === "height") payload.height = parseFloat(value);
      if (field === "goal_weight") payload.goal_weight = parseFloat(value);
      await authRepository.updateProfile(payload);
      toast.success(`${field === "height" ? "Height" : "Goal Weight"} synchronized with profile!`);
    } catch (err) {
      console.warn("Failed to persist profile field:", err);
    }
  };

  const analysis = getAnalysis();

  return (
    <div className="min-h-[90vh] p-10 max-w-6xl mx-auto space-y-12 text-white">
      <h1 className="text-3xl font-bold text-center uppercase tracking-tighter">
        Progress Intelligence System
      </h1>

      {/* ================= SETTINGS ================= */}
      <div className="bg-[#0c0c0c] p-8 rounded-3xl border border-[#1a1a1a] grid grid-cols-2 gap-4">
        <input
          type="number"
          placeholder="Goal Weight (kg)"
          value={goalWeight}
          onChange={(e) => {
            setGoalWeight(e.target.value);
            if (!isAuthed) localStorage.setItem("goalWeight", e.target.value);
          }}
          onBlur={() => saveProfileField("goal_weight", goalWeight)}
          className="p-3 bg-black border border-[#1a1a1a] rounded-xl outline-none focus:border-gray-700 transition"
        />

        <input
          type="number"
          placeholder="Height (cm)"
          value={height}
          onChange={(e) => {
            setHeight(e.target.value);
            if (!isAuthed) localStorage.setItem("userHeight", e.target.value);
          }}
          onBlur={() => saveProfileField("height", height)}
          className="p-3 bg-black border border-[#1a1a1a] rounded-xl outline-none focus:border-gray-700 transition"
        />
      </div>

      {error ? (
        <ErrorState
          title="Telemetry Synchronization Failed"
          message={error}
          onRetry={loadData}
        />
      ) : loading ? (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <SkeletonLine height="h-12" />
            <SkeletonLine height="h-12" />
          </div>
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : (
        <>
          {/* ================= ENTRY FORM ================= */}
          <div className="bg-[#0c0c0c] p-8 rounded-3xl border border-[#1a1a1a] grid grid-cols-2 gap-4 shadow-xl">
            <input
              type="number"
              placeholder="Weight"
              value={form.weight}
              onChange={(e) => setForm({ ...form, weight: e.target.value })}
              className="p-3 bg-black border border-[#1a1a1a] rounded-xl outline-none focus:border-gray-700 transition placeholder-gray-600 text-white"
            />

            <input
              type="number"
              placeholder="Body Fat %"
              value={form.bodyFat}
              onChange={(e) => setForm({ ...form, bodyFat: e.target.value })}
              className="p-3 bg-black border border-[#1a1a1a] rounded-xl outline-none focus:border-gray-700 transition placeholder-gray-600 text-white"
            />

            <button
              onClick={saveEntry}
              className="col-span-2 py-3 bg-[#ff6b00] text-black font-bold rounded-xl hover:bg-[#e66000] transition active:scale-[0.98] uppercase"
            >
              {editingIndex !== null ? "Update Entry" : "Add Entry"}
            </button>
          </div>

          {/* ================= ANALYSIS ================= */}
          {analysis && (
            <div className="bg-[#0c0c0c] p-8 rounded-3xl border border-[#1a1a1a] space-y-6 shadow-lg">
              <h3 className="text-xl font-bold text-[#ff6b00] uppercase tracking-wider italic">
                Smart Analysis
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <p className="text-white font-medium">
                    Muscle Gain/Loss:
                    <span
                      className={`ml-2 font-bold ${
                        analysis.muscleDiff >= 0 ? "text-white" : "text-red-600"
                      }`}
                    >
                      {analysis.muscleDiff > 0
                        ? `+${analysis.muscleDiff.toFixed(2)}`
                        : analysis.muscleDiff.toFixed(2)}{" "}
                      kg
                    </span>
                  </p>
                  <p className="text-white font-medium">
                    Current Muscle Mass:
                    <span className="ml-2 font-bold text-[#ff6b00]">
                      {analysis.currentLean.toFixed(2)} kg
                    </span>
                  </p>
                </div>

                <div className="space-y-3 border-l border-[#1a1a1a] pl-8">
                  <p className="text-white font-medium">
                    Weight Change:
                    <span className="ml-2 font-bold text-white">
                      {analysis.weightDiff.toFixed(1)} kg
                    </span>
                  </p>
                  <p className="text-white font-medium">
                    Fat Change:
                    <span
                      className={`ml-2 font-bold ${
                        analysis.fatDiff <= 0 ? "text-white" : "text-red-600"
                      }`}
                    >
                      {analysis.fatDiff.toFixed(2)} kg
                    </span>
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ================= CHART ================= */}
          {entries.length > 0 && (
            <div className="bg-[#0c0c0c] p-8 rounded-3xl border border-[#1a1a1a]">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={entries}>
                  <Line
                    type="monotone"
                    dataKey="weight"
                    stroke="#ff6b00"
                    strokeWidth={3}
                    dot={{ fill: "#ff6b00" }}
                    name="Weight"
                  />
                  <Line
                    type="monotone"
                    dataKey="lean"
                    stroke="#ffffff"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    name="Muscle"
                  />
                  <CartesianGrid stroke="#1a1a1a" vertical={false} />
                  <XAxis dataKey="date" stroke="#ffffff" fontSize={10} />
                  <YAxis stroke="#ffffff" fontSize={10} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#000",
                      border: "1px solid #1a1a1a",
                      color: "#fff",
                    }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* ================= LIST ================= */}
          <div className="space-y-4">
            {entries.length === 0 ? (
              <div className="bg-[#0c0c0c] border border-dashed border-white/5 p-16 rounded-3xl text-center text-gray-500 text-sm space-y-2">
                <div className="text-xl font-bold uppercase tracking-wider text-white">No Progress Records</div>
                <p className="max-w-md mx-auto text-xs">Record your current body weight and body fat percentage above to calibrate your timeline analytics.</p>
              </div>
            ) : (
              entries
                .slice()
                .reverse()
                .map((e, i) => (
                  <div
                    key={e.id || i}
                    className="bg-[#0c0c0c] p-6 rounded-2xl border border-[#1a1a1a] flex justify-between items-center transition hover:border-gray-700"
                  >
                    <div>
                      <p className="font-bold text-white text-lg">
                        {e.date} — {e.weight}kg
                      </p>
                      <p className="text-sm font-medium mt-1">
                        Muscle: <span className="text-[#ff6b00]">{e.lean}kg</span> | Fat:{" "}
                        <span className="text-red-600">{e.bodyFat}%</span>
                      </p>
                    </div>
                    <div className="flex gap-6">
                      <button
                        onClick={() => {
                          setForm({ weight: e.weight.toString(), bodyFat: e.bodyFat.toString() });
                          setEditingIndex(entries.length - 1 - i);
                        }}
                        className="text-white font-bold text-xs uppercase hover:text-[#ff6b00] transition border-none bg-transparent cursor-pointer"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteEntry(entries.length - 1 - i, e.id)}
                        className="text-red-600 font-bold text-xs uppercase hover:text-red-500 transition border-none bg-transparent cursor-pointer"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
            )}
          </div>
        </>
      )}

      <ConfirmationDialog
        isOpen={deletingLog !== null}
        title="Delete Progress Log"
        message="Are you sure you want to delete this weight tracking entry? This will permanently remove it from your history curves."
        confirmLabel="Delete"
        cancelLabel="Keep"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingLog(null)}
        isDanger={true}
      />
    </div>
  );
}