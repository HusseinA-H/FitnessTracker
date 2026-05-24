export function SkeletonLine({ className = "", width = "w-full", height = "h-4" }) {
  return (
    <div className={`bg-white/[0.03] animate-pulse rounded-md ${width} ${height} ${className}`} />
  );
}

export function SkeletonCard({ className = "" }) {
  return (
    <div className={`bg-[#111] border border-white/5 p-6 rounded-2xl space-y-4 ${className}`}>
      <div className="flex justify-between items-start">
        <SkeletonLine width="w-2/5" height="h-5" />
        <SkeletonLine width="w-1/5" height="h-4" className="rounded-full" />
      </div>
      <SkeletonLine width="w-11/12" height="h-3" />
      <SkeletonLine width="w-4/5" height="h-3" />
      <div className="pt-3 border-t border-white/5 flex justify-between items-center">
        <SkeletonLine width="w-1/3" height="h-4" />
        <div className="flex gap-1.5">
          <SkeletonLine width="w-6" height="h-6" className="rounded-lg" />
          <SkeletonLine width="w-6" height="h-6" className="rounded-lg" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonTable({ rows = 5, cols = 5, className = "" }) {
  return (
    <div className={`bg-[#111] border border-white/5 rounded-2xl overflow-hidden shadow-xl ${className}`}>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-white/5 bg-black/40">
              {Array.from({ length: cols }).map((_, i) => (
                <th key={i} className="p-4">
                  <SkeletonLine width="w-16" height="h-3" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rows }).map((_, r) => (
              <tr key={r} className="border-b border-white/5">
                {Array.from({ length: cols }).map((_, c) => (
                  <td key={c} className="p-4">
                    <SkeletonLine width={c === 0 ? "w-24" : "w-16"} height="h-4" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
