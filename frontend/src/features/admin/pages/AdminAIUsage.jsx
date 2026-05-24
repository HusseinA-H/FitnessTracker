import {
  Zap,
  TrendingUp,
  Cpu,
  RefreshCw,
  AlertCircle,
  Search,
  MessageSquare
} from "lucide-react";
import { useEffect, useState } from "react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

import { adminRepository } from "../../../data/api/admin/adminRepository";

const COLORS = ["#f97316", "#8b5cf6", "#3b82f6", "#ec4899", "#10b981"];

export default function AdminAIUsage() {
  const [summary, setSummary] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Search & pagination params
  const [searchUser, setSearchUser] = useState("");
  const [requestType, setRequestType] = useState("");

  const fetchAIUsageData = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Fetch aggregated cost metrics and daily charts data
      const sumResponse = await adminRepository.getAIUsageSummary();
      setSummary(sumResponse?.data || sumResponse);

      // 2. Fetch usage logs lists (with search parameters)
      const params = {};
      if (searchUser.trim()) params.search = searchUser;
      if (requestType) params.request_type = requestType;

      const logResponse = await adminRepository.getAIUsageLogs(params);
      const list = logResponse?.data?.results || logResponse?.results || logResponse?.data || logResponse || [];
      setLogs(list);
    } catch (err) {
      console.error(err);
      setError("Failed to compile AI token metrics and consumption history logs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAIUsageData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestType]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchAIUsageData();
  };

  if (loading && !summary) {
    return (
      <div className="min-h-screen flex items-center justify-center p-12">
        <div className="text-center space-y-4">
          <RefreshCw className="animate-spin text-orange-500 mx-auto" size={32} />
          <p className="text-gray-400 text-xs uppercase tracking-widest">Auditing AI API Usage Costs...</p>
        </div>
      </div>
    );
  }

  const { total_tokens = 0, total_cost = 0, total_requests = 0, avg_response_time = 0, daily_usage = [], model_share = [] } = summary || {};

  return (
    <div className="p-8 space-y-10 pt-24">
      {/* Title */}
      <div className="flex items-center justify-between border-b border-white/5 pb-5">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tight">AI Metrics & Latency</h1>
          <p className="text-xs text-gray-500 uppercase tracking-widest mt-1">Audit token consumption volumes, estimated credit expenses, and request latency logs</p>
        </div>
        <button
          onClick={fetchAIUsageData}
          className="p-3 bg-white/5 hover:bg-white/10 rounded-xl transition border border-white/5 text-gray-400"
        >
          <RefreshCw size={14} />
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 p-6 rounded-2xl flex items-center gap-3 text-red-400 text-sm">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Aggregate Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-6 rounded-2xl border border-white/5 bg-[#111] space-y-3">
          <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-gray-500">
            <span>Total Prompt Inquiries</span>
            <MessageSquare size={16} className="text-blue-500" />
          </div>
          <h2 className="text-3xl font-black italic tracking-tight">{total_requests}</h2>
        </div>

        <div className="p-6 rounded-2xl border border-white/5 bg-[#111] space-y-3">
          <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-gray-500">
            <span>Cumulative Tokens</span>
            <Cpu size={16} className="text-orange-500" />
          </div>
          <h2 className="text-3xl font-black italic tracking-tight">{total_tokens.toLocaleString()}</h2>
        </div>

        <div className="p-6 rounded-2xl border border-white/5 bg-[#111] space-y-3">
          <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-gray-500">
            <span>Estimated Billing Expenses</span>
            <TrendingUp size={16} className="text-green-500" />
          </div>
          <h2 className="text-3xl font-black italic tracking-tight">${total_cost.toFixed(4)}</h2>
        </div>

        <div className="p-6 rounded-2xl border border-white/5 bg-[#111] space-y-3">
          <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-gray-500">
            <span>Average API Latency</span>
            <Zap size={16} className="text-yellow-500" />
          </div>
          <h2 className="text-3xl font-black italic tracking-tight">{avg_response_time.toFixed(2)}s</h2>
        </div>
      </div>

      {/* Graphs */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Token Growth line graph */}
        <div className="lg:col-span-2 bg-[#111] border border-white/5 p-6 rounded-2xl space-y-4">
          <h3 className="text-xs font-black uppercase tracking-wider text-gray-400">
            Daily Token Consumption Curve
          </h3>
          <div className="h-64">
            {daily_usage.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-gray-500">
                No LLM queries tracked in daily history.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={daily_usage}>
                  <XAxis dataKey="date" stroke="#444" fontSize={10} tickLine={false} />
                  <YAxis stroke="#444" fontSize={10} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#111", border: "1px solid #333", borderRadius: "12px", fontSize: "12px" }}
                  />
                  <Line type="monotone" dataKey="tokens" stroke="#f97316" strokeWidth={3} dot={false} name="Tokens" />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Engine share bar chart */}
        <div className="bg-[#111] border border-white/5 p-6 rounded-2xl space-y-4">
          <h3 className="text-xs font-black uppercase tracking-wider text-gray-400">
            Inquiries distribution by Model Name
          </h3>
          <div className="h-64">
            {model_share.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-gray-500">
                No active model logs.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={model_share} layout="vertical">
                  <XAxis type="number" stroke="#444" fontSize={10} tickLine={false} hide />
                  <YAxis dataKey="model" type="category" stroke="#666" fontSize={8} width={100} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#111", border: "1px solid #333", borderRadius: "12px", fontSize: "12px" }}
                  />
                  <Bar dataKey="count" name="Queries count" barSize={12} radius={[0, 4, 4, 0]}>
                    {model_share.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Search & Logs List */}
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-[#111] p-4 rounded-2xl border border-white/5">
          <form onSubmit={handleSearchSubmit} className="flex gap-2 w-full md:max-w-md bg-black border border-gray-800 rounded-xl p-1.5 focus-within:border-orange-500 transition">
            <input
              type="text"
              placeholder="Filter logs by username..."
              value={searchUser}
              onChange={(e) => setSearchUser(e.target.value)}
              className="flex-1 bg-transparent px-3 py-2 text-xs outline-none"
            />
            <button type="submit" className="p-2 bg-orange-500 text-black hover:bg-orange-400 rounded-lg transition">
              <Search size={14} />
            </button>
          </form>

          <select
            value={requestType}
            onChange={(e) => setRequestType(e.target.value)}
            className="p-3 bg-black border border-gray-800 rounded-xl text-xs outline-none focus:border-orange-500 transition text-gray-400 w-full md:w-48"
          >
            <option value="">All Request Types</option>
            <option value="CHAT">Chat Conversation</option>
            <option value="MACRO_CALCULATION">Macro Target Calculation</option>
            <option value="INSIGHTS">AI Progress Insights</option>
          </select>
        </div>

        {/* Logs Table */}
        <div className="bg-[#111] border border-white/5 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/5 bg-black/40 text-gray-500 font-bold uppercase tracking-wider">
                  <th className="p-4">User</th>
                  <th className="p-4">Request Type</th>
                  <th className="p-4">Engine / Model</th>
                  <th className="p-4">Total Tokens</th>
                  <th className="p-4">Est. Cost</th>
                  <th className="p-4">Latency</th>
                  <th className="p-4">Date</th>
                </tr>
              </thead>
              <tbody>
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-10 text-gray-500">No usage logs recorded for this criteria.</td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id} className="border-b border-white/5 hover:bg-white/[0.01] transition">
                      <td className="p-4 font-bold text-white">{log.username || "Guest"}</td>
                      <td className="p-4 text-gray-400 font-medium uppercase text-[10px]">{log.request_type}</td>
                      <td className="p-4 text-gray-500 font-mono text-[10px]">{log.model_name}</td>
                      <td className="p-4 font-bold text-gray-200">{log.total_tokens.toLocaleString()}</td>
                      <td className="p-4 text-green-500 font-bold font-mono">${log.estimated_cost.toFixed(5)}</td>
                      <td className="p-4 text-yellow-500">{log.response_time.toFixed(2)}s</td>
                      <td className="p-4 text-gray-500">{new Date(log.created_at || log.date).toLocaleString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
