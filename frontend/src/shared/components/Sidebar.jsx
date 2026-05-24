import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  Dumbbell,
  Flame,
  Home as HomeIcon,
  LayoutDashboard,
  LineChart,
  PanelLeftClose,
  PanelLeftOpen,
  X,
  Brain,
  MessageSquare,
  Apple,
  Settings,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";

const ITEMS = [
  { label: "Home", path: "/", Icon: HomeIcon },
  { label: "Dashboard", path: "/dashboard", Icon: LayoutDashboard },
  { label: "Workouts", path: "/workouts", Icon: Dumbbell },
  { label: "Progress", path: "/progress", Icon: LineChart },
  { label: "Tracker", path: "/tracker", Icon: Activity },
  { label: "Calories", path: "/calories", Icon: Flame },
  { label: "AI Coach", path: "/ai/coach", Icon: Brain },
  { label: "AI Chat", path: "/ai/chat", Icon: MessageSquare },
  { label: "AI Nutrition", path: "/ai/nutrition", Icon: Apple },
];

function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window === "undefined" ? false : window.innerWidth < breakpoint
  );

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < breakpoint);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [breakpoint]);

  return isMobile;
}

export default function Sidebar({ open, setOpen, user }) {
  const location = useLocation();
  const isMobile = useIsMobile();

  // ✅ Desktop: allow collapse/expand (saved)
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("sidebar_collapsed_v1") || "false");
    } catch {
      return false;
    }
  });

  useEffect(() => {
    localStorage.setItem("sidebar_collapsed_v1", JSON.stringify(collapsed));
  }, [collapsed]);

  // ✅ Close on ESC
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, setOpen]);

  // ✅ Lock scroll on mobile when sidebar open
  useEffect(() => {
    if (!isMobile) return;
    if (!open) return;

    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open, isMobile]);

  const width = useMemo(() => {
    if (isMobile) return 280;
    return collapsed ? 92 : 260;
  }, [collapsed, isMobile]);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Overlay (mobile + optional desktop) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onMouseDown={() => setOpen(false)}
            className="fixed inset-0 bg-black/55 backdrop-blur-sm z-[80]"
          />

          {/* Sidebar */}
          <motion.aside
            initial={{ x: -width }}
            animate={{ x: 0 }}
            exit={{ x: -width }}
            transition={{ type: "spring", stiffness: 260, damping: 30 }}
            style={{ width }}
            className="
              fixed top-0 left-0 h-full
              bg-[#0f0f0f]/90 backdrop-blur-2xl
              border-r border-white/10
              z-[90] flex flex-col
              isolation-isolate
            "
            onMouseDown={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-5 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-2xl bg-orange-500/15 border border-orange-500/25 flex items-center justify-center">
                  <Flame size={18} className="text-orange-500" />
                </div>

                {!collapsed && !isMobile && (
                  <div className="leading-tight">
                    <div className="text-sm font-bold text-white tracking-wide">
                      Fitness
                    </div>
                    <div className="text-[11px] text-gray-500">
                      Quick Navigation
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                {/* Desktop collapse toggle */}
                {!isMobile && (
                  <button
                    onClick={() => setCollapsed((v) => !v)}
                    className="text-gray-400 hover:text-orange-500 transition p-2 rounded-xl hover:bg-white/5"
                    aria-label="Toggle collapse"
                    type="button"
                  >
                    {collapsed ? (
                      <PanelLeftOpen size={18} />
                    ) : (
                      <PanelLeftClose size={18} />
                    )}
                  </button>
                )}

                {/* Close button (mobile mainly) */}
                <button
                  onClick={() => setOpen(false)}
                  className="text-gray-400 hover:text-orange-500 transition p-2 rounded-xl hover:bg-white/5"
                  aria-label="Close sidebar"
                  type="button"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Items */}
            <nav className="flex-1 px-3 py-4 space-y-2 overflow-y-auto">
              {ITEMS.map(({ label, path, Icon }) => {
                const active = location.pathname === path;

                return (
                  <Link
                    key={path}
                    to={path}
                    onClick={() => setOpen(false)}
                    className="block group"
                  >
                    <motion.div
                      whileHover={{ x: collapsed && !isMobile ? 0 : 4 }}
                      whileTap={{ scale: 0.98 }}
                      className={`
                        relative flex items-center gap-3
                        ${collapsed && !isMobile ? "justify-center" : ""}
                        px-3 py-3 rounded-2xl transition
                        ${
                          active
                            ? "bg-orange-500/15 text-orange-500 border border-orange-500/25 shadow-[0_0_18px_rgba(255,107,0,0.18)]"
                            : "text-gray-300 hover:text-orange-500 hover:bg-white/5 border border-transparent"
                        }
                      `}
                    >
                      {/* Active bar */}
                      {active && (
                        <motion.div
                          layoutId="side-active"
                          className="absolute left-0 top-2 bottom-2 w-[4px] rounded-r-full bg-orange-500"
                        />
                      )}

                      <Icon size={22} strokeWidth={2.5} />

                      {/* Label (hidden when collapsed on desktop) */}
                      {(!collapsed || isMobile) && (
                        <span className="font-semibold tracking-wide text-sm">
                          {label}
                        </span>
                      )}

                      {/* Tooltip when collapsed (desktop only) */}
                      {collapsed && !isMobile && (
                        <div className="pointer-events-none absolute left-[88px] top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition hidden md:block">
                          <div className="px-3 py-2 rounded-xl bg-black/90 border border-white/10 text-sm text-gray-200 whitespace-nowrap shadow-lg">
                            {label}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  </Link>
                );
              })}

              {user?.role === "ADMIN" && (
                <Link
                  to="/admin"
                  onClick={() => setOpen(false)}
                  className="block group mt-6"
                >
                  <motion.div
                    whileHover={{ x: collapsed && !isMobile ? 0 : 4 }}
                    whileTap={{ scale: 0.98 }}
                    className="
                      relative flex items-center gap-3
                      px-3 py-3 rounded-2xl transition
                      bg-red-500/10 text-red-400 border border-red-500/25 shadow-[0_0_18px_rgba(239,68,68,0.18)]
                    "
                  >
                    <Settings size={22} strokeWidth={2.5} />
                    {(!collapsed || isMobile) && (
                      <span className="font-bold tracking-wide text-sm">
                        Admin Panel
                      </span>
                    )}
                  </motion.div>
                </Link>
              )}
            </nav>

            {/* Footer */}
            <div className="px-4 py-4 border-t border-white/10">
              <div
                className={`text-xs text-gray-500 ${
                  collapsed && !isMobile ? "text-center" : ""
                }`}
              >
                {collapsed && !isMobile ? "v1.0" : "Fitness Platform v1.0"}
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}