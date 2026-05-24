
function calculateStreak(workouts) {
  if (!workouts || !workouts.length) return 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dateSet = new Set(workouts.map(w => w.date));
  let streak = 0;
  let checkDate = new Date(today);
  while (dateSet.has(checkDate.toISOString().split('T')[0])) {
    streak++;
    checkDate.setDate(checkDate.getDate() - 1);
  }
  return streak;
}

export default function StatsGrid({ workouts, dashboardData }) {
  const summary = dashboardData?.summary;

  const total = summary?.total_workouts ?? workouts?.length ?? 0;
  const activeDays = summary?.active_days ?? [...new Set((workouts || []).map(w => w.date))].length;
  const streak = summary?.current_streak ?? calculateStreak(workouts);

  const stats = [
    { label: "Total Workouts", value: total },
    { label: "Active Days", value: activeDays },
    { label: "Current Streak \ud83d\udd25", value: streak }
  ];

  return (
    <div className="grid md:grid-cols-3 gap-8">
      {stats.map((stat, i) => (
        <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-xl">
          <div className="text-gray-400 mb-2">{stat.label}</div>
          <div className="text-3xl font-bold text-orange-500">{stat.value}</div>
        </div>
      ))}
    </div>
  );
}