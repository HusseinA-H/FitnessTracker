import { Navigate, Outlet } from "react-router-dom";

import AdminSidebar from "./AdminSidebar";

import { useAuth } from "@features/auth";

export default function AdminLayout() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400 text-xs uppercase tracking-widest">
            Verifying Admin Authorization...
          </p>
        </div>
      </div>
    );
  }

  // Restrict to ADMIN role only
  if (!user || user.role !== "ADMIN") {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex">
      <AdminSidebar />
      <main className="flex-1 pl-64 min-h-screen">
        <Outlet />
      </main>
    </div>
  );
}
