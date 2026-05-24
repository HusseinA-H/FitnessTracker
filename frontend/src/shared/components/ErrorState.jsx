import { AlertCircle, RefreshCw } from "lucide-react";

export default function ErrorState({
  title = "Synchronization Failed",
  message = "We encountered a network timeout while retrieving the records.",
  onRetry
}) {
  return (
    <div className="bg-red-500/5 border border-red-500/10 p-8 rounded-3xl text-center space-y-4 max-w-md mx-auto my-12">
      <div className="h-12 w-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto">
        <AlertCircle className="text-red-400" size={24} />
      </div>
      
      <div className="space-y-1">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">{title}</h3>
        <p className="text-xs text-gray-500 leading-relaxed">{message}</p>
      </div>

      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mx-auto px-4 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 font-bold uppercase text-[10px] rounded-xl transition flex items-center gap-1.5 cursor-pointer"
        >
          <RefreshCw size={12} /> Retry Action
        </button>
      )}
    </div>
  );
}
