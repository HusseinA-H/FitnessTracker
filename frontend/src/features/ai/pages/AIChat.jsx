import { useState, useRef, useEffect, useCallback } from "react";

import { aiRepository } from "@data/api/ai/aiRepository";
import { useAuth } from "@features/auth";

export default function AIChat() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    let active = true;
    if (user) {
      const fetchConvs = async () => {
        try {
          const res = await aiRepository.getConversations();
          const data = res?.data || res;
          const convs = Array.isArray(data) ? data : (data?.results || []);
          if (active) {
            setConversations(convs);
            if (convs.length > 0) {
              setActiveConv(convs[0]);
            }
            setError(null);
          }
        } catch (err) {
          console.error("Failed to load conversations:", err);
          if (active) {
            const status = err?.status || err?.response?.status;
            if (status === 403) {
              setError("AI features require an active subscription. Please upgrade your plan.");
            } else {
              setError("Failed to load conversations. Please try again.");
            }
          }
        } finally {
          if (active) {
            setLoading(false);
          }
        }
      };
      fetchConvs();
    } else {
      setLoading(false);
    }
    return () => {
      active = false;
    };
  }, [user]);

  const loadMessages = useCallback(async (convId) => {
    if (!convId) {
      setMessages([]);
      return;
    }
    try {
      const res = await aiRepository.getMessages(convId);
      const data = res?.data || res;
      setMessages(Array.isArray(data) ? data : (data?.results || []));
    } catch (err) {
      console.error("Failed to load messages:", err);
      setMessages([]);
    }
  }, []);

  useEffect(() => {
    loadMessages(activeConv?.id);
  }, [activeConv, loadMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleNewConversation() {
    try {
      const res = await aiRepository.createConversation();
      const conv = res?.data || res;
      setConversations(prev => [conv, ...prev]);
      setActiveConv(conv);
      setError(null);
    } catch (err) {
      console.error("Failed to create conversation:", err);
      setError("Failed to create a new conversation.");
    }
  }

  async function handleSend(e) {
    e.preventDefault();
    const content = input.trim();
    if (!content || sending) return;

    let convId = activeConv?.id;

    if (!convId) {
      try {
        const res = await aiRepository.createConversation();
        const conv = res?.data || res;
        convId = conv.id;
        setConversations(prev => [conv, ...prev]);
        setActiveConv(conv);
      } catch (err) {
        console.error("Failed to create conversation:", err);
        setError("Failed to start conversation.");
        return;
      }
    }

    setInput("");
    setSending(true);
    setError(null);

    const tempId = `temp-${Date.now()}`;
    setMessages(prev => [...prev, {
      id: tempId,
      role: "user",
      content,
      created_at: new Date().toISOString(),
    }]);

    try {
      const res = await aiRepository.sendMessage(convId, content);
      const data = res?.data || res;

      if (data?.assistant_message && data?.user_message) {
        setMessages(prev => {
          const filtered = prev.filter(m => m.id !== tempId);
          return [...filtered, data.user_message, data.assistant_message];
        });

        setConversations(prev =>
          prev.map(c => c.id === convId ? { ...c, updated_at: new Date().toISOString() } : c)
        );
      }
    } catch (err) {
      console.error("Failed to send message:", err);
      const status = err?.status || err?.response?.status;
      let errorMsg = "Something went wrong. Please try again.";

      if (status === 403) {
        errorMsg = "AI features require an active subscription. Please upgrade your plan.";
      } else if (status === 429) {
        errorMsg = "You've reached your monthly AI limit. Upgrade your plan for more requests.";
      } else if (status === 400) {
        const body = err?.body || err?.response?.data;
        const detail = body?.detail || body?.errors?.detail || body?.message;
        if (detail) errorMsg = detail;
      }

      setMessages(prev => prev.filter(m => m.id !== tempId));
      setError(errorMsg);
    } finally {
      setSending(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading AI Coach...</p>
        </div>
      </div>
    );
  }

  if (error && conversations.length === 0 && !activeConv) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white px-6">
        <div className="max-w-md text-center">
          <div className="text-6xl mb-4">&#x1F916;</div>
          <h2 className="text-2xl font-bold mb-3">FitCoach AI</h2>
          <p className="text-gray-400 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-orange-500 hover:bg-orange-600 rounded-xl font-semibold text-black transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row text-white">
      <div className="w-full md:w-64 bg-white/5 border-r border-white/10 p-4 space-y-2">
        <button
          onClick={handleNewConversation}
          className="w-full py-2 px-4 bg-orange-500 hover:bg-orange-600 rounded-lg font-semibold text-black transition"
        >
          + New Chat
        </button>
        <div className="space-y-1 mt-4 max-h-[60vh] overflow-y-auto">
          {conversations.map(conv => (
            <button
              key={conv.id}
              onClick={() => { setActiveConv(conv); setError(null); }}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition truncate ${
                activeConv?.id === conv.id
                  ? "bg-orange-500/20 text-orange-400"
                  : "hover:bg-white/10 text-gray-400"
              }`}
            >
              {conv.title || "New Conversation"}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        <div className="flex-1 overflow-y-auto p-6 space-y-4 max-h-[70vh]">
          {messages.length === 0 && !activeConv && (
            <div className="text-center text-gray-500 mt-20">
              <p className="text-2xl mb-2">FitCoach AI</p>
              <p>Start a conversation to get fitness advice.</p>
            </div>
          )}
          {messages.length === 0 && activeConv && (
            <div className="text-center text-gray-500 mt-20">
              <p>Ask me anything about fitness, nutrition, or training!</p>
            </div>
          )}
          {messages.map(msg => (
            <div
              key={msg.id}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                  msg.role === "user"
                    ? "bg-orange-500 text-black"
                    : "bg-white/10 text-gray-200"
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}
          {sending && (
            <div className="flex justify-start">
              <div className="bg-white/10 px-4 py-3 rounded-2xl text-sm text-gray-400 animate-pulse">
                Thinking...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {error && (
          <div className="px-6 py-2 bg-red-500/10 border-t border-red-500/30 text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSend} className="p-4 border-t border-white/10">
          <div className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ask your AI fitness coach..."
              disabled={sending}
              maxLength={2000}
              className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={sending || !input.trim()}
              className="px-6 py-3 bg-orange-500 hover:bg-orange-600 disabled:opacity-40 disabled:hover:bg-orange-500 rounded-xl font-semibold text-black transition"
            >
              Send
            </button>
          </div>
          <p className="text-xs text-gray-600 mt-2 text-right">{input.length}/2000</p>
        </form>
      </div>
    </div>
  );
}