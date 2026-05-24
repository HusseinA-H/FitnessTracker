import {
  LayoutDashboard,
  Users,
  CreditCard,
  Settings,
  Dumbbell,
  Apple,
  Brain,
  Sliders,
  LogOut,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const ADMIN_ITEMS = [
  { label: "Dashboard", path: "/admin", Icon: LayoutDashboard },
  { label: "Users", path: "/admin/users", Icon: Users },
  { label: "Subscriptions", path: "/admin/subscriptions", Icon: CreditCard },
  { label: "Plans", path: "/admin/plans", Icon: Sliders },
  { label: "Workouts", path: "/admin/workouts", Icon: Dumbbell },
  { label: "Nutrition", path: "/admin/nutrition", Icon: Apple },
  { label: "AI Usage", path: "/admin/ai", Icon: Brain },
  { label: "Content Control", path: "/admin/content", Icon: Settings },
];

export default function AdminSidebar() {
  const location = useLocation();

  return (
    <aside className="w-64 bg-[#111] border-r border-white/5 flex flex-col h-screen fixed left-0 top-0 z-30 pt-20">
      <div className="p-6 border-b border-white/5">
        <span className="text-[10px] uppercase font-black tracking-widest text-orange-500">
          FITCOACH SAAS ADMIN
        </span>
        <h2 className="text-lg font-black uppercase tracking-tight text-white mt-1">
          Management Panel
        </h2>
      </div>

      <div className="flex-1 px-4 py-6 space-y-1 overflow-y-auto custom-scrollbar">
        {ADMIN_ITEMS.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.label}
              to={item.path}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition relative ${
                isActive
                  ? "text-orange-500 bg-orange-500/10 border-orange-500/30 border"
                  : "text-gray-400 hover:text-white hover:bg-white/5 border border-transparent"
              }`}
            >
              <item.Icon size={16} className="shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>

      <div className="p-4 border-t border-white/5">
        <Link
          to="/dashboard"
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white rounded-xl text-xs font-black uppercase transition border border-white/5"
        >
          <LogOut size={14} /> Return to Site
        </Link>
      </div>
    </aside>
  );
}
