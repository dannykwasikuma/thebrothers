import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Bot } from "lucide-react";
import { getAssistantReply } from "@/lib/chatbotKnowledge";
import { playChatOpen, playSend, playNotification } from "@/lib/sounds";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const QUICK_REPLIES = ["Our Services", "Pricing Info", "How to Book"];

const QUICK_REPLY_MESSAGES: Record<string, string> = {
  "Our Services": "What services do you offer?",
  "Pricing Info": "How much do your services cost?",
  "How to Book": "How do I book your services?",
};

export default function ChatBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hello! I am the Brothers Assistant. How can I help you today? Ask me about our services, pricing, bookings, or anything else.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showQuickReplies, setShowQuickReplies] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 300);
  }, [open]);

  async function send(text: string) {
    if (!text.trim() || loading) return;
    playSend();
    setShowQuickReplies(false);
    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setInput("");
    setLoading(true);

    await new Promise((resolve) => setTimeout(resolve, 500 + Math.random() * 400));

    const reply = getAssistantReply(text);
    setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    setLoading(false);
    playNotification();
  }

  return (
    <>
      {/* Floating button */}
      <button
        data-testid="chatbot-toggle"
        onClick={() => { setOpen((v) => !v); playChatOpen(); }}
        aria-label="Open customer support chat"
        className="fixed bottom-6 left-6 z-50 w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95"
        style={{
          background: "linear-gradient(135deg, #C9A84C 0%, #8B6914 100%)",
          boxShadow: "0 4px 24px rgba(201,168,76,0.5)",
        }}
      >
        {open ? <X size={22} color="#0D0A07" /> : <MessageCircle size={22} color="#0D0A07" />}
      </button>

      {/* Chat panel */}
      <div
        className="fixed bottom-24 left-6 z-50 flex flex-col rounded-2xl overflow-hidden transition-all duration-300 origin-bottom-left"
        style={{
          width: 320,
          maxHeight: 480,
          background: "#1A1410",
          border: "1px solid rgba(201,168,76,0.35)",
          boxShadow: "0 20px 60px rgba(0,0,0,0.7)",
          opacity: open ? 1 : 0,
          transform: open ? "scale(1) translateY(0)" : "scale(0.85) translateY(16px)",
          pointerEvents: open ? "auto" : "none",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center gap-3 px-4 py-3 flex-shrink-0"
          style={{ borderBottom: "1px solid rgba(201,168,76,0.2)", background: "#0D0A07" }}
        >
          <div className="relative">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center"
              style={{ background: "linear-gradient(135deg,#C9A84C,#8B6914)" }}
            >
              <Bot size={18} color="#0D0A07" />
            </div>
            <span
              className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2"
              style={{ background: "#22c55e", borderColor: "#0D0A07" }}
            />
          </div>
          <div>
            <p className="text-sm font-semibold" style={{ color: "#C9A84C", fontFamily: "'Playfair Display', serif" }}>
              Brothers Assistant
            </p>
            <p className="text-xs" style={{ color: "#7A6A5A" }}>
              Online — usually replies in minutes
            </p>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="ml-auto p-1 rounded hover:bg-white/10 transition"
            aria-label="Close chat"
          >
            <X size={16} color="#7A6A5A" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ minHeight: 0 }}>
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className="max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-relaxed"
                style={
                  m.role === "user"
                    ? { background: "linear-gradient(135deg,#C9A84C,#8B6914)", color: "#0D0A07", borderBottomRightRadius: 4 }
                    : { background: "#2A1F14", color: "#F5F0E8", borderBottomLeftRadius: 4, border: "1px solid rgba(201,168,76,0.15)" }
                }
              >
                {m.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div
                className="rounded-2xl px-4 py-3 flex gap-1 items-center"
                style={{ background: "#2A1F14", borderBottomLeftRadius: 4, border: "1px solid rgba(201,168,76,0.15)" }}
              >
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="w-1.5 h-1.5 rounded-full"
                    style={{
                      background: "#C9A84C",
                      animation: `bounce 1.2s ${i * 0.2}s infinite`,
                    }}
                  />
                ))}
              </div>
            </div>
          )}
          {/* Quick reply buttons (shown only at start) */}
          {showQuickReplies && messages.length === 1 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {QUICK_REPLIES.map((qr) => (
                <button
                  key={qr}
                  onClick={() => send(QUICK_REPLY_MESSAGES[qr])}
                  className="text-xs px-3 py-1.5 rounded-full border transition hover:scale-105"
                  style={{ borderColor: "rgba(201,168,76,0.5)", color: "#C9A84C", background: "rgba(201,168,76,0.08)" }}
                >
                  {qr}
                </button>
              ))}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div
          className="flex items-center gap-2 px-3 py-3 flex-shrink-0"
          style={{ borderTop: "1px solid rgba(201,168,76,0.2)", background: "#0D0A07" }}
        >
          <input
            ref={inputRef}
            data-testid="chatbot-input"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send(input)}
            placeholder="Type a message..."
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-[#4A3728]"
            style={{ color: "#F5F0E8" }}
          />
          <button
            data-testid="chatbot-send"
            onClick={() => send(input)}
            disabled={!input.trim() || loading}
            className="w-8 h-8 rounded-full flex items-center justify-center transition disabled:opacity-40"
            style={{ background: "linear-gradient(135deg,#C9A84C,#8B6914)" }}
            aria-label="Send message"
          >
            <Send size={14} color="#0D0A07" />
          </button>
        </div>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-5px); }
        }
      `}</style>
    </>
  );
}
