import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

import { normalizeAuthError } from "@shared/auth/authErrors";


export default function AuthModal({ type = "signin", close }) {
  const navigate = useNavigate();
  const { signup, login, authError } = useAuth();

  const isSignup = type === "signup";

  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState("");

  const errorText = useMemo(() => {
    if (localError) return localError;
    if (!authError) return "";
    return normalizeAuthError(authError);
  }, [localError, authError]);

  // ✅ Close on ESC
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [close]);

  // ✅ Lock body scroll while modal is open (mobile polish)
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const redirectToUserHome = () => {
    close();
    navigate("/", { replace: true });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setLocalError("");
    setSubmitting(true);

    try {
      if (isSignup) await signup(form.email, form.password, form.name);
      else await login(form.email, form.password);

      redirectToUserHome();
    } catch (err) {
      setLocalError(normalizeAuthError(err));
    } finally {
      setSubmitting(false);
    }
  };

  const onGoogle = async () => {
    setLocalError("Google sign-in has been removed. Please use email + password.");
    setSubmitting(false);
  };

  // ✅ click outside closes
  const onOverlayMouseDown = () => close();
  const onPanelMouseDown = (e) => e.stopPropagation();

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[9999]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onMouseDown={onOverlayMouseDown}
      >
        {/* overlay */}
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

        {/* wrapper:
            - mobile: bottom sheet
            - md+: centered modal
        */}
        <div className="absolute inset-0 flex items-end md:items-center justify-center px-0 md:px-4">
          <motion.div
            onMouseDown={onPanelMouseDown}
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 18, opacity: 0 }}
            transition={{ type: "spring", stiffness: 420, damping: 36 }}
            className="
              w-full
              md:w-full md:max-w-md
              lg:max-w-[520px]
              bg-[#111] border border-gray-800
              rounded-t-3xl md:rounded-3xl
              shadow-[0_0_60px_rgba(255,107,0,0.12)]
              max-h-[88vh] md:max-h-[85vh]
              overflow-hidden
            "
            style={{
              paddingBottom: "env(safe-area-inset-bottom)",
            }}
          >
            {/* Header (sticky) */}
            <div className="sticky top-0 z-10 bg-[#111]/95 backdrop-blur border-b border-gray-800 px-5 md:px-7 pt-5 pb-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="text-xl md:text-2xl font-bold leading-tight">
                    {isSignup ? "Create Account" : "Welcome Back"}
                  </h2>
                  <p className="text-sm text-gray-400 mt-1">
                    {isSignup
                      ? "Start your journey now."
                      : "Sign in to continue."}
                  </p>
                </div>

                <button
                  onClick={close}
                  className="shrink-0 text-gray-400 hover:text-orange-500 transition p-2 -mr-2 rounded-xl hover:bg-white/5"
                  aria-label="Close"
                  type="button"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Error */}
              {errorText && (
                <div className="mt-3 text-sm text-red-400 break-words">
                  {errorText}
                </div>
              )}
            </div>

            {/* Body (scrollable) */}
            <div
              className="
                px-5 md:px-7 pb-6
                overflow-y-auto
                [padding-bottom:calc(1.25rem+env(safe-area-inset-bottom))]
              "
            >
              <form onSubmit={onSubmit} className="space-y-3 md:space-y-4 mt-4">
                {isSignup && (
                  <input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Name"
                    className="w-full p-3.5 md:p-4 bg-black border border-gray-700 rounded-xl outline-none focus:border-orange-500 transition"
                  />
                )}

                <input
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="Email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  className="w-full p-3.5 md:p-4 bg-black border border-gray-700 rounded-xl outline-none focus:border-orange-500 transition"
                />

                <input
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  placeholder="Password"
                  type="password"
                  autoComplete={isSignup ? "new-password" : "current-password"}
                  className="w-full p-3.5 md:p-4 bg-black border border-gray-700 rounded-xl outline-none focus:border-orange-500 transition"
                />

                <button
                  disabled={submitting}
                  type="submit"
                  className="w-full py-3.5 md:py-4 bg-orange-500 text-black font-black uppercase rounded-xl hover:bg-orange-400 transition disabled:opacity-60"
                >
                  {submitting
                    ? "Please wait..."
                    : isSignup
                    ? "Sign Up"
                    : "Sign In"}
                </button>

                <button
                  disabled={submitting}
                  type="button"
                  onClick={onGoogle}
                  className="w-full py-3.5 md:py-4 rounded-xl border border-gray-700 text-gray-200 hover:border-orange-500/40 hover:text-orange-400 transition disabled:opacity-60"
                >
                  Continue with Google
                </button>
              </form>

              <div className="mt-5 text-sm text-gray-400">
                {isSignup ? (
                  <span>
                    Already have an account?{" "}
                    <button
                      type="button"
                      className="text-orange-500 hover:text-orange-400"
                      onClick={() => {
                        // ✅ keep same page, just open signin via query param
                        close();
                        navigate(`${window.location.pathname}?auth=signin`, {
                          replace: true,
                        });
                      }}
                    >
                      Sign in
                    </button>
                  </span>
                ) : (
                  <span>
                    Don’t have an account?{" "}
                    <button
                      type="button"
                      className="text-orange-500 hover:text-orange-400"
                      onClick={() => {
                        close();
                        navigate(`${window.location.pathname}?auth=signup`, {
                          replace: true,
                        });
                      }}
                    >
                      Sign up
                    </button>
                  </span>
                )}
              </div>

              <p className="mt-3 text-xs text-gray-600">
                Tip: Tap outside to close, or press ESC.
              </p>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
