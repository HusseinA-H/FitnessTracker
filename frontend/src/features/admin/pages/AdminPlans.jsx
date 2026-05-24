import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Edit2,
  Trash2,
  AlertCircle,
  RefreshCw,
  X,
  SlidersHorizontal,
} from "lucide-react";
import { useEffect, useState } from "react";

import { adminRepository } from "../../../data/api/admin/adminRepository";
import { subscriptionsRepository } from "../../../data/api/subscriptions/subscriptionsRepository";

import ConfirmationDialog from "@shared/components/ConfirmationDialog";
import { SkeletonCard } from "@shared/components/Skeleton";
import { useToast } from "@shared/components/Toast";

export default function AdminPlans() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const toast = useToast();

  // Form Modal State
  const [showModal, setShowModal] = useState(false);
  const [editPlanId, setEditPlanId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Plan Form Fields
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [durationDays, setDurationDays] = useState("30");
  const [currency, setCurrency] = useState("USD");
  
  // Features Config
  const [workoutLimit, setWorkoutLimit] = useState("-1"); // -1 is unlimited
  const [aiLimit, setAiLimit] = useState("-1");
  const [dashboardAccess, setDashboardAccess] = useState(true);

  // Confirmation state
  const [pendingDeletePlanId, setPendingDeletePlanId] = useState(null);

  const fetchPlansList = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await subscriptionsRepository.getPlans();
      const list = response?.data || response || [];
      setPlans(list);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch subscription plans list.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlansList();
  }, []);

  const handleOpenCreate = () => {
    setEditPlanId(null);
    setName("");
    setSlug("");
    setDescription("");
    setPrice("");
    setDurationDays("30");
    setCurrency("USD");
    setWorkoutLimit("-1");
    setAiLimit("-1");
    setDashboardAccess(true);
    setShowModal(true);
  };

  const handleOpenEdit = (plan) => {
    setEditPlanId(plan.id);
    setName(plan.name || "");
    setSlug(plan.slug || "");
    setDescription(plan.description || "");
    setPrice(String(plan.price) || "");
    setDurationDays(String(plan.duration_days) || "30");
    setCurrency(plan.currency || "USD");
    
    const features = plan.features || {};
    setWorkoutLimit(String(features.workout_limit ?? "-1"));
    setAiLimit(String(features.ai_limit ?? "-1"));
    setDashboardAccess(features.dashboard_access !== false);
    setShowModal(true);
  };

  const triggerDeletePlan = (planId) => {
    setPendingDeletePlanId(planId);
  };

  const executeDeletePlan = async () => {
    if (!pendingDeletePlanId) return;
    const planId = pendingDeletePlanId;
    setPendingDeletePlanId(null);
    try {
      await adminRepository.deletePlan(planId);
      setPlans(prev => prev.filter(p => p.id !== planId));
      toast.success("Membership plan tier deleted.");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete plan.");
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!name || !slug || !price) {
      toast.warning("Please fill in name, slug, and price.");
      return;
    }

    setSubmitting(true);
    const planData = {
      name,
      slug: slug.toLowerCase().replace(/\s+/g, "-"),
      description,
      price: parseFloat(price),
      duration_days: parseInt(durationDays),
      currency,
      features: {
        workout_limit: parseInt(workoutLimit),
        ai_limit: parseInt(aiLimit),
        dashboard_access: dashboardAccess,
        feature_flags: {
          advanced_analytics: dashboardAccess
        }
      }
    };

    try {
      if (editPlanId) {
        // Edit existing
        const response = await adminRepository.updatePlan(editPlanId, planData);
        const updated = response?.data || response;
        setPlans(prev => prev.map(p => p.id === editPlanId ? updated : p));
        toast.success("Membership plan settings updated successfully!");
      } else {
        // Create new
        const response = await adminRepository.createPlan(planData);
        const created = response?.data || response;
        setPlans(prev => [...prev, created]);
        toast.success("New subscription tier plan created!");
      }
      setShowModal(false);
    } catch (err) {
      toast.error("Failed to save plan details: " + (err?.body?.detail || err?.message));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-8 space-y-8 pt-24">
      {/* Title */}
      <div className="flex items-center justify-between border-b border-white/5 pb-5">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tight">Membership Plans</h1>
          <p className="text-xs text-gray-500 uppercase tracking-widest mt-1">Configure subscription pricing, duration, and feature limitations</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="px-4 py-2.5 bg-orange-500 hover:bg-orange-400 text-black font-black uppercase text-xs rounded-xl transition flex items-center gap-2"
        >
          <Plus size={14} /> Add Plan Tier
        </button>
      </div>

      {/* Main List */}
      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : error ? (
        <div className="bg-red-500/10 border border-red-500/30 p-6 rounded-2xl flex items-center gap-3 text-red-400 text-sm">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      ) : plans.length === 0 ? (
        <div className="bg-white/[0.02] border border-white/5 p-16 rounded-3xl text-center text-gray-500 text-sm">
          No membership plans found. Click the button above to initialize your first tier.
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((p) => {
            const features = p.features || {};
            const isPremium = p.slug === "premium";
            const isElite = p.slug === "elite";
            return (
              <div
                key={p.id}
                className={`relative p-6 rounded-3xl border bg-[#111] space-y-4 flex flex-col transition duration-300 ${
                  isPremium
                    ? "border-orange-500 shadow-[0_0_30px_rgba(255,107,0,0.1)]"
                    : isElite
                    ? "border-purple-500/50"
                    : "border-white/5"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-black uppercase tracking-tight text-white">{p.name}</h3>
                    <span className="text-[9px] uppercase tracking-wider text-orange-500 font-bold font-mono">
                      slug: {p.slug}
                    </span>
                  </div>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => handleOpenEdit(p)}
                      className="p-1.5 bg-white/5 border border-white/5 hover:border-orange-500/30 hover:bg-orange-500/10 text-gray-400 hover:text-orange-500 rounded-lg transition"
                      title="Edit Plan"
                    >
                      <Edit2 size={12} />
                    </button>
                     <button
                       onClick={() => triggerDeletePlan(p.id)}
                       className="p-1.5 bg-white/5 border border-white/5 hover:border-red-500/30 hover:bg-red-500/10 text-gray-400 hover:text-red-500 rounded-lg transition"
                       title="Delete Plan"
                     >
                       <Trash2 size={12} />
                     </button>
                  </div>
                </div>

                <p className="text-xs text-gray-400 leading-normal line-clamp-3 flex-1">
                  {p.description || "No description configured."}
                </p>

                <div className="flex items-baseline gap-1 py-2 border-y border-white/5">
                  <span className="text-2xl font-black text-white italic">${Math.round(p.price)}</span>
                  <span className="text-[10px] uppercase text-gray-500 font-bold">
                    {p.currency} / {p.duration_days} Days
                  </span>
                </div>

                <ul className="space-y-1.5 text-[10px] text-gray-500 font-medium">
                  <li className="flex justify-between">
                    <span>Workouts:</span>
                    <span className="font-bold text-white uppercase">{features.workout_limit === -1 ? "Unlimited" : `${features.workout_limit} Logs`}</span>
                  </li>
                  <li className="flex justify-between">
                    <span>AI Quota:</span>
                    <span className="font-bold text-white uppercase">{features.ai_limit === -1 ? "Unlimited" : `${features.ai_limit} / Mo`}</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Analytics Access:</span>
                    <span className="font-bold text-white uppercase">{features.dashboard_access ? "Yes" : "No"}</span>
                  </li>
                </ul>
              </div>
            );
          })}
        </div>
      )}

      {/* ================= EDIT/CREATE PLAN MODAL ================= */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-[98] p-4">
            <motion.div
              className="bg-[#111] border border-gray-800 max-w-lg w-full p-8 rounded-3xl overflow-hidden shadow-2xl relative space-y-6 max-h-[90vh] overflow-y-auto custom-scrollbar"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
            >
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white p-2 rounded-xl transition"
              >
                <X size={18} />
              </button>

              <h3 className="text-2xl font-black uppercase tracking-tight flex items-center gap-3">
                <SlidersHorizontal className="text-orange-500" size={22} />
                {editPlanId ? "Edit Membership Plan" : "Create Subscription Plan"}
              </h3>

              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {/* Name */}
                  <div className="space-y-1.5 col-span-2">
                    <span className="block text-[10px] font-black text-gray-500 uppercase">Plan Name</span>
                    <input
                      type="text"
                      placeholder="e.g. Elite Membership"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full p-3 bg-black border border-gray-800 rounded-xl text-xs outline-none focus:border-orange-500 transition text-gray-200"
                      required
                    />
                  </div>

                  {/* Slug */}
                  <div className="space-y-1.5">
                    <span className="block text-[10px] font-black text-gray-500 uppercase">Slug Key</span>
                    <input
                      type="text"
                      placeholder="e.g. elite"
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      className="w-full p-3 bg-black border border-gray-800 rounded-xl text-xs outline-none focus:border-orange-500 transition text-gray-200"
                      required
                      disabled={!!editPlanId}
                    />
                  </div>

                  {/* Price */}
                  <div className="space-y-1.5">
                    <span className="block text-[10px] font-black text-gray-500 uppercase">Price ($)</span>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="e.g. 29.99"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="w-full p-3 bg-black border border-gray-800 rounded-xl text-xs outline-none focus:border-orange-500 transition text-gray-200"
                      required
                    />
                  </div>

                  {/* Duration */}
                  <div className="space-y-1.5">
                    <span className="block text-[10px] font-black text-gray-500 uppercase">Duration (Days)</span>
                    <input
                      type="number"
                      value={durationDays}
                      onChange={(e) => setDurationDays(e.target.value)}
                      className="w-full p-3 bg-black border border-gray-800 rounded-xl text-xs outline-none focus:border-orange-500 transition text-gray-200"
                      required
                      min={1}
                    />
                  </div>

                  {/* Currency */}
                  <div className="space-y-1.5">
                    <span className="block text-[10px] font-black text-gray-500 uppercase">Currency</span>
                    <input
                      type="text"
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="w-full p-3 bg-black border border-gray-800 rounded-xl text-xs outline-none focus:border-orange-500 transition text-gray-200"
                      required
                    />
                  </div>

                  {/* Description */}
                  <div className="space-y-1.5 col-span-2">
                    <span className="block text-[10px] font-black text-gray-500 uppercase">Plan Description</span>
                    <textarea
                      placeholder="Summarize plan features and benefits..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={3}
                      className="w-full p-3 bg-black border border-gray-800 rounded-xl text-xs outline-none focus:border-orange-500 transition text-gray-200 resize-none"
                    />
                  </div>

                  {/* Gated Limits header */}
                  <div className="col-span-2 border-t border-white/5 pt-4 text-xs font-black uppercase text-orange-500 tracking-wide">
                    Plan Feature Limits
                  </div>

                  {/* Workout logs limit */}
                  <div className="space-y-1.5">
                    <span className="block text-[10px] font-black text-gray-500 uppercase">Workout Logs Limit (-1 = unlimited)</span>
                    <input
                      type="number"
                      value={workoutLimit}
                      onChange={(e) => setWorkoutLimit(e.target.value)}
                      className="w-full p-3 bg-black border border-gray-800 rounded-xl text-xs outline-none focus:border-orange-500 transition text-gray-200"
                      required
                    />
                  </div>

                  {/* AI Prompts limit */}
                  <div className="space-y-1.5">
                    <span className="block text-[10px] font-black text-gray-500 uppercase">AI Prompt Limit / Mo (-1 = unlimited)</span>
                    <input
                      type="number"
                      value={aiLimit}
                      onChange={(e) => setAiLimit(e.target.value)}
                      className="w-full p-3 bg-black border border-gray-800 rounded-xl text-xs outline-none focus:border-orange-500 transition text-gray-200"
                      required
                    />
                  </div>

                  {/* Advanced Dashboard Access checkbox */}
                  <div className="col-span-2 flex items-center gap-3 p-3 bg-black border border-gray-800 rounded-xl">
                    <input
                      id="dashboardAccess"
                      type="checkbox"
                      checked={dashboardAccess}
                      onChange={(e) => setDashboardAccess(e.target.checked)}
                      className="w-4 h-4 accent-orange-500"
                    />
                    <label htmlFor="dashboardAccess" className="text-xs text-gray-300 font-semibold cursor-pointer">
                      Grant Advanced Analytics Dashboard & Progress Graphs Access
                    </label>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-4 bg-orange-500 hover:bg-orange-400 text-black font-black uppercase text-xs rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-50 mt-4"
                >
                  {submitting ? <RefreshCw size={14} className="animate-spin" /> : "Save Plan Tier"}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ConfirmationDialog
        isOpen={pendingDeletePlanId !== null}
        title="Delete Membership Plan"
        message="Are you sure you want to permanently delete this subscription plan tier? Active subscribers linked to this plan will remain active but future checkouts will be locked."
        confirmLabel="Delete Plan"
        cancelLabel="Keep Plan"
        onConfirm={executeDeletePlan}
        onCancel={() => setPendingDeletePlanId(null)}
        isDanger={true}
      />
    </div>
  );
}
