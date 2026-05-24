import { motion } from "framer-motion";
import { Lightbulb, Activity } from "lucide-react";
import { useMemo } from "react";
import { Link } from "react-router-dom";

import PackagesSection from "../components/PackagesSection";

import { useAuth } from "@features/auth";

const KNOWLEDGE_POOL = [
  {
    title: "Hydration Matters",
    text: "Even 2% dehydration can reduce performance. Drink water before you feel thirsty.",
  },
  {
    title: "Progressive Overload",
    text: "Muscles grow only when challenged. Increase weight, reps, or intensity gradually.",
  },
  {
    title: "Sleep = Growth",
    text: "Most muscle recovery and hormonal optimization happen during deep sleep.",
  },
  {
    title: "Compound Movements",
    text: "Squats, presses, and rows stimulate more muscle mass and burn more calories.",
  },
  {
    title: "Protein Intake",
    text: "Aim for 1.6–2.2g protein per kg bodyweight to maximize hypertrophy.",
  },
  {
    title: "Rest Periods",
    text: "60–90 sec for hypertrophy, 2–3 min for strength. Rest is part of training.",
  },
  {
    title: "Consistency Wins",
    text: "Your physique is built by weekly habits, not one intense workout.",
  },
  {
    title: "Cardio Strategy",
    text: "Use cardio to support recovery and conditioning, not destroy muscle gains.",
  },
];

export default function UserHome() {
  const { user } = useAuth();

  const username =
    user?.displayName || user?.email?.split("@")[0] || "Athlete";

  // ✅ Daily rotation بدون Math.random
  const dailyTips = useMemo(() => {
    const today = new Date().getDate();
    const start = today % KNOWLEDGE_POOL.length;
    const rotated = [
      ...KNOWLEDGE_POOL.slice(start),
      ...KNOWLEDGE_POOL.slice(0, start),
    ];
    return rotated.slice(0, 3);
  }, []);

  return (
    <div className="text-white overflow-x-hidden">
      {/* ================= HERO ================= */}
      <section className="relative min-h-[60vh] md:h-[60vh] flex items-center px-4 md:px-24 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1599058917765-a780eda07a3e')] bg-cover bg-center opacity-40" />
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

        <div className="relative z-10 max-w-3xl">
          <h1 className="text-3xl md:text-5xl font-bold mb-4 leading-tight break-words">
            Welcome back,
            <span className="text-orange-500 ml-2 md:ml-3 drop-shadow-[0_0_15px_rgba(255,107,0,0.9)] break-words">
              {username}
            </span>
          </h1>

          <p className="text-gray-400 text-sm md:text-lg">
            Stay consistent. Stay powerful.
          </p>

          {/* ✅ Tracker CTA */}
          <div className="mt-6 md:mt-8">
            <Link
              to="/tracker"
              onMouseEnter={() => import("@features/tracker/pages/PremiumTracker")}
              className="inline-flex flex-wrap items-center gap-3 px-5 md:px-6 py-3 rounded-2xl bg-white/5 border border-white/10 hover:border-orange-500/40 hover:shadow-[0_0_25px_rgba(255,107,0,0.15)] transition"
            >
              <Activity className="text-orange-500" />
              <span className="font-semibold">Open Premium Tracker</span>
              <span className="text-gray-400 text-sm">(Saved workouts & logs)</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ================= PACKAGES ================= */}
      <section className="mt-16 md:mt-24 px-4 md:px-24">
        <PackagesSection />
      </section>

      {/* ================= DAILY KNOWLEDGE SECTION ================= */}
      <section className="mt-20 md:mt-32 px-4 md:px-24">
        <div className="flex items-center space-x-3 mb-6 md:mb-10">
          <Lightbulb className="text-orange-500" />
          <h2 className="text-2xl md:text-3xl font-bold">
            Daily Knowledge Boost
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8">
          {dailyTips.map((tip, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2 }}
              whileHover={{ scale: 1.05 }}
              className="bg-white/5 backdrop-blur-xl border border-white/10
                         rounded-3xl p-6 md:p-8 shadow-lg
                         hover:border-orange-500/40
                         hover:shadow-[0_0_30px_rgba(255,107,0,0.2)]
                         transition duration-300 md:hover:scale-105"
            >
              <h3 className="text-lg md:text-xl font-semibold mb-3 md:mb-4 text-orange-500">
                {tip.title}
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed">{tip.text}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ================= MOTIVATION STRIP ================= */}
      <section className="relative mt-20 md:mt-32 min-h-[30vh] md:h-[40vh] flex items-center justify-center overflow-hidden px-4">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b')] bg-cover bg-center opacity-40" />
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="relative z-10 text-center max-w-3xl"
        >
          <h2 className="text-xl md:text-3xl font-bold mb-3 md:mb-4">
            Discipline creates greatness.
          </h2>
          <p className="text-gray-400 text-sm md:text-base">
            Every session compounds. Keep building.
          </p>
        </motion.div>
      </section>
    </div>
  );
}
