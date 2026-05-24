import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X } from "lucide-react";
import { useEffect } from "react";

export default function ConfirmationDialog({
  isOpen,
  title = "Confirm Action",
  message = "Are you sure you want to perform this action? This operation cannot be undone.",
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
  isDanger = true
}) {
  // Lock background scroll when open
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    
    // Close on ESC
    const handleEsc = (e) => {
      if (e.key === "Escape") onCancel();
    };
    document.addEventListener("keydown", handleEsc);

    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", handleEsc);
    };
  }, [isOpen, onCancel]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[9999] p-4">
          {/* Backdrop button click */}
          <button
            type="button"
            onClick={onCancel}
            className="absolute inset-0 bg-transparent cursor-default border-none outline-none w-full h-full"
            aria-label="Dismiss modal"
          />

          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-[#111] border border-gray-800 max-w-sm w-full p-6 rounded-3xl overflow-hidden shadow-2xl relative space-y-6 z-10"
          >
            {/* Close button */}
            <button
              type="button"
              onClick={onCancel}
              className="absolute top-4 right-4 text-gray-500 hover:text-white p-1 rounded-xl transition border-none bg-transparent cursor-pointer"
              aria-label="Close dialog"
            >
              <X size={16} />
            </button>

            <div className="flex gap-4">
              <div className={`h-10 w-10 rounded-2xl flex items-center justify-center shrink-0 ${
                isDanger ? "bg-red-500/10 border border-red-500/20 text-red-400" : "bg-orange-500/10 border border-orange-500/20 text-orange-400"
              }`}>
                <AlertTriangle size={20} />
              </div>

              <div className="space-y-1.5 flex-1">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">{title}</h3>
                <p className="text-xs text-gray-400 leading-relaxed">{message}</p>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-gray-300 font-bold uppercase text-[10px] rounded-xl border border-white/5 transition cursor-pointer"
              >
                {cancelLabel}
              </button>
              <button
                type="button"
                onClick={onConfirm}
                className={`flex-1 py-3 font-bold uppercase text-[10px] rounded-xl transition cursor-pointer text-black ${
                  isDanger ? "bg-red-500 hover:bg-red-400" : "bg-orange-500 hover:bg-orange-400"
                }`}
              >
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
