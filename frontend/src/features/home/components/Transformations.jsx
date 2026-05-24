import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

const transformations = [
  {
    name: "Ahmed",
    before: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438",
    after: "https://images.unsplash.com/photo-1605296867424-35fc25c9212a",
    result: "Lost 12kg & Gained Lean Muscle",
  },
  {
    name: "Sara",
    before: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61",
    after: "https://images.unsplash.com/photo-1599058917765-a780eda07a3e",
    result: "Glute Growth & Body Recomposition",
  },
  {
    name: "Omar",
    before: "https://images.unsplash.com/photo-1579758629938-03607ccdbaba",
    after: "https://images.unsplash.com/photo-1605296867304-46d5465a13f1",
    result: "Strength Increase + 8kg Muscle Gain",
  },
];

export default function Transformations() {
  const [index, setIndex] = useState(0);
  const [hovered, setHovered] = useState(false);

  const active = transformations[index];

  return (
    <section className="py-28 bg-black px-10 text-center">
      <h2 className="text-5xl font-bold mb-20">
        Client <span className="text-orange-500">Transformations</span>
      </h2>

      <div className="max-w-4xl mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -60 }}
            transition={{ duration: 0.4 }}
            className="relative rounded-3xl overflow-hidden shadow-2xl group"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
          >
            <img
              src={hovered ? active.before : active.after}
              alt={`${active.name} transformation`}
              className="w-full h-[550px] object-cover transition duration-500 scale-105"
            />

            {/* Overlay */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-8 text-left">
              <h3 className="text-3xl font-bold text-orange-500">{active.name}</h3>

              <p className="text-gray-300 mt-2">{active.result}</p>

              <p className="text-xs text-gray-500 mt-3">Hover to reveal Before</p>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation Dots */}
        <div className="flex justify-center gap-4 mt-10">
          {transformations.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === index
                  ? "w-10 bg-orange-500"
                  : "w-3 bg-gray-700 hover:bg-gray-500"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}