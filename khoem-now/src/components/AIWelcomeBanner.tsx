import React, { useState, useMemo } from "react";
import { X, Pause, Play, Send } from "lucide-react";

interface Message {
  id: string;
  role: "user" | "ai";
  text: string;
}

interface AIWelcomeBannerProps {
  open: boolean;
  onClose: () => void;
  onOpen?: () => void;
}

const GREETING_TEXT =
  "Hello, dear valued customer. Welcome to our platform. If you have any questions, I can help explain in English. • 您好， 尊贵的客户。欢迎使用我们的平台。如果您有任何问题，我很乐意为您解答。 • ";

const STAR_COLORS = ["#67e8f9", "#c084fc", "#f472b6", "#fbbf24", "#34d399", "#ffffff", "#60a5fa"];

export function AIWelcomeBanner({ open, onClose, onOpen }: AIWelcomeBannerProps) {
  const [paused, setPaused] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);

  const stars = useMemo(() => {
    const COLS = 8;
    const ROWS = 20;
    const result = [];
    let id = 0;
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const cellW = 100 / COLS;
        const cellH = 100 / ROWS;
        result.push({
          id: id++,
          left: c * cellW + Math.random() * cellW,
          top: r * cellH + Math.random() * cellH,
          size: 1 + Math.random() * 2.5,
          color: STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)],
          delay: Math.random() * 4,
          duration: 2 + Math.random() * 3,
        });
      }
    }
    return result;
  }, []);

  function handleSend() {
    if (!input.trim()) return;
    setMessages((prev) => [...prev, { id: Date.now().toString(), role: "user", text: input }]);
    setInput("");
  }

  // Two layouts: CLOSED = small idle panel on the right (always visible, shows stars).
  // OPEN = full-screen overlay covering the entire dashboard.
  const containerClass = open
    ? "fixed inset-0 h-full w-full bg-slate-950 z-50 flex flex-col overflow-hidden"
    : "fixed top-[112px] sm:top-16 bottom-0 right-0 w-[360px] max-w-[360px] bg-slate-950 border-l border-slate-800 z-30 flex flex-col overflow-hidden cursor-pointer";

  return (
    <aside className={containerClass} onClick={!open ? onOpen : undefined}>
      {/* Background layer: starfield fills the WHOLE panel, always rendered */}
      <div className={`star-field ${paused ? "paused" : ""}`}>
        {stars.map((s) => (
          <span
            key={s.id}
            className="star"
            style={{
              left: s.left + "%",
              top: s.top + "%",
              width: s.size + "px",
              height: s.size + "px",
              background: s.color,
              boxShadow: `0 0 ${s.size * 2}px ${s.color}`,
              animationDelay: s.delay + "s",
              animationDuration: s.duration + "s",
            }}
          />
        ))}
      </div>

      {/* Background layer: scrolling vertical text, always rendered */}
      <div className="absolute inset-0 flex items-start justify-end pr-6 overflow-hidden pointer-events-none">
        <div className={`welcome-scroll-track relative z-10 ${paused ? "paused" : ""}`}>
          {[0, 1].map((copy) => (
            <span
              key={copy}
              className="welcome-vertical-text block text-2xl font-light tracking-wide text-cyan-300/90"
              style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
            >
              {GREETING_TEXT}
            </span>
          ))}
        </div>
      </div>

      {/* Foreground UI: only rendered when open */}
      {open && (
        <div className="relative z-10 flex flex-col h-full" onClick={(e) => e.stopPropagation()}>
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-800/60 bg-slate-950/40 backdrop-blur-sm px-4 py-3 shrink-0">
            <span className="text-sm font-semibold text-white">KHOEM-AI</span>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setPaused((p) => !p)}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-sky-500/80 text-white hover:bg-sky-400 transition-colors"
                aria-label={paused ? "Resume animation" : "Pause animation"}
              >
                {paused ? <Play size={12} /> : <Pause size={12} />}
              </button>
              <button
                onClick={onClose}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-sky-500/80 text-white hover:bg-sky-400 transition-colors"
                aria-label="Close"
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {/* Chat stream */}
          <div className="flex-1 overflow-y-auto p-4 pr-16">
            <div className="flex flex-col gap-3">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`rounded-xl px-4 py-2 text-sm max-w-[85%] ${
                    m.role === "user" ? "ml-auto bg-sky-500 text-white" : "bg-emerald-800 text-emerald-50"
                  }`}
                >
                  {m.text}
                </div>
              ))}
            </div>
          </div>

          {/* Input */}
          <div className="border-t border-slate-800/60 bg-slate-950/40 backdrop-blur-sm p-3 shrink-0">
            <div className="flex items-center gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Hi! Feel free to ask me anything..."
                className="flex-1 rounded-xl border border-slate-700 bg-slate-900/60 px-4 py-4 text-base text-white placeholder:text-slate-400 focus:border-brand-500 focus:outline-none"
              />
              <button
                onClick={handleSend}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500 text-white transition-colors hover:bg-brand-600 shrink-0"
              >
                <Send size={15} />
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .star-field { position: absolute; inset: 0; pointer-events: none; z-index: 0; }
        .star { position: absolute; border-radius: 9999px; animation-name: twinkle; animation-iteration-count: infinite; animation-timing-function: ease-in-out; }
        .star-field.paused .star { animation-play-state: paused; }
        @keyframes twinkle { 0%, 100% { opacity: 0.15; } 50% { opacity: 1; } }
        .welcome-vertical-text { writing-mode: vertical-rl; text-orientation: upright; white-space: nowrap; }
        .welcome-scroll-track { display: inline-block; animation: welcomeScrollUp 40s linear infinite; will-change: transform; }
        .welcome-scroll-track.paused { animation-play-state: paused; }
        @keyframes welcomeScrollUp { 0% { transform: translateY(0%); } 100% { transform: translateY(-50%); } }
      `}</style>
    </aside>
  );
}
