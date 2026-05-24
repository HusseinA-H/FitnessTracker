// src/features/workouts/pages/Workouts.jsx
import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useMemo, useState } from "react";

import { programs, cardioWorkouts } from "../data/programs";
import { useExercises } from "../hook/useExercises";

import ErrorState from "@shared/components/ErrorState";
import { SkeletonCard } from "@shared/components/Skeleton";

export default function Workouts() {
  const [selectedProgram, setSelectedProgram] = useState(null);

  // API exercises (normalized from service)
  const { items, loading, error, loadMore, canLoadMore, refetch, count } =
    useExercises({ limit: 20 });

  // Filters
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [equipmentFilter, setEquipmentFilter] = useState("All");
  const [muscleFilter, setMuscleFilter] = useState("All");

  const toggleProgram = useCallback((program) => {
    setSelectedProgram((prev) => (prev?.id === program.id ? null : program));
  }, []);

  const resetFilters = useCallback(() => {
    setQuery("");
    setCategoryFilter("All");
    setEquipmentFilter("All");
    setMuscleFilter("All");
  }, []);

  const filterOptions = useMemo(() => {
    const categories = new Set();
    const equipment = new Set();
    const muscles = new Set();

    for (const ex of items) {
      if (ex.category) categories.add(String(ex.category));
      (ex.equipment || []).forEach((e) => equipment.add(String(e)));
      (ex.muscles || []).forEach((m) => muscles.add(String(m)));
      (ex.musclesSecondary || []).forEach((m) => muscles.add(String(m)));
    }

    return {
      categories: ["All", ...Array.from(categories).sort()],
      equipment: ["All", ...Array.from(equipment).sort()],
      muscles: ["All", ...Array.from(muscles).sort()],
    };
  }, [items]);

  const filteredItems = useMemo(() => {
    const q = query.trim().toLowerCase();

    return items.filter((ex) => {
      const matchesQuery =
        !q ||
        (ex.name || "").toLowerCase().includes(q) ||
        (ex.description || "").toLowerCase().includes(q);

      const matchesCategory =
        categoryFilter === "All" || String(ex.category) === categoryFilter;

      const matchesEquipment =
        equipmentFilter === "All" ||
        (ex.equipment || []).some((e) => String(e) === equipmentFilter);

      const matchesMuscle =
        muscleFilter === "All" ||
        (ex.muscles || []).some((m) => String(m) === muscleFilter) ||
        (ex.musclesSecondary || []).some((m) => String(m) === muscleFilter);

      return matchesQuery && matchesCategory && matchesEquipment && matchesMuscle;
    });
  }, [items, query, categoryFilter, equipmentFilter, muscleFilter]);

  const shownCountText = useMemo(() => {
    const total = typeof count === "number" ? count : "—";
    return `Live exercises from Wger API (${items.length}/${total}) • Showing ${filteredItems.length}`;
  }, [items.length, count, filteredItems.length]);

  return (
    <div className="min-h-screen px-6 py-20 text-white bg-[#0a0a0a]">
      {/* ================= BACKGROUND DECOR ================= */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div className="absolute top-[-10%] right-[-10%] w-[400px] h-[400px] bg-orange-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-orange-600/5 blur-[120px] rounded-full" />
      </div>

      {/* ================= TITLE ================= */}
      <header className="text-center mb-16">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl md:text-6xl font-black tracking-tighter mb-4 uppercase"
        >
          Training <span className="text-orange-500">Hub</span>
        </motion.h1>
        <p className="text-gray-400 max-w-xl mx-auto uppercase tracking-widest text-sm">
          Select a master-built program to transform your physique
        </p>
      </header>

      {/* ================= PROGRAM CARDS ================= */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-24">
        {programs.map((program) => {
          const active = selectedProgram?.id === program.id;

          return (
            <motion.button
              type="button"
              key={program.id}
              whileHover={{ y: -5 }}
              whileTap={{ scale: 0.98 }}
              aria-pressed={active}
              onClick={() => toggleProgram(program)}
              className={`text-left relative overflow-hidden p-[1px] rounded-3xl transition-all ${
                active
                  ? "bg-gradient-to-br from-orange-500 to-orange-800 shadow-[0_0_25px_rgba(249,115,22,0.3)]"
                  : "bg-white/10 hover:bg-white/20"
              }`}
            >
              <div className="bg-[#121212] rounded-[23px] p-8 h-full flex flex-col justify-between cursor-pointer">
                <div>
                  <span className="text-[10px] font-bold px-3 py-1 bg-orange-500/10 text-orange-500 rounded-full uppercase tracking-tighter border border-orange-500/20">
                    {program.level}
                  </span>
                  <h2 className="text-2xl font-bold mt-4 mb-2 leading-tight">
                    {program.title}
                  </h2>
                </div>

                <div className="flex items-center justify-between mt-8 border-t border-white/5 pt-4">
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-widest">
                    {program.days.length} Days / Week
                  </p>
                  <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-orange-500">
                    {active ? "−" : "+"}
                  </div>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* ================= PROGRAM DETAILS ================= */}
      <AnimatePresence mode="wait">
        {selectedProgram && (
          <motion.div
            key={selectedProgram.id}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-32"
          >
            <div className="flex items-center justify-between mb-12">
              <h2 className="text-4xl font-black uppercase tracking-tighter">
                {selectedProgram.title}{" "}
                <span className="text-orange-500 text-xl font-normal not-italic ml-2 opacity-50">
                  {/* Blueprint */}
                </span>
              </h2>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              {selectedProgram.days.map((day, index) => (
                <motion.div
                  key={`${day.name}-${index}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-gradient-to-b from-white/[0.07] to-transparent border border-white/10 rounded-[32px] p-8"
                >
                  <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
                    <span className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center text-sm font-black">
                      D{index + 1}
                    </span>
                    {day.name}
                  </h3>

                  <div className="space-y-4">
                    {day.exercises.map((ex, i) => (
                      <div
                        key={`${ex.name}-${i}`}
                        className="group flex items-center justify-between p-4 bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 rounded-2xl transition-colors"
                      >
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-gray-200 group-hover:text-orange-400 transition-colors uppercase tracking-tight">
                            {ex.name}
                          </span>

                          {ex.alt && (
                            <span className="text-[10px] text-gray-600 font-medium ">
                              Alt: {ex.alt}
                            </span>
                          )}
                        </div>

                        <div className="text-right">
                          <div className="text-sm font-black text-orange-500 tracking-tighter">
                            {ex.sets}{" "}
                            <span className="text-[10px] text-gray-500 font-normal uppercase">
                              Sets
                            </span>
                          </div>
                          <div className="text-[11px] text-gray-400 font-mono">
                            {ex.reps} REPS | {ex.rest}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ================= CARDIO SECTION ================= */}
      <section className="relative mt-32 p-8 md:p-12 bg-white/[0.02] border border-white/5 rounded-[40px]">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-black uppercase tracking-tighter mb-4">
            Metabolic <span className="text-orange-500">Conditioning</span>
          </h2>
          <div className="h-1 w-20 bg-orange-500 mx-auto rounded-full" />
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {cardioWorkouts.map((cardio, index) => (
            <motion.div
              key={`${cardio.name}-${index}`}
              whileHover={{
                scale: 1.02,
                backgroundColor: "rgba(255,255,255,0.05)",
              }}
              className="bg-black/40 border border-white/5 rounded-3xl p-6 flex flex-col justify-between transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-orange-500 uppercase tracking-tighter leading-none">
                    {cardio.name}
                  </h3>

                  <span
                    className={`text-[8px] px-2 py-0.5 rounded shadow-sm font-bold uppercase ${
                      cardio.intensity === "High" ||
                      cardio.intensity === "Very High"
                        ? "bg-red-500/20 text-red-500"
                        : "bg-green-500/20 text-green-500"
                    }`}
                  >
                    {cardio.intensity}
                  </span>
                </div>

                <p className="text-[11px] text-gray-400 leading-relaxed font-medium">
                  {cardio.description}
                </p>
              </div>

              <div className="mt-6 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                <span className="text-[10px] font-bold text-gray-500 uppercase">
                  {cardio.duration}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ================= EXERCISE LIBRARY (API) ================= */}
      <section className="relative mt-32 p-8 md:p-12 bg-white/[0.02] border border-white/5 rounded-[40px]">
        <div className="text-center mb-10">
          <h2 className="text-4xl font-black uppercase tracking-tighter mb-4">
            Exercise <span className="text-orange-500">Library</span>
          </h2>
          <div className="h-1 w-20 bg-orange-500 mx-auto rounded-full" />
          <p className="text-gray-400 max-w-2xl mx-auto mt-4 text-xs uppercase tracking-widest">
            {shownCountText}
          </p>
        </div>

        {/* Filters */}
        <div className="mb-8 grid lg:grid-cols-4 gap-3">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search exercises..."
            className="w-full px-4 py-3 rounded-2xl bg-black/40 border border-white/10 text-sm outline-none focus:border-orange-500/40"
          />

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full px-4 py-3 rounded-2xl bg-black/40 border border-white/10 text-sm outline-none focus:border-orange-500/40"
          >
            {filterOptions.categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <select
            value={equipmentFilter}
            onChange={(e) => setEquipmentFilter(e.target.value)}
            className="w-full px-4 py-3 rounded-2xl bg-black/40 border border-white/10 text-sm outline-none focus:border-orange-500/40"
          >
            {filterOptions.equipment.map((e) => (
              <option key={e} value={e}>
                {e}
              </option>
            ))}
          </select>

          <div className="flex gap-3">
            <select
              value={muscleFilter}
              onChange={(e) => setMuscleFilter(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-black/40 border border-white/10 text-sm outline-none focus:border-orange-500/40"
            >
              {filterOptions.muscles.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={resetFilters}
              className="px-4 py-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-black uppercase tracking-widest text-orange-500 whitespace-nowrap"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-8">
            <ErrorState
              title="API Connection Offline"
              message={error.message || "Failed to establish a hand-shake connection with the exercise database registry."}
              onRetry={refetch}
            />
          </div>
        )}

        {/* List */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((ex) => (
            <motion.div
              key={ex.id}
              whileHover={{
                scale: 1.01,
                backgroundColor: "rgba(255,255,255,0.05)",
              }}
              className="bg-black/40 border border-white/5 rounded-3xl p-6 flex flex-col justify-between transition-all"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-bold text-orange-500 uppercase tracking-tighter leading-none">
                    {ex.name}
                  </h3>
                  <span className="text-[9px] px-2 py-0.5 rounded bg-white/5 border border-white/10 text-gray-300 uppercase">
                    {String(ex.category || "Unknown")}
                  </span>
                </div>

                <p className="text-[11px] text-gray-400 mt-3 leading-relaxed font-medium line-clamp-4">
                  {ex.description || "—"}
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  {(ex.equipment || []).slice(0, 3).map((e) => (
                    <span
                      key={`${ex.id}-eq-${String(e)}`}
                      className="text-[9px] px-2 py-0.5 rounded bg-orange-500/10 border border-orange-500/20 text-orange-400 uppercase"
                    >
                      {String(e)}
                    </span>
                  ))}

                  {(ex.muscles || []).slice(0, 3).map((m) => (
                    <span
                      key={`${ex.id}-mu-${String(m)}`}
                      className="text-[9px] px-2 py-0.5 rounded bg-white/5 border border-white/10 text-gray-300 uppercase"
                    >
                      {String(m)}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Empty state */}
        {!loading && !error && filteredItems.length === 0 && (
          <div className="bg-[#0c0c0c] border border-dashed border-white/5 p-16 rounded-3xl text-center text-gray-500 text-sm space-y-2 mt-10">
            <div className="text-lg font-bold uppercase tracking-wider text-white">No Exercises Matched</div>
            <p className="max-w-md mx-auto text-xs">We couldn&apos;t find any exercise matching your filter values. Try resetting filters to view all entries.</p>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        )}

        {/* Load more */}
        <div className="mt-10 flex items-center justify-center">
          <button
            type="button"
            disabled={loading || !canLoadMore}
            onClick={loadMore}
            className={`px-6 py-3 rounded-2xl border text-xs font-black uppercase tracking-widest transition-all
              ${
                loading || !canLoadMore
                  ? "bg-white/5 border-white/10 text-gray-500 cursor-not-allowed"
                  : "bg-orange-500/10 border-orange-500/30 text-orange-500 hover:bg-orange-500/15"
              }`}
          >
            {canLoadMore
              ? loading
                ? "Loading..."
                : "Load More"
              : "No More Exercises"}
          </button>
        </div>
      </section>
    </div>
  );
}