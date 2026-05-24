import { motion, AnimatePresence } from "framer-motion";
import {
  CreditCard,
  AlertCircle,
  RefreshCw,
  X,
  Plus,
  Eye
} from "lucide-react";
import { useEffect, useState } from "react";

import { adminRepository } from "../../../data/api/admin/adminRepository";
import { subscriptionsRepository } from "../../../data/api/subscriptions/subscriptionsRepository";

import ConfirmationDialog from "@shared/components/ConfirmationDialog";
import { SkeletonTable } from "@shared/components/Skeleton";
import { useToast } from "@shared/components/Toast";

export default function AdminSubscriptions() {
  const [payments, setPayments] = useState([]);
  const [plans, setPlans] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const toast = useToast();

  // Manual Activation Form State
  const [showManualModal, setShowManualModal] = useState(false);
  const [manualUserId, setManualUserId] = useState("");
  const [manualPlanId, setManualPlanId] = useState("");
  const [manualDuration, setManualDuration] = useState("30");
  const [manualSubmitting, setManualSubmitting] = useState(false);

  // Image Preview Modal
  const [previewImage, setPreviewImage] = useState(null);

  // Confirmation States
  const [pendingApprovalPaymentId, setPendingApprovalPaymentId] = useState(null);
  const [pendingCancelSubId, setPendingCancelSubId] = useState(null);

  const fetchSubscriptionsData = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Fetch payments list (contains user, subscription link, screenshot ref)
      const payResponse = await adminRepository.getPayments();
      const payList = payResponse?.data?.results || payResponse?.results || payResponse?.data || payResponse || [];
      setPayments(payList);

      // 2. Fetch plans for manual activation form
      const plansResponse = await subscriptionsRepository.getPlans();
      const planList = plansResponse?.data || plansResponse || [];
      setPlans(planList);

      // 3. Fetch users list for selection in form
      const usersResponse = await adminRepository.getUsers({ role: "USER" });
      const userList = usersResponse?.data?.results || usersResponse?.results || usersResponse?.data || usersResponse || [];
      setUsers(userList);
    } catch (err) {
      console.error(err);
      setError("Failed to compile subscription database logs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptionsData();
  }, []);

  const triggerApprovePayment = (paymentId) => {
    setPendingApprovalPaymentId(paymentId);
  };

  const executeApprovePayment = async () => {
    if (!pendingApprovalPaymentId) return;
    const paymentId = pendingApprovalPaymentId;
    setPendingApprovalPaymentId(null);
    try {
      await adminRepository.approvePayment(paymentId);
      setPayments(prev => prev.map(p => p.id === paymentId ? { ...p, payment_status: "SUCCESS" } : p));
      toast.success("Payment proof verified and subscription activated successfully!");
    } catch (err) {
      toast.error("Failed to approve payment: " + (err?.body?.detail || err?.message));
    }
  };

  const triggerCancelSub = (subId) => {
    setPendingCancelSubId(subId);
  };

  const executeCancelSub = async () => {
    if (!pendingCancelSubId) return;
    const subId = pendingCancelSubId;
    setPendingCancelSubId(null);
    try {
      await adminRepository.cancelSubscription(subId);
      fetchSubscriptionsData();
      toast.success("Subscription deactivated and revoked.");
    } catch (err) {
      console.error(err);
      toast.error("Failed to cancel subscription.");
    }
  };

  const handleManualActivate = async (e) => {
    e.preventDefault();
    if (!manualUserId || !manualPlanId) {
      toast.warning("Please select a user and plan.");
      return;
    }
    setManualSubmitting(true);
    try {
      await adminRepository.manualActivateSubscription({
        user_id: manualUserId,
        plan_id: manualPlanId,
        duration_days: parseInt(manualDuration)
      });
      setShowManualModal(false);
      setManualUserId("");
      setManualPlanId("");
      fetchSubscriptionsData();
      toast.success("Subscription manually activated successfully!");
    } catch (err) {
      toast.error("Activation failed: " + (err?.body?.detail || err?.message));
    } finally {
      setManualSubmitting(false);
    }
  };

  return (
    <div className="p-8 space-y-8 pt-24">
      {/* Title */}
      <div className="flex items-center justify-between border-b border-white/5 pb-5">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tight">Subscriptions & Billing</h1>
          <p className="text-xs text-gray-500 uppercase tracking-widest mt-1">Review transfer screenshots, approve memberships, and manually override quotas</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowManualModal(true)}
            className="px-4 py-2.5 bg-orange-500 hover:bg-orange-400 text-black font-black uppercase text-xs rounded-xl transition flex items-center gap-2"
          >
            <Plus size={14} /> Manual Override
          </button>
          <button
            onClick={fetchSubscriptionsData}
            className="p-3 bg-white/5 hover:bg-white/10 rounded-xl transition border border-white/5 text-gray-400"
          >
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {/* Main List */}
      {loading ? (
        <SkeletonTable rows={5} cols={7} />
      ) : error ? (
        <div className="bg-red-500/10 border border-red-500/30 p-6 rounded-2xl flex items-center gap-3 text-red-400 text-sm">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      ) : payments.length === 0 ? (
        <div className="bg-white/[0.02] border border-white/5 p-16 rounded-3xl text-center text-gray-500 text-sm">
          No billing transactions found. Users will see packages pricing under standard homepage view.
        </div>
      ) : (
        <div className="bg-[#111] border border-white/5 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/5 bg-black/40 text-gray-500 font-bold uppercase tracking-wider">
                  <th className="p-4">Subscriber</th>
                  <th className="p-4">Plan Name</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Method & Reference</th>
                  <th className="p-4">Screenshot Proof</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => {
                  const subStatus = p.subscription?.status;
                  return (
                    <tr key={p.id} className="border-b border-white/5 hover:bg-white/[0.01] transition">
                      <td className="p-4 font-bold text-white">
                        {p.user?.username || "Guest"}
                        <span className="block text-[10px] text-gray-500 font-normal">{p.user?.email}</span>
                      </td>
                      <td className="p-4 font-semibold text-gray-200">
                        {p.subscription?.plan?.name || "Tier Log"}
                      </td>
                      <td className="p-4 font-black text-orange-500">
                        {Math.round(p.amount)} {p.currency}
                      </td>
                      <td className="p-4 text-gray-300">
                        <span className="block font-bold text-[10px] text-gray-500 uppercase">{p.payment_method}</span>
                        <span className="font-mono text-xs">{p.reference_number || "N/A"}</span>
                      </td>
                      <td className="p-4">
                        {p.proof_image ? (
                          <button
                            onClick={() => setPreviewImage(p.proof_image)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-gray-300 transition text-[10px] font-bold uppercase"
                          >
                            <Eye size={12} /> View Receipt
                          </button>
                        ) : (
                          <span className="text-gray-600 font-bold uppercase text-[9px]">No attachment</span>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="space-y-1">
                          <span className={`px-2.5 py-0.5 rounded-full font-bold text-[9px] uppercase inline-block ${
                            p.payment_status === 'SUCCESS' ? "bg-green-500/10 text-green-400 border border-green-500/20" :
                            p.payment_status === 'PENDING' ? "bg-orange-500/10 text-orange-400 border border-orange-500/20 animate-pulse" :
                            "bg-red-500/10 text-red-400 border border-red-500/20"
                          }`}>
                            Pay: {p.payment_status}
                          </span>
                          {p.subscription && (
                            <span className="block text-[9px] text-gray-500 font-medium">
                              Sub: <span className="text-gray-300 uppercase font-bold">{subStatus}</span>
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {p.payment_status === 'PENDING' && (
                            <button
                              onClick={() => triggerApprovePayment(p.id)}
                              className="px-2.5 py-1.5 bg-green-500 hover:bg-green-400 text-black font-black uppercase text-[10px] rounded-lg transition"
                            >
                              Approve
                            </button>
                          )}
                          
                          {p.subscription && subStatus === 'ACTIVE' && (
                            <button
                              onClick={() => triggerCancelSub(p.subscription.id)}
                              className="px-2.5 py-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 font-black uppercase text-[10px] rounded-lg transition"
                            >
                              Cancel Sub
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= MANUAL ACTIVATION MODAL ================= */}
      <AnimatePresence>
        {showManualModal && (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-[98] p-4">
            <motion.div
              className="bg-[#111] border border-gray-800 max-w-md w-full p-8 rounded-3xl overflow-hidden shadow-2xl relative space-y-6"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
            >
              <button
                onClick={() => setShowManualModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white p-2 rounded-xl transition"
              >
                <X size={18} />
              </button>

              <h3 className="text-2xl font-black uppercase tracking-tight flex items-center gap-3">
                <CreditCard className="text-orange-500" /> Manual Override Activation
              </h3>

              <form onSubmit={handleManualActivate} className="space-y-4">
                {/* Select User */}
                <div className="space-y-1.5">
                  <span className="block text-[10px] font-black text-gray-500 uppercase">Target Subscriber</span>
                  <select
                    value={manualUserId}
                    onChange={(e) => setManualUserId(e.target.value)}
                    className="w-full p-3 bg-black border border-gray-800 rounded-xl text-xs outline-none focus:border-orange-500 transition text-gray-300"
                    required
                  >
                    <option value="">-- Choose User --</option>
                    {users.map(u => (
                      <option key={u.id} value={u.id}>{u.username} ({u.email})</option>
                    ))}
                  </select>
                </div>

                {/* Select Plan */}
                <div className="space-y-1.5">
                  <span className="block text-[10px] font-black text-gray-500 uppercase">Membership Tier Plan</span>
                  <select
                    value={manualPlanId}
                    onChange={(e) => setManualPlanId(e.target.value)}
                    className="w-full p-3 bg-black border border-gray-800 rounded-xl text-xs outline-none focus:border-orange-500 transition text-gray-300"
                    required
                  >
                    <option value="">-- Choose Plan Tiers --</option>
                    {plans.map(p => (
                      <option key={p.id} value={p.id}>{p.name} (${Math.round(p.price)})</option>
                    ))}
                  </select>
                </div>

                {/* Duration */}
                <div className="space-y-1.5">
                  <span className="block text-[10px] font-black text-gray-500 uppercase">Custom Duration (Days)</span>
                  <input
                    type="number"
                    value={manualDuration}
                    onChange={(e) => setManualDuration(e.target.value)}
                    className="w-full p-3 bg-black border border-gray-800 rounded-xl text-xs outline-none focus:border-orange-500 transition text-gray-300"
                    required
                    min={1}
                  />
                </div>

                <button
                  type="submit"
                  disabled={manualSubmitting || !manualUserId || !manualPlanId}
                  className="w-full py-4 bg-orange-500 hover:bg-orange-400 text-black font-black uppercase text-xs rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {manualSubmitting ? <RefreshCw size={14} className="animate-spin" /> : "Activate Membership"}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ================= IMAGE PREVIEW MODAL ================= */}
      <AnimatePresence>
        {previewImage && (
          <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-[99] p-4">
            <button
              type="button"
              onClick={() => setPreviewImage(null)}
              className="absolute inset-0 bg-transparent cursor-zoom-out w-full h-full border-none outline-none"
              aria-label="Close preview"
            />
            <div className="relative max-h-[85vh] max-w-[90vw] z-10 flex flex-col items-center">
              <button
                type="button"
                onClick={() => setPreviewImage(null)}
                className="absolute -top-16 right-0 p-3 bg-white/5 border border-white/10 text-white rounded-full hover:bg-white/10 transition"
              >
                <X size={20} />
              </button>
              <img
                src={previewImage}
                alt="Instapay payment verification screenshot receipt"
                className="rounded-xl border border-white/10 shadow-2xl object-contain max-h-[75vh]"
              />
            </div>
          </div>
        )}
      </AnimatePresence>

      <ConfirmationDialog
        isOpen={pendingApprovalPaymentId !== null}
        title="Approve Subscription Payment"
        message="Verify payment proof receipt. Approving will immediately ACTIVATE this user's subscription and grant feature access."
        confirmLabel="Approve"
        cancelLabel="Dismiss"
        onConfirm={executeApprovePayment}
        onCancel={() => setPendingApprovalPaymentId(null)}
        isDanger={false}
      />

      <ConfirmationDialog
        isOpen={pendingCancelSubId !== null}
        title="Cancel Active Subscription"
        message="Are you sure you want to CANCEL this membership? The user will lose access to all premium features and quotas immediately."
        confirmLabel="Cancel Membership"
        cancelLabel="Keep Active"
        onConfirm={executeCancelSub}
        onCancel={() => setPendingCancelSubId(null)}
        isDanger={true}
      />
    </div>
  );
}
