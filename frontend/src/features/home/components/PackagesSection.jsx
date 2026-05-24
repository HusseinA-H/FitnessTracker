import { motion, AnimatePresence } from "framer-motion";
import { Check, Upload, AlertCircle, X, CreditCard, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { subscriptionsRepository } from "@/data/api/subscriptions/subscriptionsRepository";
import { useAuth } from "@features/auth";

export default function PackagesSection() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [dbPlans, setDbPlans] = useState([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [selectedPlanDetails, setSelectedPlanDetails] = useState(null);
  const [showCheckout, setShowCheckout] = useState(false);

  // Checkout Form State
  const [paymentMethod, setPaymentMethod] = useState("BANK_TRANSFER");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [proofImage, setProofImage] = useState(null);
  const [submittingPayment, setSubmittingPayment] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    setLoadingPlans(true);
    try {
      const response = await subscriptionsRepository.getPlans();
      // standard response wrapper
      const list = response?.data || response || [];
      
      // Sort plans by price ascending
      const sorted = [...list].sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
      setDbPlans(sorted);
    } catch (err) {
      console.error("Failed to fetch subscription plans:", err);
    } finally {
      setLoadingPlans(false);
    }
  };

  const handleSubscribeClick = (plan) => {
    if (!user) {
      // Trigger sign-in modal via URL query param
      navigate("?auth=signin");
      return;
    }
    setSelectedPlanDetails(plan);
    setShowCheckout(true);
    setErrorMessage("");
    setSuccessMessage("");
    setReferenceNumber("");
    setProofImage(null);
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setProofImage(e.target.files[0]);
    }
  };

  const handleCheckoutSubmit = async (e) => {
    e.preventDefault();
    if (!referenceNumber || !proofImage || !selectedPlanDetails) {
      setErrorMessage("Please enter reference number and select a receipt image.");
      return;
    }

    setSubmittingPayment(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      // 1. Create a pending Subscription
      const subResponse = await subscriptionsRepository.createSubscription(selectedPlanDetails.id);
      const sub = subResponse?.data || subResponse;

      // 2. Upload proof receipt screenshot as Payment
      const formData = new FormData();
      formData.append("subscription", sub.id);
      formData.append("amount", selectedPlanDetails.price);
      formData.append("currency", selectedPlanDetails.currency || "EGP");
      formData.append("payment_method", paymentMethod);
      formData.append("reference_number", referenceNumber);
      formData.append("proof_image", proofImage);

      await subscriptionsRepository.createPayment(formData);

      setSuccessMessage(
        "🎉 Payment submitted successfully! An administrator will review your receipt screenshot and approve your subscription shortly."
      );
    } catch (err) {
      console.error("Checkout failed:", err);
      const parsedError = err?.body?.detail || err?.message || "Checkout failed. Please verify the receipt image size (<5MB) and type (PNG/JPG).";
      setErrorMessage(parsedError);
    } finally {
      setSubmittingPayment(false);
    }
  };

  return (
    <section className="py-24 px-4 md:px-10 max-w-6xl mx-auto space-y-16">
      <div className="text-center space-y-4">
        <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter">
          Membership <span className="text-orange-500">Tiers</span>
        </h2>
        <p className="text-gray-400 max-w-xl mx-auto uppercase tracking-widest text-xs">
          Select a master split or get full access to FitCoach AI features
        </p>
      </div>

      {loadingPlans ? (
        <div className="text-center text-gray-500 py-10 text-sm">
          Loading membership plans...
        </div>
      ) : dbPlans.length === 0 ? (
        <div className="text-center text-gray-500 py-10 text-sm">
          No subscription plans configured in database.
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-8">
          {dbPlans.map((plan) => {
            const features = plan.features || {};
            const isPremium = plan.slug === "premium";
            const isElite = plan.slug === "elite";

            const planFeatures = [
              features.workout_limit === -1 ? "Unlimited Workout Logs" : `${features.workout_limit} Workout Logs Limit`,
              features.ai_limit === -1 ? "Unlimited AI Assistant Prompts" : `${features.ai_limit} AI Prompts / Month`,
              features.dashboard_access ? "Advanced Analytics Dashboard" : "Standard Features Only",
              features.feature_flags?.advanced_analytics ? "Progress Intelligence Graphs" : "Basic Charts",
              "Private Community Access",
            ];

            return (
              <motion.div
                key={plan.id}
                whileHover={{ y: -8 }}
                className={`relative p-8 rounded-3xl border bg-[#111] transition duration-300 ${
                  isPremium
                    ? "border-orange-500 shadow-[0_0_30px_rgba(255,107,0,0.15)]"
                    : isElite
                    ? "border-purple-500/50 shadow-[0_0_20px_rgba(168,85,247,0.1)]"
                    : "border-gray-800 hover:border-orange-500/40"
                }`}
              >
                {/* Badge Ribbon */}
                {isPremium && (
                  <div className="absolute -top-4 -left-4 bg-orange-500 text-black px-4 py-1 text-[10px] font-black uppercase rounded-full shadow-lg">
                    ⭐ Popular
                  </div>
                )}
                {isElite && (
                  <div className="absolute -top-4 -left-4 bg-purple-500 text-white px-4 py-1 text-[10px] font-black uppercase rounded-full shadow-lg">
                    ⚡ Best Value
                  </div>
                )}

                <div className="absolute top-4 right-4 bg-black/60 border border-white/5 text-orange-500 text-[10px] px-3 py-1 rounded-full font-black uppercase">
                  Active tier
                </div>

                <h3 className="text-2xl font-black uppercase tracking-tight mb-4 text-white">
                  {plan.name}
                </h3>
                
                <p className="text-gray-400 text-xs mb-6 h-12 leading-relaxed line-clamp-3">
                  {plan.description || `Unlock the standard capabilities of the ${plan.name} plan.`}
                </p>

                <ul className="space-y-3 mb-8 text-xs">
                  {planFeatures.map((f, i) => (
                    <li key={i} className="flex items-center gap-3 text-gray-300">
                      <Check size={14} className="text-orange-500 shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                <div className="mb-6 flex items-baseline gap-1">
                  <span className="text-3xl font-black text-orange-500 italic">
                    {Math.round(plan.price)}
                  </span>
                  <span className="text-xs uppercase text-gray-500 font-bold">
                    {plan.currency} / {plan.duration_days} Days
                  </span>
                </div>

                <button
                  onClick={() => handleSubscribeClick(plan)}
                  className={`w-full py-3.5 rounded-xl text-xs font-black uppercase tracking-widest transition active:scale-95 ${
                    isPremium
                      ? "bg-orange-500 text-black hover:bg-orange-400"
                      : "bg-white/5 hover:bg-white/10 border border-white/10 text-white"
                  }`}
                >
                  Subscribe Now
                </button>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* ================= CHECKOUT MODAL ================= */}
      <AnimatePresence>
        {showCheckout && selectedPlanDetails && (
          <motion.div
            className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              if (!submittingPayment) setShowCheckout(false);
            }}
          >
            <motion.div
              className="bg-[#111] border border-gray-800 max-w-lg w-full p-8 rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(255,107,0,0.2)] relative space-y-6"
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              {!submittingPayment && (
                <button
                  onClick={() => setShowCheckout(false)}
                  className="absolute top-4 right-4 text-gray-400 hover:text-white hover:bg-white/5 p-2 rounded-xl transition"
                >
                  <X size={18} />
                </button>
              )}

              <h3 className="text-2xl font-black uppercase tracking-tight flex items-center gap-3">
                <CreditCard className="text-orange-500" /> Checkout Portal
              </h3>

              {successMessage ? (
                <div className="space-y-6 py-6 text-center">
                  <p className="text-gray-300 text-sm leading-relaxed">{successMessage}</p>
                  <button
                    onClick={() => {
                      setShowCheckout(false);
                      // Force reload user context to sync profile
                      window.location.reload();
                    }}
                    className="w-full py-3.5 bg-orange-500 hover:bg-orange-400 text-black font-black uppercase text-xs rounded-xl transition"
                  >
                    Return to Dashboard
                  </button>
                </div>
              ) : (
                <form onSubmit={handleCheckoutSubmit} className="space-y-6">
                  {errorMessage && (
                    <div className="p-3 text-xs bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl flex items-center gap-2">
                      <AlertCircle size={14} className="shrink-0" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  <div className="bg-black/40 border border-white/5 p-4 rounded-2xl text-xs space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400 font-bold uppercase">Plan Tiers:</span>
                      <span className="text-white font-bold">{selectedPlanDetails.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400 font-bold uppercase">Total Charges:</span>
                      <span className="text-orange-500 font-black">{Math.round(selectedPlanDetails.price)} {selectedPlanDetails.currency}</span>
                    </div>
                    <div className="border-t border-white/5 my-2 pt-2 text-gray-500 leading-normal">
                      💳 Transfer amount to Instapay username <span className="text-white font-bold">fitcoach@instapay</span> or Vodafone cash number <span className="text-white font-bold">0100 123 4567</span>, then upload the receipt proof below.
                    </div>
                  </div>

                  <div className="space-y-4">
                    {/* Payment Method */}
                    <div className="space-y-1.5">
                      <span className="block text-[10px] font-black text-gray-500 uppercase">Payment Method</span>
                      <select
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="w-full p-3 bg-black border border-gray-800 rounded-xl text-xs outline-none focus:border-orange-500 transition"
                      >
                        <option value="BANK_TRANSFER">Bank/Instapay Transfer</option>
                        <option value="CASH">Vodafone Cash</option>
                        <option value="OTHER">Other Method</option>
                      </select>
                    </div>

                    {/* Reference Number */}
                    <div className="space-y-1.5">
                      <span className="block text-[10px] font-black text-gray-500 uppercase">Transaction ID / Reference Number</span>
                      <input
                        type="text"
                        placeholder="Enter transaction ref number"
                        value={referenceNumber}
                        onChange={(e) => setReferenceNumber(e.target.value)}
                        className="w-full p-3 bg-black border border-gray-800 rounded-xl text-xs outline-none focus:border-orange-500 transition"
                        required
                      />
                    </div>

                    {/* Receipt Screenshot */}
                    <div className="space-y-1.5">
                      <span className="block text-[10px] font-black text-gray-500 uppercase">Receipt Screenshot</span>
                      <div className="flex items-center justify-center w-full">
                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-800 hover:border-orange-500/50 rounded-2xl cursor-pointer bg-black/40 hover:bg-black/60 transition p-4">
                          <div className="flex flex-col items-center justify-center space-y-2 text-center">
                            <Upload className="text-gray-500 hover:text-orange-400 transition" size={24} />
                            <span className="text-xs text-gray-400">
                              {proofImage ? proofImage.name : "Select Screenshot file"}
                            </span>
                            <span className="text-[9px] text-gray-600">PNG, JPG or JPEG up to 5MB</span>
                          </div>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="hidden"
                            required
                          />
                        </label>
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={submittingPayment || !referenceNumber || !proofImage}
                    className="w-full py-4 bg-orange-500 hover:bg-orange-400 text-black font-black uppercase text-xs rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {submittingPayment ? (
                      <>
                        <RefreshCw size={16} className="animate-spin" /> Verifying Receipt...
                      </>
                    ) : (
                      "Submit Payment Proof"
                    )}
                  </button>
                </form>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
