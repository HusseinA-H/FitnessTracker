import { motion, useInView } from "framer-motion";
import { useRef } from "react";

export default function CTASection() {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  /* =========================
     Smooth Scroll To Packages
  ========================== */
  const scrollToPackages = () => {
    const section = document.getElementById("packages");
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section
      ref={sectionRef}
      className="relative py-32 bg-black overflow-hidden text-center"
    >
      <motion.div
        initial={{ opacity: 0, y: 80, scale: 0.95, filter: "blur(10px)" }}
        animate={
          isInView
            ? { opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }
            : {}
        }
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 max-w-4xl mx-auto px-6"
      >

        {/* Title */}
        <h2 className="text-5xl md:text-6xl font-bold mb-6 leading-tight relative inline-block">
          Ready To Transform{" "}
          <span className="text-orange-500 relative">
            Your Body
            {/* Animated Underline */}
            <motion.span
              className="absolute left-0 -bottom-2 h-1 bg-orange-500"
              initial={{ width: 0 }}
              animate={isInView ? { width: "100%" } : {}}
              transition={{ duration: 0.7, delay: 0.5 }}
            />
          </span>
        </h2>

        <p className="text-gray-400 text-lg mb-12 max-w-2xl mx-auto">
          Join Coach Belghamdi today and follow a structured,
          scientific training system designed for real results.
        </p>

        {/* Button */}
        <motion.button
          whileHover={{
            scale: 1.05,
            boxShadow: "0px 0px 25px rgba(255,107,0,0.6)"
          }}
          whileTap={{ scale: 0.95 }}
          onClick={scrollToPackages}
          className="px-12 py-5 bg-orange-500 text-black text-lg font-bold rounded-xl transition duration-300"
        >
          Join Now — 299 EGP
        </motion.button>

        <p className="text-sm text-gray-500 mt-6">
          Limited Time Offer — 50% Discount Applied
        </p>

      </motion.div>
    </section>
  );
}
