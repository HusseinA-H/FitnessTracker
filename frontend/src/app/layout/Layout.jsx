import { useEffect, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";

import Footer from "@app/layout/Footer";
import Navbar from "@app/layout/Navbar";
import AppRoutes from "@app/routes/AppRoutes";
import { AuthModal, useAuth } from "@features/auth";
import CustomCursor from "@shared/components/CustomCursor";
import Sidebar from "@shared/components/Sidebar";

export default function Layout() {
  const { user, logout, initializing } = useAuth();

  const [modal, setModal] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [params] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();

  // ✅ open auth modal from query: ?auth=signin / ?auth=signup
  useEffect(() => {
    const authMode = params.get("auth");

    if (authMode === "signin" || authMode === "signup") {
      // ✅ set state async (avoid lint "setState in effect")
      queueMicrotask(() => setModal(authMode));

      // ✅ remove param without leaving page
      const url = new URL(window.location.href);
      url.searchParams.delete("auth");
      navigate(url.pathname + url.search, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.key]);

  // ✅ close sidebar when logout / user disappears
  useEffect(() => {
    if (!user) setSidebarOpen(false);
  }, [user]);

  if (initializing) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] text-white flex items-center justify-center">
        <div className="text-sm text-gray-400">Initializing session...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white">
      <CustomCursor />

      {user && <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} user={user} />}

      <Navbar
        user={user}
        logout={logout}
        onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
        onOpenModal={(type) => setModal(type)}
      />

      <AppRoutes user={user} />

      {modal && <AuthModal type={modal} close={() => setModal(null)} />}

      <Footer />
    </div>
  );
}
