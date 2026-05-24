import { motion } from "framer-motion";
import {
  Users,
  CreditCard,
  Zap,
  Dumbbell,
  Clock,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

import { adminRepository } from "../../../data/api/admin/adminRepository";

import { SkeletonCard, SkeletonLine } from "@shared/components/Skeleton";

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await adminRepository.getAnalytics();
      setData(response?.data || response);
    } catch (err) {
      console.error(err);
      setError("Failed to load dashboard metrics. Check server connectivity.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="p-8 space-y-10 pt-24 bg-[#0f0f0f]">
        {/* Title skeleton */}
        <div className="flex items-center justify-between border-b border-white/5 pb-5">
          <div className="space-y-2">
            <SkeletonLine width="w-48" height="h-8" />
            <SkeletonLine width="w-80" height="h-4" />
          </div>
          <SkeletonLine width="w-10" height="h-10" className="rounded-xl" />
        </div>

        {/* Stats skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>

        {/* Bottom content skeleton */}
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-[#111] border border-white/5 p-6 rounded-2xl space-y-4">
            <SkeletonLine width="w-1/3" height="h-4" />
            <div className="h-64 bg-white/[0.02] rounded-2xl animate-pulse flex items-end justify-between p-4">
              <SkeletonLine width="w-12" height="h-24" />
              <SkeletonLine width="w-12" height="h-40" />
              <SkeletonLine width="w-12" height="h-32" />
              <SkeletonLine width="w-12" height="h-48" />
              <SkeletonLine width="w-12" height="h-16" />
            </div>
          </div>
          <div className="bg-[#111] border border-white/5 p-6 rounded-2xl space-y-4">
            <SkeletonLine width="w-1/2" height="h-4" />
            <div className="space-y-3">
              <div className="p-3 bg-white/[0.02] rounded-xl space-y-2 animate-pulse">
                <SkeletonLine width="w-1/3" height="h-3" />
                <SkeletonLine width="w-2/3" height="h-4" />
              </div>
              <div className="p-3 bg-white/[0.02] rounded-xl space-y-2 animate-pulse">
                <SkeletonLine width="w-1/3" height="h-3" />
                <SkeletonLine width="w-2/3" height="h-4" />
              </div>
              <div className="p-3 bg-white/[0.02] rounded-xl space-y-2 animate-pulse">
                <SkeletonLine width="w-1/3" height="h-3" />
                <SkeletonLine width="w-2/3" height="h-4" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 max-w-4xl mx-auto space-y-4 pt-24">
        <div className="bg-red-500/10 border border-red-500/30 p-6 rounded-2xl flex items-center gap-3 text-red-400">
          <AlertCircle size={24} />
          <span>{error}</span>
        </div>
        <button
          onClick={fetchDashboardData}
          className="px-6 py-3 bg-orange-500 hover:bg-orange-400 text-black font-black uppercase text-xs rounded-xl transition"
        >
          Retry Load
        </button>
      </div>
    );
  }

  const { stats, growth_analytics = [], recent_activity = [] } = data || {};

  const statCards = [
    { label: "Total Platform Users", value: stats?.total_users ?? 0, Icon: Users, color: "text-blue-500" },
    { label: "Active Subscriptions", value: stats?.active_subscriptions ?? 0, Icon: CreditCard, color: "text-green-500" },
    { label: "Pending Approvals", value: stats?.pending_subscriptions ?? 0, Icon: Clock, color: "text-orange-500", highlight: (stats?.pending_subscriptions ?? 0) > 0 },
    { label: "Logged Workouts", value: stats?.total_workouts ?? 0, Icon: Dumbbell, color: "text-purple-500" },
    { label: "Total AI Prompts", value: stats?.total_ai_requests ?? 0, Icon: Zap, color: "text-yellow-500" },
    { label: "Estimated AI Cost", value: `$${(stats?.total_cost ?? 0).toFixed(4)}`, Icon: Zap, color: "text-red-500" },
  ];

  return (
    <div className="p-8 space-y-10 pt-24">
      {/* Title */}
      <div className="flex items-center justify-between border-b border-white/5 pb-5">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tight">SaaS Command Center</h1>
          <p className="text-xs text-gray-500 uppercase tracking-widest mt-1">Platform overview and user growth analytics</p>
        </div>
        <button
          onClick={fetchDashboardData}
          className="p-3 bg-white/5 hover:bg-white/10 rounded-xl transition border border-white/5 text-gray-400 hover:text-white"
          title="Reload metrics"
        >
          <RefreshCw size={16} />
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((card, i) => (
          <motion.div
            key={i}
            whileHover={{ y: -4 }}
            className={`p-6 rounded-2xl border bg-[#111] space-y-4 transition ${
              card.highlight 
                ? "border-orange-500 shadow-[0_0_20px_rgba(255,107,0,0.1)]"
                : "border-white/5"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-gray-500">
                {card.label}
              </span>
              <card.Icon size={18} className={card.color} />
            </div>
            <h2 className="text-3xl font-black italic tracking-tight">{card.value}</h2>
          </motion.div>
        ))}
      </div>

      {/* Chart & Activities */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Growth Chart */}
        <div className="lg:col-span-2 bg-[#111] border border-white/5 p-6 rounded-2xl space-y-4">
          <h3 className="text-xs font-black uppercase tracking-wider text-gray-400">
            User Registration Analytics (Last 30 Days)
          </h3>
          <div className="h-64">
            {growth_analytics.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-gray-500">
                No registration records logged.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={growth_analytics}>
                  <XAxis dataKey="date" stroke="#444" fontSize={10} tickLine={false} />
                  <YAxis stroke="#444" fontSize={10} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#111", border: "1px solid #333", borderRadius: "12px", fontSize: "12px" }}
                  />
                  <Line type="monotone" dataKey="count" stroke="#f97316" strokeWidth={3} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-[#111] border border-white/5 p-6 rounded-2xl space-y-4">
          <h3 className="text-xs font-black uppercase tracking-wider text-gray-400">
            Recent System Activity
          </h3>
          <div className="space-y-3 max-h-64 overflow-y-auto pr-1 custom-scrollbar text-xs">
            {recent_activity.length === 0 ? (
              <div className="text-center py-10 text-gray-600">No recent transactions or log activities.</div>
            ) : (
              recent_activity.map((act, i) => (
                <div key={i} className="p-3 bg-black/40 border border-white/5 rounded-xl flex flex-col gap-1">
                  <div className="flex items-center justify-between text-[9px] uppercase font-bold text-orange-500/80">
                    <span>{act.type}</span>
                    <span className="text-gray-600">{new Date(act.time).toLocaleTimeString()}</span>
                  </div>
                  <p className="text-gray-300 leading-normal">{act.message}</p>
                  <span className="text-[10px] text-gray-500 font-medium">By: {act.user}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
