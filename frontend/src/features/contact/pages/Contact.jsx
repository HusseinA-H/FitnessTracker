import { motion } from "framer-motion";
import { Mail, Phone, MapPin } from "lucide-react";
import { useState } from "react";

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white px-6 md:px-24 py-24 relative overflow-hidden">

      {/* Background subtle glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-transparent blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 max-w-6xl mx-auto grid md:grid-cols-2 gap-16"
      >
        {/* Left Info */}
        <div>
          <h1 className="text-5xl font-bold mb-6">
            Get In <span className="text-orange-500">Touch</span>
          </h1>

          <p className="text-gray-400 mb-10">
            Have questions about programs, subscriptions, or coaching?
            Reach out and let’s talk.
          </p>

          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <Mail className="text-orange-500" />
              <span className="text-gray-300">coach@belghamdi.com</span>
            </div>

            <div className="flex items-center space-x-4">
              <Phone className="text-orange-500" />
              <span className="text-gray-300">+20 10 0000 0000</span>
            </div>

            <div className="flex items-center space-x-4">
              <MapPin className="text-orange-500" />
              <span className="text-gray-300">Cairo, Egypt</span>
            </div>
          </div>
        </div>

        {/* Right Form */}
        <motion.form
          onSubmit={(e) => {
            e.preventDefault();
            setSubmitted(true);
          }}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-[#111] p-10 rounded-3xl border border-gray-800 space-y-6 shadow-xl"
        >
          <input
            type="text"
            placeholder="Full Name"
            required
            className="w-full p-4 bg-black border border-gray-700 rounded-xl focus:border-orange-500 outline-none transition"
          />

          <input
            type="email"
            placeholder="Email Address"
            required
            className="w-full p-4 bg-black border border-gray-700 rounded-xl focus:border-orange-500 outline-none transition"
          />

          <textarea
            placeholder="Your Message"
            rows="5"
            required
            className="w-full p-4 bg-black border border-gray-700 rounded-xl focus:border-orange-500 outline-none transition"
          />

          <button
            type="submit"
            className="w-full py-4 bg-orange-500 text-black font-bold rounded-xl hover:bg-orange-400 transition duration-300 hover:shadow-[0_0_20px_rgba(255,107,0,0.6)]"
          >
            Send Message
          </button>

          {submitted && (
            <p className="text-green-400 text-sm mt-2">
              ✅ Message sent successfully!
            </p>
          )}
        </motion.form>
      </motion.div>
    </div>
  );
}
