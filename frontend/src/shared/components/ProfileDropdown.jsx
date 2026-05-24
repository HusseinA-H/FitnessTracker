import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";

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

export default function ProfileDropdown({ user, onLogout }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const ref = useRef(null);
  const btnRef = useRef(null);

  const isMobile = useIsMobile();

  const username =
    user?.displayName?.trim() || user?.email?.split("@")[0] || "User";

  // ✅ close on outside + ESC
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!open) return;
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };

    const handleEsc = (e) => {
      if (e.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [open]);

  // ✅ lock body scroll on mobile when dropdown open
  useEffect(() => {
    if (!isMobile) return;
    if (!open) return;

    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open, isMobile]);

  const handleLogout = async () => {
    try {
      await onLogout?.();
    } finally {
      setOpen(false);

      // ✅ 1) Feedback page
      navigate("/feedback", { replace: true });

      // ✅ 2) Then Home
      setTimeout(() => {
        navigate("/", { replace: true });
      }, 2000);
    }
  };

  // ✅ compute portal position (anchored to the button)
  const [pos, setPos] = useState({ top: 0, right: 0, width: 240 });

  useLayoutEffect(() => {
    if (!open || !isMobile) return;

    const btn = btnRef.current;
    if (!btn) return;

    const rect = btn.getBoundingClientRect();
    const width = 240; // same as w-60
    const padding = 12;

    const right = Math.max(padding, window.innerWidth - (rect.right + padding));
    const top = rect.bottom + 12;

    setPos({ top, right, width });
  }, [open, isMobile]);

  const dropdownContent = (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.95 }}
      transition={{ duration: 0.25 }}
      className="w-60 rounded-2xl
                 bg-white/5 backdrop-blur-2xl
                 border border-white/10
                 shadow-[0_0_40px_rgba(255,107,0,0.15)]
                 p-4 space-y-2"
    >
      <div className="text-xs text-gray-500 px-2">Logged in as</div>

      <div className="px-2 pb-3 text-orange-500 font-semibold tracking-wide border-b border-white/10 break-words">
        {username}
      </div>

      <DropdownItem
        label="Settings"
        onClick={() => {
          navigate("/settings");
          setOpen(false);
        }}
      />

      <DropdownItem
        label="Support"
        onClick={() => {
          navigate("/contact");
          setOpen(false);
        }}
      />

      <DropdownItem
        label="Give Feedback"
        onClick={() => {
          navigate("/feedback");
          setOpen(false);
        }}
      />

      <div className="border-t border-white/10 my-2" />

      <DropdownItem label="Logout" danger onClick={handleLogout} />
    </motion.div>
  );

  return (
    <div className="relative" ref={ref}>
      <button
        ref={btnRef}
        onClick={() => setOpen((v) => !v)}
        className="group relative font-semibold tracking-[0.18em] uppercase"
      >
        <span className="text-orange-500 drop-shadow-[0_0_10px_rgba(255,107,0,0.9)] transition group-hover:drop-shadow-[0_0_18px_rgba(255,107,0,1)]">
          {username}
        </span>

        <span className="absolute left-0 -bottom-1 h-[2px] w-0 bg-orange-500 transition-all duration-300 group-hover:w-full" />

        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.25 }}
          className="inline-block ml-2 text-orange-400"
        >
          ▼
        </motion.span>
      </button>

      {/* ✅ Desktop: no portal */}
      <AnimatePresence>
        {open && !isMobile && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            className="absolute right-0 mt-5 z-50"
          >
            {dropdownContent}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ✅ Mobile: Portal (fix stacking/blur issues) */}
      {isMobile &&
        createPortal(
          <AnimatePresence>
            {open && (
              <>
                <motion.div
                  className="fixed inset-0 z-[9998] bg-black/60"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onMouseDown={() => setOpen(false)}
                />

                <motion.div
                  className="fixed z-[9999]"
                  style={{ top: pos.top, right: pos.right }}
                  initial={{ opacity: 0, y: 10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                  onMouseDown={(e) => e.stopPropagation()}
                >
                  {dropdownContent}
                </motion.div>
              </>
            )}
          </AnimatePresence>,
          document.body
        )}
    </div>
  );
}

function DropdownItem({ label, onClick, danger }) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-3 py-2 rounded-lg transition-all duration-200
        ${
          danger
            ? "text-red-400 hover:bg-red-500/10 hover:text-red-500"
            : "text-gray-300 hover:bg-orange-500/10 hover:text-orange-500"
        }`}
    >
      {label}
    </button>
  );
}