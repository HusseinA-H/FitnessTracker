import { Lock } from "lucide-react";
import { Navigate, Link } from "react-router-dom";

import { useAuth } from "@features/auth";

export default function ProtectedRoute({ children, requiredFeature = null, redirectTo = "/" }) {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (!user) return <Navigate to={redirectTo} replace />;

  // Admin always bypasses subscription gates
  if (user.role === "ADMIN") {
    return children;
  }

  // Feature gate check
  if (requiredFeature) {
    const features = user.subscription?.features || {};
    const hasFeature = 
      features[requiredFeature] === true || 
      (typeof features[requiredFeature] === "number" && features[requiredFeature] !== 0) ||
      features.feature_flags?.[requiredFeature] === true;

    if (!hasFeature) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] text-white p-6 relative overflow-hidden">
          {/* Background decor */}
          <div className="absolute top-[-10%] right-[-10%] w-[300px] h-[300px] bg-orange-500/10 blur-[100px] rounded-full" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[300px] h-[300px] bg-orange-600/5 blur-[100px] rounded-full" />

          <div className="relative z-10 max-w-md w-full bg-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur-2xl text-center shadow-[0_0_50px_rgba(255,107,0,0.15)] space-y-6">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-500 animate-pulse">
              <Lock size={32} />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-black uppercase tracking-tight">
                Premium Feature Locked
              </h2>
              <p className="text-gray-400 text-sm leading-relaxed">
                Access to this feature is restricted to our active Premium and Elite tier subscribers. 
                Unlock AI FitCoach, workout recommendations, and meal plans now.
              </p>
            </div>

            <div className="border-t border-white/5 pt-4 flex flex-col gap-3">
              <Link
                to="/"
                className="py-3 px-6 bg-orange-500 text-black font-black uppercase rounded-xl hover:bg-orange-400 transition text-sm text-center"
              >
                Upgrade Subscription
              </Link>
              <Link
                to="/dashboard"
                className="py-3 px-6 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 font-bold uppercase rounded-xl transition text-sm text-center"
              >
                Return to Dashboard
              </Link>
            </div>
          </div>
        </div>
      );
    }
  }

  return children;
}
