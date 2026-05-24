import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, Plus, Trash2, Send, Sparkles, AlertCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { aiRepository, extractError } from "@/data/api/ai/aiRepository";

const QUICK_PROMPTS = [
  "Suggest a compound-only strength routine",
  "How do I target secondary shoulder heads?",
  "What is the optimal rest duration for heavy squats?",
  "Explain progressive overload for beginners",
];

export default function AIChat() {
  const [conversations, setConversations] = useState([]);
  const [activeConvId, setActiveConvId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingConv, setLoadingConv] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  
  const messagesEndRef = useRef(null);

  // Load conversations on mount
  useEffect(() => {
    fetchConversations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchConversations = async (selectFirst = true) => {
    setLoadingConv(true);
    try {
      const response = await aiRepository.getConversations();
      const list = response?.data || response || [];
      setConversations(list);
      
      if (selectFirst && list.length > 0 && !activeConvId) {
        selectConversation(list[0].id);
      }
    } catch (err) {
      console.error("Failed to load conversations:", err);
    } finally {
      setLoadingConv(false);
    }
  };

  const selectConversation = async (id) => {
    setActiveConvId(id);
    setLoadingMessages(true);
    setErrorMessage("");
    try {
      const response = await aiRepository.getConversationMessages(id);
      setMessages(response?.data || response || []);
    } catch (err) {
      const parsed = extractError(err);
      setErrorMessage(parsed.message);
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleCreateChat = async () => {
    setErrorMessage("");
    try {
      const response = await aiRepository.createConversation(`Chat #${conversations.length + 1}`);
      const newConv = response?.data || response;
      setConversations([newConv, ...conversations]);
      setActiveConvId(newConv.id);
      setMessages([]);
    } catch (err) {
      const parsed = extractError(err);
      setErrorMessage(parsed.message);
    }
  };

  const handleDeleteChat = async (e, id) => {
    e.stopPropagation();
    setErrorMessage("");
    try {
      await aiRepository.deleteConversation(id);
      const filtered = conversations.filter(c => c.id !== id);
      setConversations(filtered);
      if (activeConvId === id) {
        if (filtered.length > 0) {
          selectConversation(filtered[0].id);
        } else {
          setActiveConvId(null);
          setMessages([]);
        }
      }
    } catch (err) {
      const parsed = extractError(err);
      setErrorMessage(parsed.message);
    }
  };

  const handleSend = async (textToSend) => {
    const text = textToSend || input.trim();
    if (!text || !activeConvId || sending) return;

    setInput("");
    setSending(true);
    setErrorMessage("");

    // Append user message immediately
    const tempUserMsg = {
      id: "temp-user-" + Date.now(),
      role: "user",
      content: text,
      created_at: new Date().toISOString()
    };
    setMessages(prev => [...prev, tempUserMsg]);

    try {
      const response = await aiRepository.sendMessage(activeConvId, text);
      const data = response?.data || response;
      
      // Update with real messages
      if (data.user_message && data.assistant_message) {
        setMessages(prev => 
          prev.filter(m => m.id !== tempUserMsg.id)
              .concat(data.user_message, data.assistant_message)
        );
      }
    } catch (err) {
      // Remove temporary message and show error
      setMessages(prev => prev.filter(m => m.id !== tempUserMsg.id));
      const parsed = extractError(err);
      setErrorMessage(parsed.message);
    } finally {
      setSending(false);
    }
  };

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex pt-20">
      {/* ================= SIDEBAR ================= */}
      <aside className="w-80 bg-white/[0.02] border-r border-white/5 flex flex-col shrink-0">
        <div className="p-4 border-b border-white/5">
          <button
            onClick={handleCreateChat}
            className="w-full py-3 px-4 rounded-xl bg-orange-500 hover:bg-orange-400 text-black font-black uppercase text-xs flex items-center justify-center gap-2 transition"
          >
            <Plus size={16} /> New Conversation
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
          {loadingConv ? (
            <div className="text-center text-gray-500 text-xs py-4">Loading threads...</div>
          ) : conversations.length === 0 ? (
            <div className="text-center text-gray-500 text-xs py-10">No threads. Create one above!</div>
          ) : (
            conversations.map((conv) => {
              const active = conv.id === activeConvId;
              return (
                <button
                  key={conv.id}
                  onClick={() => selectConversation(conv.id)}
                  className={`w-full text-left p-3 rounded-2xl border flex items-center justify-between group transition ${
                    active
                      ? "bg-orange-500/10 border-orange-500/30 text-orange-500"
                      : "bg-transparent border-transparent text-gray-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <MessageSquare size={16} className="shrink-0" />
                    <span className="truncate font-semibold text-sm">{conv.title}</span>
                  </div>
                  <button
                    onClick={(e) => handleDeleteChat(e, conv.id)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-gray-500 hover:text-red-500 hover:bg-white/5 transition"
                    title="Delete Thread"
                  >
                    <Trash2 size={14} />
                  </button>
                </button>
              );
            })
          )}
        </div>
      </aside>

      {/* ================= MAIN CHAT AREA ================= */}
      <main className="flex-1 flex flex-col relative h-[calc(100vh-80px)]">
        {/* Error Alert Bar */}
        <AnimatePresence>
          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-4 left-4 right-4 z-20 p-4 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-between gap-3 text-red-400 text-sm"
            >
              <div className="flex items-center gap-3">
                <AlertCircle size={18} className="shrink-0" />
                <span>{errorMessage}</span>
              </div>
              <button
                onClick={() => setErrorMessage("")}
                className="text-xs font-black uppercase text-gray-400 hover:text-white border border-white/10 px-3 py-1.5 rounded-lg hover:bg-white/5"
              >
                Dismiss
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Message Feed */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 custom-scrollbar">
          {!activeConvId ? (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-xl mx-auto space-y-8">
              <div className="w-16 h-16 rounded-2xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-500 shadow-[0_0_30px_rgba(255,107,0,0.2)]">
                <Sparkles size={28} />
              </div>
              <div>
                <h2 className="text-3xl font-black uppercase tracking-tight mb-2">
                  FitCoach AI Assistant
                </h2>
                <p className="text-gray-400 text-sm">
                  Welcome to your AI workspace. Ask advice about programming, execution variables, splits, macronutrient calculations, and active recovery schemes.
                </p>
              </div>
              <button
                onClick={handleCreateChat}
                className="py-3 px-6 rounded-xl bg-orange-500 text-black font-black uppercase text-xs hover:bg-orange-400 transition"
              >
                Create First Conversation
              </button>
            </div>
          ) : loadingMessages ? (
            <div className="h-full flex items-center justify-center text-gray-500">
              Loading message logs...
            </div>
          ) : messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-lg mx-auto space-y-6">
              <p className="text-gray-400 text-sm">
                The conversation is empty. Select a quick starter prompt below or type your inquiry.
              </p>
              <div className="grid grid-cols-2 gap-3 w-full">
                {QUICK_PROMPTS.map((p) => (
                  <button
                    key={p}
                    onClick={() => handleSend(p)}
                    className="p-4 bg-white/5 border border-white/5 hover:border-orange-500/30 rounded-2xl text-left text-xs font-semibold text-gray-300 hover:text-orange-500 hover:bg-orange-500/5 transition leading-normal"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto space-y-6">
              {messages.map((msg) => {
                const isAI = msg.role === "assistant";
                return (
                  <div
                    key={msg.id}
                    className={`flex ${isAI ? "justify-start" : "justify-end"}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-3xl p-5 border text-sm leading-relaxed ${
                        isAI
                          ? "bg-white/5 border-white/5 text-gray-200"
                          : "bg-orange-500 text-black border-orange-600 font-medium"
                      }`}
                    >
                      <div className="font-bold text-[10px] uppercase tracking-wider mb-2 opacity-50">
                        {isAI ? "FitCoach AI" : "You"}
                      </div>
                      <p className="whitespace-pre-line">{msg.content}</p>
                    </div>
                  </div>
                );
              })}

              {sending && (
                <div className="flex justify-start">
                  <div className="bg-white/5 border border-white/5 text-gray-400 rounded-3xl p-5 text-sm flex items-center gap-2">
                    <span className="w-2 h-2 bg-orange-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-2 h-2 bg-orange-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" />
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Bar (Sticky at Bottom) */}
        {activeConvId && (
          <div className="p-4 md:p-6 bg-black border-t border-white/5">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="max-w-3xl mx-auto flex items-center gap-3 relative bg-white/5 rounded-2xl border border-white/10 p-2 focus-within:border-orange-500 transition"
            >
              <input
                disabled={sending}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask FitCoach AI about training, splits or diets..."
                className="flex-1 bg-transparent px-4 py-3 text-sm outline-none placeholder-gray-500 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!input.trim() || sending}
                className="p-3 bg-orange-500 hover:bg-orange-400 text-black rounded-xl transition disabled:opacity-50 shrink-0"
              >
                <Send size={16} />
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}
