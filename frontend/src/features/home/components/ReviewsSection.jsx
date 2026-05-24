import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

const reviews = [
  {
    name: "Ahmed",
    image: "https://randomuser.me/api/portraits/men/32.jpg",
    text: "The most structured program I've ever followed. Strength and physique improved drastically.",
    rating: 5,
    video: "https://www.youtube.com/embed/B0YA5pbvtj8?si=a3pgtyahFG1Wpk44",
  },
  {
    name: "Hussein",
    image: "https://randomuser.me/api/portraits/men/75.jpg",
    text: "Clear progression system and real support. Finally stopped wasting time with random workouts.",
    rating: 5,
    video: "https://www.youtube.com/embed/B0YA5pbvtj8?si=a3pgtyahFG1Wpk44",
  },
  {
    name: "Omar",
    image: "https://randomuser.me/api/portraits/men/45.jpg",
    text: "Within 12 weeks I gained visible muscle and increased my strength massively.",
    rating: 5,
    video: "https://www.youtube.com/embed/B0YA5pbvtj8?si=a3pgtyahFG1Wpk44",
  },
];

export default function ReviewsSection() {
  const [index, setIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [activeVideo, setActiveVideo] = useState(null);

  useEffect(() => {
    if (isHovered) return;

    const interval = setInterval(() => {
      setIndex((prev) => (prev === reviews.length - 1 ? 0 : prev + 1));
    }, 4000);

    return () => clearInterval(interval);
  }, [isHovered]);

  return (
    <section className="relative py-28 bg-[#0f0f0f] overflow-hidden text-center">
      {/* Background Noise Texture */}
      <div
        className="absolute inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage: "url('https://grainy-gradients.vercel.app/noise.svg')",
        }}
      />

      <div className="relative max-w-4xl mx-auto px-6">
        <h2 className="text-5xl font-bold mb-20">
          What Clients <span className="text-orange-500">Say</span>
        </h2>

        <div
          className="relative"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -60 }}
              transition={{ duration: 0.5 }}
              className="bg-white/5 backdrop-blur-lg border border-white/10 p-10 rounded-3xl shadow-2xl"
            >
              {/* Stars */}
              <div className="flex justify-center mb-6">
                {[...Array(reviews[index].rating)].map((_, i) => (
                  <svg
                    key={i}
                    className="w-5 h-5 text-orange-500 mx-1"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.978a1 1 0 00.95.69h4.181c.969 0 1.371 1.24.588 1.81l-3.384 2.46a1 1 0 00-.364 1.118l1.286 3.978c.3.921-.755 1.688-1.538 1.118l-3.384-2.46a1 1 0 00-1.176 0l-3.384 2.46c-.783.57-1.838-.197-1.538-1.118l1.286-3.978a1 1 0 00-.364-1.118L2.025 9.405c-.783-.57-.38-1.81.588-1.81h4.181a1 1 0 00.95-.69l1.286-3.978z" />
                  </svg>
                ))}
              </div>

              {/* Text */}
              <p className="text-gray-300 leading-relaxed mb-8">
                “{reviews[index].text}”
              </p>

              {/* Avatar */}
              <div className="flex flex-col items-center">
                <img
                  src={reviews[index].image}
                  alt={reviews[index].name}
                  className="w-16 h-16 rounded-full border-2 border-orange-500 mb-3"
                />
                <h4 className="text-white font-semibold">{reviews[index].name}</h4>
                <p className="text-xs text-gray-500">Verified Client</p>

                {/* Video Button */}
                <button
                  type="button"
                  onClick={() => setActiveVideo(reviews[index].video)}
                  className="mt-4 text-orange-500 text-sm hover:underline"
                >
                  ▶ Watch Video Testimonial
                </button>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Dots */}
          <div className="flex justify-center gap-3 mt-8">
            {reviews.map((_, i) => (
              <button
                type="button"
                key={i}
                onClick={() => setIndex(i)}
                className={`h-2 rounded-full transition-all ${
                  i === index ? "w-8 bg-orange-500" : "w-2 bg-gray-600"
                }`}
                aria-label={`Go to review ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Video Modal (بدون click خارجًا للإغلاق لتفادي a11y errors) */}
      {activeVideo && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-6">
          <div
            role="dialog"
            aria-modal="true"
            className="relative w-full max-w-3xl aspect-video"
          >
            <button
              type="button"
              onClick={() => setActiveVideo(null)}
              className="absolute -top-12 right-0 px-4 py-2 rounded-xl bg-white/10 border border-white/10 text-white text-sm hover:bg-white/15"
              aria-label="Close video"
            >
              ✕ Close
            </button>

            <iframe
              title="Client video testimonial"
              src={activeVideo}
              className="w-full h-full rounded-2xl"
              allowFullScreen
            />
          </div>
        </div>
      )}
    </section>
  );
}