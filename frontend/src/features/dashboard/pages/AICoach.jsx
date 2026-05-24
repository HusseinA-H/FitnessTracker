import { motion } from "framer-motion";
import { Brain, Dumbbell, LineChart, RefreshCw, MessageSquare, AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { aiRepository, extractError } from "@/data/api/ai/aiRepository";

export default function AICoach() {
  const navigate = useNavigate();

  const [insight, setInsight] = useState("");
  const [recommendations, setRecommendations] = useState("");
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const [coachQuestion, setCoachQuestion] = useState("");
  const [asking, setAsking] = useState(false);

  useEffect(() => {
    fetchCoachData();
  }, []);

  const fetchCoachData = async () => {
    setLoading(true);
    setErrorMessage("");
    try {
      const [insRes, recRes] = await Promise.all([
        aiRepository.getPerformanceInsights(),
        aiRepository.getWorkoutRecommendations()
      ]);
      setInsight(insRes?.data?.insight || insRes?.insight || "");
      setRecommendations(recRes?.data?.recommendations || recRes?.recommendations || "");
    } catch (err) {
      const parsed = extractError(err);
      setErrorMessage(parsed.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAskCoach = async (e) => {
    e.preventDefault();
    const query = coachQuestion.trim();
    if (!query) return;

    setAsking(true);
    setErrorMessage("");
    try {
      // 1. Fetch conversations
      const convsResponse = await aiRepository.getConversations();
      const conversations = convsResponse?.data || convsResponse || [];
      
      let targetConv;
      if (conversations.length > 0) {
        targetConv = conversations[0];
      } else {
        const createRes = await aiRepository.createConversation("Coach Thread");
        targetConv = createRes?.data || createRes;
      }

      // 2. Send prompt
      await aiRepository.sendMessage(targetConv.id, query);
      
      // 3. Navigate to chat
      navigate("/ai/chat");
    } catch (err) {
      const parsed = extractError(err);
      setErrorMessage(parsed.message);
    } finally {
      setAsking(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white px-6 md:px-12 py-24 space-y-16">
      {/* Title */}
      <header className="text-center space-y-4">
        <div className="mx-auto w-14 h-14 rounded-2xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-500 shadow-[0_0_20px_rgba(255,107,0,0.1)]">
          <Brain size={28} />
        </div>
        <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter">
          FitCoach <span className="text-orange-500">AI</span>
        </h1>
        <p className="text-gray-400 max-w-xl mx-auto uppercase tracking-widest text-xs">
          Your personal intelligent coach for routine programming & progress monitoring
        </p>
      </header>

      {errorMessage && (
        <div className="max-w-4xl mx-auto p-4 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-between text-red-400 text-sm">
          <div className="flex items-center gap-3">
            <AlertCircle size={18} />
            <span>{errorMessage}</span>
          </div>
          <button
            onClick={fetchCoachData}
            className="text-xs font-black uppercase px-3 py-1.5 rounded-lg border border-red-500/20 hover:bg-red-500/20"
          >
            Retry
          </button>
        </div>
      )}

      {loading ? (
        <div className="max-w-4xl mx-auto text-center py-20 text-gray-500 text-sm flex flex-col items-center gap-3">
          <RefreshCw size={24} className="animate-spin text-orange-500" />
          <span>Consulting coach data and performance history...</span>
        </div>
      ) : (
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8">
          {/* Performance Insight */}
          <motion.div
            whileHover={{ y: -5 }}
            className="p-8 rounded-3xl bg-white/[0.02] border border-white/5 space-y-4 relative overflow-hidden"
          >
            <div className="absolute top-[-10%] right-[-10%] w-24 h-24 bg-orange-500/5 blur-2xl rounded-full" />
            <div className="flex items-center gap-3 text-orange-500 font-bold uppercase tracking-wider text-xs">
              <LineChart size={18} /> Performance Insight
            </div>
            <h3 className="text-xl font-bold uppercase tracking-tight">AI Progress Summary</h3>
            <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-line">
              {insight || "No workout history logged yet. Start recording your workouts on the premium tracker to generate automated coaching intelligence insights."}
            </p>
          </motion.div>

          {/* Workout Recommendations */}
          <motion.div
            whileHover={{ y: -5 }}
            className="p-8 rounded-3xl bg-white/[0.02] border border-white/5 space-y-4 relative overflow-hidden"
          >
            <div className="absolute top-[-10%] right-[-10%] w-24 h-24 bg-orange-500/5 blur-2xl rounded-full" />
            <div className="flex items-center gap-3 text-orange-500 font-bold uppercase tracking-wider text-xs">
              <Dumbbell size={18} /> Workout Recommendations
            </div>
            <h3 className="text-xl font-bold uppercase tracking-tight">AI Routine Suggestions</h3>
            <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-line">
              {recommendations || "Log compound and accessory lifts to allow FitCoach AI to optimize exercise routines and progressive overload volume suggestions."}
            </p>
          </motion.div>

          {/* Ask Coach (Full Width) */}
          <div className="md:col-span-2 bg-[#111] border border-gray-800 p-8 rounded-3xl space-y-6">
            <div className="flex items-center gap-3 text-orange-500 font-bold uppercase tracking-wider text-xs">
              <MessageSquare size={18} /> Direct Consult
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-bold uppercase tracking-tight">Inquire Your Routine</h3>
              <p className="text-gray-400 text-sm">
                Discuss execution metrics, plateaus, adjustments, or customized split recommendations with FitCoach.
              </p>
            </div>
            
            <form onSubmit={handleAskCoach} className="flex gap-3">
              <input
                disabled={asking}
                value={coachQuestion}
                onChange={(e) => setCoachQuestion(e.target.value)}
                placeholder="Example: How should I restructure my program to improve chest hypertrophy?"
                className="flex-1 p-4 bg-black border border-gray-700 rounded-xl outline-none focus:border-orange-500 transition text-sm disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!coachQuestion.trim() || asking}
                className="px-6 py-4 bg-orange-500 hover:bg-orange-400 text-black font-black uppercase text-xs rounded-xl transition flex items-center justify-center shrink-0 disabled:opacity-50"
              >
                {asking ? "Sending..." : "Consult AI"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
