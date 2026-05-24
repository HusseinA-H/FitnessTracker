import { motion } from "framer-motion";
import { useState } from "react";

export default function Feedback() {
  const [rating, setRating] = useState(0);
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    // حالياً مجرد Front-End فقط
    console.log("Rating:", rating);
    console.log("Message:", message);

    setSubmitted(true);
    setMessage("");
    setRating(0);

    setTimeout(() => {
      setSubmitted(false);
    }, 3000);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-xl bg-[#111] border border-white/10 
                   rounded-3xl p-10 shadow-[0_0_40px_rgba(255,107,0,0.1)]"
      >
        <h2 className="text-2xl font-bold text-center mb-6">
          Give Feedback
        </h2>

        {submitted && (
          <div className="mb-6 text-center text-orange-500 font-semibold">
            Thank you for your feedback 🙏
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Rating */}
          <div className="flex justify-center space-x-3 text-2xl">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                type="button"
                key={star}
                onClick={() => setRating(star)}
                className={`transition ${
                  star <= rating
                    ? "text-orange-500 scale-110"
                    : "text-gray-600 hover:text-orange-400"
                }`}
              >
                ★
              </button>
            ))}
          </div>

          {/* Message */}
          <textarea
            rows="4"
            placeholder="Tell us what you think..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full p-4 bg-black border border-gray-700 rounded-xl 
                       focus:border-orange-500 focus:shadow-[0_0_15px_rgba(255,107,0,0.4)] 
                       transition resize-none"
          />

          {/* Submit */}
          <button
            type="submit"
            className="w-full py-3 bg-orange-500 text-black font-semibold 
                       rounded-xl hover:bg-orange-400 transition"
          >
            Submit Feedback
          </button>
        </form>
      </motion.div>
    </div>
  );
}
