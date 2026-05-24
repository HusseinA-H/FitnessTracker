import { AnimatePresence } from "framer-motion";
import { lazy, Suspense } from "react";
import { Route, Routes, useLocation } from "react-router-dom";

import AnimatedPage from "@app/layout/AnimatedPage";
import ProtectedRoute from "@app/routes/ProtectedRoute";

const Home = lazy(() => import("@features/home/pages/Home"));
const UserHome = lazy(() => import("@features/home/pages/UserHome"));

const Contact = lazy(() => import("@features/contact/pages/Contact"));
const CalorieCalculator = lazy(() =>
  import("@features/calories/pages/CalorieCalculator")
);
const Feedback = lazy(() => import("@features/feedback/pages/Feedback"));

const Dashboard = lazy(() => import("@features/dashboard/pages/Dashboard"));
const Workouts = lazy(() => import("@features/workouts/pages/Workouts"));
const Progress = lazy(() => import("@features/progress/pages/Progress"));
const PremiumTracker = lazy(() =>
  import("@features/tracker/pages/PremiumTracker")
);
const Settings = lazy(() => import("@features/settings/pages/Settings"));

// AI pages lazy loaded
const AICoach = lazy(() => import("@features/dashboard/pages/AICoach"));
const AIChat = lazy(() => import("@features/dashboard/pages/AIChat"));
const AINutrition = lazy(() => import("@features/dashboard/pages/AINutrition"));

// Admin lazy loaded
const AdminLayout = lazy(() => import("@features/admin/components/AdminLayout"));
const AdminDashboard = lazy(() => import("@features/admin/pages/AdminDashboard"));
const AdminUsers = lazy(() => import("@features/admin/pages/AdminUsers"));
const AdminSubscriptions = lazy(() => import("@features/admin/pages/AdminSubscriptions"));
const AdminPlans = lazy(() => import("@features/admin/pages/AdminPlans"));
const AdminWorkouts = lazy(() => import("@features/admin/pages/AdminWorkouts"));
const AdminNutrition = lazy(() => import("@features/admin/pages/AdminNutrition"));
const AdminAIUsage = lazy(() => import("@features/admin/pages/AdminAIUsage"));
const AdminContent = lazy(() => import("@features/admin/pages/AdminContent"));

export default function AppRoutes({ user }) {
  const location = useLocation();

  return (
    <Suspense fallback={null}>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          {/* Public */}
          <Route
            path="/"
            element={
              <AnimatedPage>{user ? <UserHome /> : <Home />}</AnimatedPage>
            }
          />

          <Route
            path="/contact"
            element={
              <AnimatedPage>
                <Contact />
              </AnimatedPage>
            }
          />

          <Route
            path="/calories"
            element={
              <AnimatedPage>
                <CalorieCalculator />
              </AnimatedPage>
            }
          />

          <Route
            path="/feedback"
            element={
              <AnimatedPage>
                <Feedback />
              </AnimatedPage>
            }
          />

          {/* ✅ Tracker Public + force remount on auth change */}
          <Route
            path="/tracker"
            element={
              <AnimatedPage>
                <PremiumTracker key={user ? "auth" : "guest"} />
              </AnimatedPage>
            }
          />

          {/* Protected */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute redirectTo="/">
                <AnimatedPage>
                  <Dashboard />
                </AnimatedPage>
              </ProtectedRoute>
            }
          />

          <Route
            path="/workouts"
            element={
              <ProtectedRoute redirectTo="/">
                <AnimatedPage>
                  <Workouts />
                </AnimatedPage>
              </ProtectedRoute>
            }
          />

          <Route
            path="/progress"
            element={
              <ProtectedRoute redirectTo="/">
                <AnimatedPage>
                  <Progress />
                </AnimatedPage>
              </ProtectedRoute>
            }
          />

          <Route
            path="/settings"
            element={
              <ProtectedRoute redirectTo="/">
                <AnimatedPage>
                  <Settings />
                </AnimatedPage>
              </ProtectedRoute>
            }
          />

          {/* AI Features (Protected & Gated by Subscriptions) */}
          <Route
            path="/ai/coach"
            element={
              <ProtectedRoute requiredFeature="ai_limit" redirectTo="/">
                <AnimatedPage>
                  <AICoach />
                </AnimatedPage>
              </ProtectedRoute>
            }
          />

          <Route
            path="/ai/chat"
            element={
              <ProtectedRoute requiredFeature="ai_limit" redirectTo="/">
                <AnimatedPage>
                  <AIChat />
                </AnimatedPage>
              </ProtectedRoute>
            }
          />

          <Route
            path="/ai/nutrition"
            element={
              <ProtectedRoute requiredFeature="ai_limit" redirectTo="/">
                <AnimatedPage>
                  <AINutrition />
                </AnimatedPage>
              </ProtectedRoute>
            }
          />

          {/* Admin Command Portal */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="subscriptions" element={<AdminSubscriptions />} />
            <Route path="plans" element={<AdminPlans />} />
            <Route path="workouts" element={<AdminWorkouts />} />
            <Route path="nutrition" element={<AdminNutrition />} />
            <Route path="ai" element={<AdminAIUsage />} />
            <Route path="content" element={<AdminContent />} />
          </Route>
        </Routes>
      </AnimatePresence>
    </Suspense>
  );
}