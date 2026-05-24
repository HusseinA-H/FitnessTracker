import { useEffect } from "react";
import { useLocation } from "react-router-dom";

import CTASection from "../components/CTASection";
import PackagesSection from "../components/PackagesSection";
import ReviewsSection from "../components/ReviewsSection";
import StatsSection from "../components/StatsSection";
import Transformations from "../components/Transformations";

export default function Home({ magneticEffect, resetMagnet }) {
  const location = useLocation();

  /* =========================
     Scroll To Packages If Coming From Settings
  ========================== */
  useEffect(() => {
    if (location.state?.scrollTo === "packages") {
      const section = document.getElementById("packages");
      if (section) {
        section.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [location]);

  return (
    <>
      {/* =========================
          Hero Section
      ========================== */}
      <section className="relative h-[85vh] flex items-center px-24 overflow-hidden">

        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1558611848-73f7eb4001a1')] bg-cover bg-center bg-fixed opacity-30" />

        <div className="relative z-10">
          <h2 className="text-6xl font-bold mb-6 leading-tight">
            Achieve Your{" "}
            <span className="text-orange-500">
              Full Potential
            </span>
          </h2>

          <p className="text-gray-400 max-w-xl mb-8">
            Train under Coach Belghamdi with structured scientific programs
            built for maximum muscle growth & strength.
          </p>

          <button
            onMouseMove={magneticEffect}
            onMouseLeave={resetMagnet}
            onClick={() => {
              const section = document.getElementById("packages");
              if (section) {
                section.scrollIntoView({ behavior: "smooth" });
              }
            }}
            className="px-8 py-4 bg-orange-500 text-black font-semibold rounded-lg transition duration-300 shadow-lg hover:bg-orange-400"
          >
            Explore Programs
          </button>
        </div>
      </section>

      {/* =========================
          Packages Section
      ========================== */}
      <div id="packages">
        <PackagesSection />
      </div>

      <Transformations />
      <ReviewsSection />
      <CTASection />
      <StatsSection />
    </>
  );
}
