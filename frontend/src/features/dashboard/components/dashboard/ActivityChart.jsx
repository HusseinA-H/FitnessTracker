export default function ActivityChart({ workouts, dashboardData }) {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const weekly = new Array(7).fill(0);

  const chartData = dashboardData?.charts?.workout_activity;
  if (chartData && chartData.length > 0) {
    chartData.forEach(item => {
      const dayIndex = new Date(item.date).getDay();
      weekly[dayIndex] += item.count;
    });
  } else {
    (workouts || []).forEach(w => {
      const day = new Date(w.date).getDay();
      weekly[day]++;
    });
  }

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-xl">
      <h3 className="text-xl font-semibold mb-6">
        Weekly Activity
      </h3>

      <div className="flex justify-between items-end h-40">
        {weekly.map((count, i) => (
          <div key={i} className="flex flex-col items-center">
            <div
              className="w-8 bg-orange-500 rounded-lg transition-all duration-500"
              style={{ height: `${Math.max(count * 20, 4)}px` }}
            />
            <span className="text-xs mt-2 text-gray-400">
              {days[i]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}