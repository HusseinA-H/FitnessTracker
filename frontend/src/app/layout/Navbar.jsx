import { AnimatePresence, motion } from "framer-motion";
import { Menu, X, Bell } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

import { notificationsRepository } from "@/data/api/notifications/notificationsRepository";
import logo from "@shared/assets/logo.png";
import ProfileDropdown from "@shared/components/ProfileDropdown";

function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let active = true;
    const fetchNotifications = async () => {
      try {
        const response = await notificationsRepository.getNotifications();
        if (active) {
          setNotifications(response?.data || response || []);
        }
      } catch (e) {
        console.warn("Failed to fetch notifications:", e);
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 20000); // Poll every 20s
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const handleMarkAllRead = async () => {
    try {
      await notificationsRepository.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch (e) {
      console.warn(e);
    }
  };

  const handleRead = async (id) => {
    try {
      await notificationsRepository.markAsRead(id);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
    } catch (e) {
      console.warn(e);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 text-gray-400 hover:text-orange-500 transition rounded-xl hover:bg-white/5"
        aria-label="Notifications"
        type="button"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-orange-500 rounded-full ring-2 ring-black" />
        )}
      </button>

      <AnimatePresence>
        {open && (
          <>
            <button
              type="button"
              className="fixed inset-0 z-40 w-full h-full cursor-default bg-transparent"
              onClick={() => setOpen(false)}
              aria-label="Close notifications"
            />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute right-0 mt-2 w-72 rounded-2xl bg-[#111] border border-gray-800 p-4 shadow-[0_0_35px_rgba(0,0,0,0.5)] z-50 space-y-3"
            >
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <span className="text-xs font-black uppercase text-gray-400">Notifications</span>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-[10px] uppercase font-black text-orange-500 hover:underline animate-pulse"
                  >
                    Mark read
                  </button>
                )}
              </div>

              <div className="max-h-60 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                {notifications.length === 0 ? (
                  <div className="text-center py-6 text-xs text-gray-500 font-medium">No alerts yet.</div>
                ) : (
                  notifications.map((n) => (
                    <button
                      type="button"
                      key={n.id}
                      onClick={() => handleRead(n.id)}
                      className={`w-full p-2.5 rounded-xl border text-left cursor-pointer transition block ${
                        n.is_read
                          ? "bg-transparent border-transparent text-gray-500"
                          : "bg-white/5 border-white/5 text-gray-200 hover:border-orange-500/20"
                      }`}
                    >
                      <div className="text-xs font-bold">{n.title}</div>
                      <div className="text-[10px] mt-0.5 leading-normal">{n.message}</div>
                    </button>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Navbar({ user, logout, onToggleSidebar, onOpenModal }) {
  const location = useLocation();
  const [guestDrawerOpen, setGuestDrawerOpen] = useState(false);

  const guestNav = [
    { label: "Home", path: "/" },
    { label: "Contact", path: "/contact" },
    { label: "Calorie Calculator", path: "/calories" },
    { label: "Fitness Tracker", path: "/tracker" },
  ];

  // ✅ close guest drawer on route change
  useEffect(() => {
    const t = setTimeout(() => {
      setGuestDrawerOpen(false);
    }, 0);

    return () => clearTimeout(t);
  }, [location.pathname]);

  // ✅ close on ESC
  useEffect(() => {
    if (!guestDrawerOpen) return;
    const onKey = (e) => {
      if (e.key === "Escape") setGuestDrawerOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [guestDrawerOpen]);

  function DesktopNavItem({ label, path }) {
    const isActive = location.pathname === path;

    return (
      <Link to={path} className="relative px-4 py-2 font-medium">
        <motion.div
          aria-hidden="true"
          initial={false}
          animate={{
            opacity: isActive ? 1 : 0,
            scale: isActive ? 1 : 0.985,
            filter: isActive ? "blur(0px)" : "blur(2px)",
          }}
          transition={{
            type: "spring",
            stiffness: 520,
            damping: 38,
            mass: 0.6,
          }}
          className="absolute inset-0 rounded-full bg-orange-500/20 border border-orange-500/40"
        />

        <motion.div
          aria-hidden="true"
          initial={false}
          animate={{ opacity: isActive ? 0.65 : 0 }}
          transition={{ duration: 0.18 }}
          className="absolute inset-0 rounded-full shadow-[0_0_22px_rgba(255,107,0,0.35)]"
        />

        <motion.span
          initial={false}
          whileHover={{ y: -1 }}
          transition={{ duration: 0.12 }}
          className={`relative z-10 ${
            isActive ? "text-orange-500" : "text-gray-400 hover:text-orange-500"
          }`}
        >
          {label}
        </motion.span>
      </Link>
    );
  }

  return (
    <>
      <nav className="sticky top-0 z-50 flex items-center justify-between px-4 md:px-8 py-4 md:py-5 border-b border-gray-800 backdrop-blur-xl bg-black/70 isolation-isolate">
        <div className="flex items-center gap-3 md:gap-6">
          {/* ✅ Left button */}
          {user ? (
            <button
              onClick={onToggleSidebar}
              className="text-gray-300 hover:text-orange-500 transition"
              aria-label="Toggle sidebar"
              type="button"
            >
              <Menu size={28} />
            </button>
          ) : (
            <>
              {/* ✅ Guest: Mobile drawer button */}
              <button
                onClick={() => setGuestDrawerOpen(true)}
                className="md:hidden text-gray-300 hover:text-orange-500 transition"
                aria-label="Open menu"
                type="button"
              >
                <Menu size={28} />
              </button>

              {/* ✅ Guest: Desktop nav */}
              <div className="hidden md:flex space-x-4">
                {guestNav.map((item) => (
                  <DesktopNavItem key={item.label} {...item} />
                ))}
              </div>
            </>
          )}
        </div>

        {/* ✅ Center logo */}
        <Link to="/" aria-label="Go home" className="shrink-0">
          <img src={logo} alt="logo" className="h-10 md:h-14" />
        </Link>

        {/* ✅ Right actions */}
        <div className="flex items-center gap-3 md:gap-6">
          {!user ? (
            <>
              {/* Desktop buttons */}
              <button
                onClick={() => onOpenModal("signup")}
                className="hidden md:inline-flex px-6 py-2 bg-orange-500 text-black rounded-full font-bold"
                type="button"
              >
                Start Your Journey
              </button>

              <button
                onClick={() => onOpenModal("signin")}
                className="hidden md:inline-flex text-gray-300 hover:text-orange-500 transition"
                type="button"
              >
                Sign In
              </button>

              {/* Mobile: compact */}
              <button
                onClick={() => onOpenModal("signin")}
                className="md:hidden px-4 py-2 rounded-full bg-orange-500 text-black font-bold"
                type="button"
              >
                Sign In
              </button>
            </>
          ) : (
            <div className="flex items-center gap-4">
              <NotificationBell />
              <ProfileDropdown user={user} onLogout={logout} />
            </div>
          )}
        </div>
      </nav>

      {/* ✅ Guest Mobile Drawer (Sidebar-like) */}
      <AnimatePresence>
        {!user && guestDrawerOpen && (
          <>
            {/* Overlay */}
            <motion.div
              className="fixed inset-0 z-[9998] bg-black/60 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onMouseDown={() => setGuestDrawerOpen(false)}
            />

            {/* Drawer */}
            <motion.aside
              className="
                fixed top-0 left-0 h-full w-[280px]
                z-[9999]
                bg-[#0f0f0f]/95 backdrop-blur-2xl
                border-r border-white/10
                flex flex-col
              "
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: "spring", stiffness: 260, damping: 30 }}
              onMouseDown={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-5 border-b border-white/10">
                <div className="text-orange-500 font-bold tracking-wide">
                  Menu
                </div>

                <button
                  onClick={() => setGuestDrawerOpen(false)}
                  className="text-gray-300 hover:text-orange-500 transition p-2 rounded-xl hover:bg-white/5"
                  aria-label="Close menu"
                  type="button"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Links */}
              <div className="px-3 py-4 flex flex-col gap-2">
                {guestNav.map((item) => {
                  const active = location.pathname === item.path;

                  return (
                    <Link
                      key={item.label}
                      to={item.path}
                      className={`px-4 py-3 rounded-2xl border transition ${
                        active
                          ? "bg-orange-500/15 text-orange-500 border-orange-500/25"
                          : "bg-white/5 text-gray-200 border-white/10 hover:border-orange-500/25 hover:text-orange-500"
                      }`}
                      onClick={() => setGuestDrawerOpen(false)}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </div>

              {/* Actions */}
              <div className="mt-auto p-4 border-t border-white/10">
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setGuestDrawerOpen(false);
                      onOpenModal("signup");
                    }}
                    className="flex-1 px-4 py-3 rounded-2xl bg-orange-500 text-black font-bold"
                    type="button"
                  >
                    Start
                  </button>

                  <button
                    onClick={() => {
                      setGuestDrawerOpen(false);
                      onOpenModal("signin");
                    }}
                    className="flex-1 px-4 py-3 rounded-2xl bg-white/10 border border-white/10 text-gray-200 font-bold hover:border-orange-500/30 hover:text-orange-500 transition"
                    type="button"
                  >
                    Sign In
                  </button>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}