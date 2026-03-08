import { useState, useRef, useEffect } from "react";
import api from "../services/api.js";

export default function CitizenChatBot() {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([
    {
      role: "bot",
      text: "Hi! I'm your emergency help assistant. Ask me things like: 'How do I request an ambulance?', 'What should I do during a flood?', or 'Where is the nearest hospital?'"
    }
  ]);
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const q = question.trim();
    if (!q || loading) return;

    setQuestion("");
    setMessages((prev) => [...prev, { role: "user", text: q }]);
    setLoading(true);

    try {
      const { data } = await api.post("/ai/citizen-chat", {
        question: q,
        context: "Rural public resource allocation, ambulances, disasters, healthcare."
      });
      setMessages((prev) => [...prev, { role: "bot", text: data.answer || "No response." }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: "Sorry, I couldn't reach the AI. Please try again or check your connection." }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border border-slate-800 rounded-xl bg-slate-900/60 overflow-hidden flex flex-col">
      <div className="px-4 py-2 border-b border-slate-800 flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <h3 className="text-sm font-semibold text-slate-100">AI Help Bot (Gemini)</h3>
      </div>
      <div className="h-48 overflow-y-auto p-3 space-y-3">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] px-3 py-1.5 rounded-lg text-xs ${
                m.role === "user"
                  ? "bg-primary text-white"
                  : "bg-slate-800 text-slate-200"
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-400 text-xs">
              Thinking...
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      <form onSubmit={handleSubmit} className="p-3 border-t border-slate-800">
        <div className="flex gap-2">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask anything about emergencies, ambulances, disasters..."
            disabled={loading}
            className="flex-1 px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 text-sm placeholder-slate-500 focus:border-primary outline-none disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-blue-600 disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
