import { useEffect, useState } from "react";

import ActivityChart from "../components/dashboard/ActivityChart";
import ActivityTimeline from "../components/dashboard/ActivityTimeline";
import AIInsights from "../components/dashboard/AIInsights";
import DashboardHero from "../components/dashboard/DashboardHero";
import Heatmap from "../components/dashboard/Heatmap";
import MotivationStrip from "../components/dashboard/MotivationStrip";
import StatsGrid from "../components/dashboard/StatsGrid";

import { loadWorkouts } from "@/shared/domain/workoutsRepository";
import { dashboardRepository } from "@data/api/dashboard/dashboardRepository";
import { useAuth } from "@features/auth";
import { SkeletonCard, SkeletonLine } from "@shared/components/Skeleton";

export default function Dashboard() {
  const { user } = useAuth();
  const isAuthed = Boolean(user);

  const [workouts, setWorkouts] = useState([]);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const workoutData = await loadWorkouts(isAuthed);
        setWorkouts(workoutData || []);
      } catch (err) {
        console.error("Failed to load workouts:", err);
      }

      if (isAuthed) {
        try {
          const res = await dashboardRepository.getStatsGrid();
          const data = res?.data || res;
          if (data) setDashboardData(data);
        } catch (err) {
          console.error("Failed to load dashboard stats:", err);
        }
      }

      setLoading(false);
    }
    fetchData();
  }, [isAuthed]);

  if (loading) {
    return (
      <div className="min-h-screen px-4 md:px-10 py-10 space-y-16 bg-[#0f0f0f]">
        {/* Hero Section Skeleton */}
        <div className="bg-[#111] border border-white/5 rounded-3xl p-8 space-y-4">
          <SkeletonLine width="w-1/3" height="h-8" />
          <SkeletonLine width="w-2/3" height="h-4" />
        </div>

        {/* Stats Grid Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>

        {/* Chart Skeleton */}
        <div className="bg-[#111] border border-white/5 rounded-3xl p-8 space-y-6">
          <div className="flex justify-between items-center">
            <SkeletonLine width="w-1/4" height="h-6" />
            <SkeletonLine width="w-32" height="h-8" className="rounded-full" />
          </div>
          <div className="h-64 bg-white/[0.02] rounded-2xl animate-pulse flex items-end justify-between p-4">
            <SkeletonLine width="w-12" height="h-24" />
            <SkeletonLine width="w-12" height="h-40" />
            <SkeletonLine width="w-12" height="h-32" />
            <SkeletonLine width="w-12" height="h-48" />
            <SkeletonLine width="w-12" height="h-16" />
            <SkeletonLine width="w-12" height="h-36" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 md:px-10 py-10 space-y-16">
      <DashboardHero workouts={workouts} dashboardData={dashboardData} />

      <StatsGrid workouts={workouts} dashboardData={dashboardData} />

      <ActivityChart workouts={workouts} dashboardData={dashboardData} />

      <Heatmap workouts={workouts} dashboardData={dashboardData} />

      <AIInsights workouts={workouts} />

      <MotivationStrip />

      <ActivityTimeline workouts={workouts} />
    </div>
  );
}