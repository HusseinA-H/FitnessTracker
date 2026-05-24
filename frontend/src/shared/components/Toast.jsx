import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, AlertTriangle, AlertCircle, Info, X } from "lucide-react";
import { createContext, useContext, useState, useCallback } from "react";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = "info", duration = 4000) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = {
    success: (msg, dur) => addToast(msg, "success", dur),
    error: (msg, dur) => addToast(msg, "error", dur),
    info: (msg, dur) => addToast(msg, "info", dur),
    warning: (msg, dur) => addToast(msg, "warning", dur),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-3 pointer-events-none max-w-sm w-full px-4 sm:px-0">
        <AnimatePresence>
          {toasts.map((t) => {
            let Icon = Info;
            let iconColor = "text-blue-400";
            let borderClass = "border-blue-500/30 bg-blue-950/20";
            
            if (t.type === "success") {
              Icon = CheckCircle;
              iconColor = "text-green-400";
              borderClass = "border-green-500/30 bg-green-950/20";
            } else if (t.type === "error") {
              Icon = AlertCircle;
              iconColor = "text-red-400";
              borderClass = "border-red-500/30 bg-red-950/20";
            } else if (t.type === "warning") {
              Icon = AlertTriangle;
              iconColor = "text-orange-400";
              borderClass = "border-orange-500/30 bg-orange-950/20";
            }

            return (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95, y: -20 }}
                layout
                className={`
                  pointer-events-auto flex items-start gap-3 p-4 rounded-2xl
                  border ${borderClass} backdrop-blur-xl shadow-2xl
                  text-xs text-gray-200 font-semibold tracking-wide
                `}
              >
                <Icon size={16} className={`${iconColor} shrink-0 mt-0.5`} />
                <span className="flex-1 leading-normal">{t.message}</span>
                <button
                  type="button"
                  onClick={() => removeToast(t.id)}
                  className="text-gray-500 hover:text-gray-300 transition p-0.5 rounded-lg border-none bg-transparent cursor-pointer"
                  aria-label="Dismiss notification"
                >
                  <X size={14} />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
