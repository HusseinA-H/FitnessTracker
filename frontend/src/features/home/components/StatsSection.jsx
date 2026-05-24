import { motion, useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";

const stats = [
  { label: "Active Clients", value: 500, suffix: "+", icon: "users" },
  { label: "Transformations", value: 1200, suffix: "+", icon: "muscle" },
  { label: "Training Hours", value: 50000, suffix: "+", icon: "clock" },
  { label: "Average Rating", value: 4.9, suffix: "/5", icon: "star" },
];

// Deterministic “random-like” number in [0, 1)
function pseudo01(i, salt = 1) {
  return Math.abs(Math.sin(i * 999 + salt)) % 1;
}

export default function StatsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section
      ref={ref}
      className="relative py-32 bg-gradient-to-b from-black to-[#111] text-center overflow-hidden"
    >
      {/* Subtle Particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(12)].map((_, i) => {
          const width =
            typeof window !== "undefined" && window.innerWidth
              ? window.innerWidth
              : 1200;

          const x = pseudo01(i, 11) * width;
          const y = pseudo01(i, 22) * 600;
          const duration = 4 + pseudo01(i, 33) * 3; // 4..7

          return (
            <motion.span
              key={i}
              className="absolute w-1.5 h-1.5 bg-orange-500 rounded-full opacity-20"
              initial={{ x, y }}
              animate={{ y: [0, -40, 0] }}
              transition={{ duration, repeat: Infinity }}
            />
          );
        })}
      </div>

      <div className="relative max-w-6xl mx-auto px-6">
        <h2 className="text-5xl font-bold mb-20">
          Proven <span className="text-orange-500">Results</span>
        </h2>

        <div className="grid md:grid-cols-4 gap-12">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 80 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              whileHover={{
                y: -10,
                boxShadow: "0px 0px 35px rgba(255,107,0,0.15)",
              }}
              className="bg-white/5 backdrop-blur-lg border border-white/10 p-10 rounded-3xl relative transition duration-300"
            >
              <Icon type={stat.icon} />

              <ProgressCircle value={stat.value} isInView={isInView} />

              <p className="text-gray-400 mt-6 text-sm tracking-wide">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* =========================
   Animated Counter
========================= */
function useCounter(end, duration = 2000) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const increment = end / (duration / 16);

    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        clearInterval(timer);
        setCount(end);
      } else {
        setCount(start);
      }
    }, 16);

    return () => clearInterval(timer);
  }, [end, duration]);

  return count;
}

/* =========================
   Progress Circle
========================= */
function ProgressCircle({ value, isInView }) {
  const count = useCounter(isInView ? value : 0);
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(count / value, 1);
  const offset = circumference - progress * circumference;

  return (
    <div className="relative flex justify-center items-center mt-6">
      <svg width="150" height="150">
        <circle
          cx="75"
          cy="75"
          r={radius}
          stroke="rgba(255,107,0,0.2)"
          strokeWidth="8"
          fill="transparent"
        />
        <motion.circle
          cx="75"
          cy="75"
          r={radius}
          stroke="#ff6b00"
          strokeWidth="8"
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 2 }}
        />
      </svg>

      <div className="absolute text-2xl font-bold text-orange-500">
        {value % 1 === 0 ? Math.floor(count) : count.toFixed(1)}
      </div>
    </div>
  );
}

/* =========================
   Icons
========================= */
function Icon({ type }) {
  const common = "w-8 h-8 text-orange-500 mx-auto mb-4";

  switch (type) {
    case "users":
      return (
        <svg className={common} fill="currentColor" viewBox="0 0 24 24">
          <path d="M16 11c1.66 0 3-1.34 3-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3zM8 11c1.66 0 3-1.34 3-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zM8 13c-2.67 0-8 1.34-8 4v3h10v-3c0-2.66-5.33-4-8-4zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.92 1.97 2.95v3h8v-3c0-2.66-5.33-4-8-4z" />
        </svg>
      );
    case "muscle":
      return (
        <svg className={common} fill="currentColor" viewBox="0 0 24 24">
          <path d="M20 6h-2V4h-2v2h-2V4h-2v2H8V4H6v2H4v2h2v2H4v2h2v2H4v2h2v2h2v-2h2v2h2v-2h2v2h2v-2h2v-2h-2v-2h2v-2h-2V8h2z" />
        </svg>
      );
    case "clock":
      return (
        <svg className={common} fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2a10 10 0 100 20 10 10 0 000-20zm1 11h4v-2h-3V7h-2v6z" />
        </svg>
      );
    case "star":
      return (
        <svg className={common} fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 .587l3.668 7.431 8.2 1.193-5.934 5.786 1.402 8.173L12 18.896l-7.336 3.874 1.402-8.173L.132 9.211l8.2-1.193z" />
        </svg>
      );
    default:
      return null;
  }
}