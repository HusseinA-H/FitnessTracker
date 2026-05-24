import { motion } from "framer-motion";
import { Pencil, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import {
  loadWorkouts,
  saveWorkouts,
  migrateIfNeeded,
} from "@/shared/domain/workoutsRepository";
import { workoutsRepository } from "@data/api/workouts/workoutsRepository";
import { useAuth } from "@features/auth";

const GUEST_LIMIT = 5;

export default function PremiumTracker() {
  const { user } = useAuth();
  const isAuthed = Boolean(user);

  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(isAuthed);

  const [workout, setWorkout] = useState({
    exercise: "",
    sets: "",
    reps: "",
    weight: "",
  });

  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");

  // Load workouts asynchronously
  useEffect(() => {
    async function fetchWorkouts() {
      if (isAuthed) {
        setLoading(true);
        try {
          const list = await loadWorkouts(true);
          setWorkouts(list);
        } catch (e) {
          console.error("Failed to load workouts from API:", e);
        } finally {
          setLoading(false);
        }
      } else {
        const list = await loadWorkouts(false);
        setWorkouts(list);
      }
    }
    fetchWorkouts();
  }, [isAuthed]);

  // Migration only (no setState)
  useEffect(() => {
    migrateIfNeeded(isAuthed);
  }, [isAuthed]);

  // Persist guest workouts whenever they change
  useEffect(() => {
    if (!isAuthed && workouts.length > 0) {
      saveWorkouts(false, workouts);
    }
  }, [workouts, isAuthed]);

  const today = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!workout.exercise || !workout.sets || !workout.reps || !workout.weight)
      return;

    if (!isAuthed && !editingId && workouts.length >= GUEST_LIMIT) {
      setMessage(
        `⚠️ Guest mode limit: ${GUEST_LIMIT} entries. Sign in for unlimited.`
      );
      setTimeout(() => setMessage(""), 2500);
      return;
    }

    if (isAuthed) {
      try {
        const payload = {
          workout: null, // logged session
          exercise: workout.exercise,
          sets: parseInt(workout.sets),
          reps: workout.reps.toString(),
          weight: parseFloat(workout.weight),
          date: new Date().toISOString().split("T")[0]
        };

        if (editingId) {
          const response = await workoutsRepository.updateWorkout(editingId, payload);
          const log = response?.data || response;
          const updated = {
            id: log.id,
            exercise: log.exercise_details?.name || log.exercise || "",
            sets: log.sets,
            reps: log.reps,
            weight: log.weight,
            date: today,
            is_locked: log.is_locked
          };
          setWorkouts(workouts.map((w) => (w.id === editingId ? updated : w)));
          setEditingId(null);
        } else {
          const response = await workoutsRepository.createWorkout(payload);
          const log = response?.data || response;
          const created = {
            id: log.id,
            exercise: log.exercise_details?.name || log.exercise || "",
            sets: log.sets,
            reps: log.reps,
            weight: log.weight,
            date: today,
            is_locked: log.is_locked
          };

          // check for PR
          const previous = workouts.filter((w) => w.exercise.toLowerCase() === workout.exercise.toLowerCase());
          const newWeight = Number(workout.weight);
          const previousMax = previous.length > 0 ? Math.max(...previous.map((w) => Number(w.weight))) : -Infinity;
          if (previous.length > 0 && previousMax < newWeight) {
            setMessage("🔥 New PR!");
            setTimeout(() => setMessage(""), 2000);
          }

          setWorkouts([...workouts, created]);
        }
        setWorkout({ exercise: "", sets: "", reps: "", weight: "" });
      } catch (err) {
        console.error(err);
        setMessage(err?.message || "Failed to log workout.");
        setTimeout(() => setMessage(""), 3000);
      }
    } else {
      // Guest local storage flow
      const newWorkout = {
        ...workout,
        id: editingId ? editingId : Date.now(),
        date: today,
      };

      if (editingId) {
        const updated = workouts.map((w) => (w.id === editingId ? newWorkout : w));
        setWorkouts(updated);
        setEditingId(null);
      } else {
        const previous = workouts.filter((w) => w.exercise === workout.exercise);
        const newWeight = Number(workout.weight);
        const previousMax = previous.length > 0 ? Math.max(...previous.map((w) => Number(w.weight))) : -Infinity;
        if (previous.length > 0 && previousMax < newWeight) {
          setMessage("🔥 New PR!");
          setTimeout(() => setMessage(""), 2000);
        }
        setWorkouts([...workouts, newWorkout]);
      }
      setWorkout({ exercise: "", sets: "", reps: "", weight: "" });
    }
  };

  const deleteWorkout = async (id) => {
    if (isAuthed) {
      try {
        await workoutsRepository.deleteWorkout(id);
        setWorkouts(workouts.filter((w) => w.id !== id));
      } catch (err) {
        console.error(err);
        setMessage(err?.message || "Failed to delete log (log might be locked).");
        setTimeout(() => setMessage(""), 3000);
      }
    } else {
      const filtered = workouts.filter((w) => w.id !== id);
      setWorkouts(filtered);
    }
  };

  const editWorkout = (w) => {
    if (w.is_locked) {
      setMessage("⚠️ This workout log is locked and cannot be updated.");
      setTimeout(() => setMessage(""), 3000);
      return;
    }
    setWorkout({
      exercise: w.exercise,
      sets: w.sets.toString(),
      reps: w.reps.toString(),
      weight: w.weight.toString(),
    });
    setEditingId(w.id);
  };

  const totalVolume = useMemo(() => {
    return workouts.reduce((acc, w) => {
      const sets = Number(w.sets) || 0;
      const reps = Number(w.reps) || 0;
      const weight = Number(w.weight) || 0;
      return acc + sets * reps * weight;
    }, 0);
  }, [workouts]);

  const remaining = isAuthed ? null : Math.max(0, GUEST_LIMIT - workouts.length);

  return (
    <div className="min-h-screen px-4 md:px-10 py-10 md:py-16 bg-[#0f0f0f] text-white">
      <h1 className="text-3xl md:text-4xl font-bold mb-6 text-center">
        Fitness <span className="text-orange-500">Tracker</span>
      </h1>

      {/* Mode banner */}
      <div className="max-w-5xl mx-auto mb-8 md:mb-10">
        {!isAuthed ? (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <p className="text-sm text-gray-300">
                You’re in{" "}
                <span className="text-orange-500 font-bold">Guest Mode</span>.
                You can save up to{" "}
                <span className="text-orange-500 font-bold">{GUEST_LIMIT}</span>{" "}
                entries.
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Remaining:{" "}
                <span className="text-gray-300 font-semibold">{remaining}</span>
              </p>
            </div>

            <Link
              to="/tracker?auth=signin"
              className="inline-flex justify-center px-5 py-2 rounded-xl bg-orange-500 text-black font-black uppercase hover:bg-orange-400 transition"
            >
              Sign in for Unlimited
            </Link>
          </div>
        ) : (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
            <p className="text-sm text-gray-300">
              <span className="text-orange-500 font-bold">Unlimited Mode</span>{" "}
              enabled for your account.
            </p>
          </div>
        )}
      </div>

      {message && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center text-orange-500 font-bold mb-4"
        >
          {message}
        </motion.p>
      )}

      {loading ? (
        <div className="text-center text-gray-400 py-10">Loading your workout logs...</div>
      ) : (
        <div className="grid gap-8 md:gap-12 max-w-5xl mx-auto md:grid-cols-2">
          {/* FORM */}
          <form
            onSubmit={handleSubmit}
            className="bg-[#111] p-6 md:p-8 rounded-3xl border border-gray-800 space-y-4 md:space-y-6"
          >
            <h2 className="text-lg md:text-xl font-semibold">
              {editingId ? "Update Record" : "Log Workout"}
            </h2>

            {["exercise", "sets", "reps", "weight"].map((field) => (
              <input
                key={field}
                type={field === "exercise" ? "text" : "number"}
                placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                value={workout[field]}
                onChange={(e) =>
                  setWorkout({ ...workout, [field]: e.target.value })
                }
                className="w-full p-3 md:p-4 bg-black border border-gray-700 rounded-xl outline-none focus:border-orange-500 transition placeholder-gray-600"
              />
            ))}

            <button
              type="submit"
              className="w-full py-3 md:py-4 bg-orange-500 text-black font-black uppercase rounded-xl hover:bg-orange-400 transition active:scale-95"
            >
              {editingId ? "Update Entry" : "Add Entry"}
            </button>

            {!isAuthed && (
              <p className="text-xs text-gray-500">
                Guest limit: {workouts.length}/{GUEST_LIMIT} entries
              </p>
            )}
          </form>

          {/* HISTORY */}
          <div className="bg-[#111] p-6 md:p-8 rounded-3xl border border-gray-800">
            <h2 className="text-lg md:text-xl font-semibold mb-4 md:mb-6">
              Workout History
            </h2>

            {workouts.length === 0 ? (
              <p className="text-gray-500">Start your transformation today 💪</p>
            ) : (
              <div className="space-y-4 max-h-[420px] md:max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                {workouts
                  .slice()
                  .reverse()
                  .map((w) => (
                    <div
                      key={w.id}
                      className="bg-black p-4 rounded-xl border border-gray-700 flex justify-between items-center group hover:border-orange-500/50 transition"
                    >
                      <div className="min-w-0">
                        <p className="font-bold text-orange-500 uppercase tracking-tight truncate">
                          {w.exercise}
                        </p>
                        <p className="text-sm text-gray-400">
                          {w.sets} × {w.reps} × {w.weight} kg
                        </p>
                        <p className="text-[10px] text-gray-600 font-bold uppercase mt-1">
                          {w.date}
                        </p>
                        {w.is_locked && (
                          <span className="text-[9px] text-red-500 font-bold uppercase">Locked</span>
                        )}
                      </div>

                      <div className="flex space-x-3 shrink-0">
                        {!w.is_locked && (
                          <>
                            <button type="button" onClick={() => editWorkout(w)}>
                              <Pencil
                                size={18}
                                className="text-gray-500 hover:text-white transition"
                              />
                            </button>

                            <button type="button" onClick={() => deleteWorkout(w.id)}>
                              <Trash2
                                size={18}
                                className="text-gray-500 hover:text-red-600 transition"
                              />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* STATS */}
      <div className="mt-12 md:mt-16 text-center">
        <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-1">
          Total Volume Moved
        </p>
        <p className="text-4xl md:text-5xl font-black text-orange-500 italic uppercase">
          {totalVolume}{" "}
          <span className="text-sm not-italic font-normal text-gray-600">
            kg
          </span>
        </p>
      </div>
    </div>
  );
}