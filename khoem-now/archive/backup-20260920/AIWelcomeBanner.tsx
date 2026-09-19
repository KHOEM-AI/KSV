import React, { useMemo, useState } from "react";
import { Pause, Play, Send, X } from "lucide-react";
import { interpretIntent } from "../core/ai/khoem-ai-brain";
import { guardRespectfulResponse } from "../core/ai/khoem-ai-conduct";

type SupportedLanguage = "en" | "zh" | "km";
type MessageRole = "user" | "ai";

interface Message {
  id: string;
  role: MessageRole;
  text: string;
  language: SupportedLanguage;
}

interface AIWelcomeBannerProps {
  open: boolean;
  onClose: () => void;
  onOpen?: () => void;
}

interface LocalizedCopy {
  name: string;
  greeting: string;
  question: string;
  unknown: string;
  placeholder: string;
  send: string;
  pause: string;
  resume: string;
  close: string;
  title: string;
}

const COPY: Record<SupportedLanguage, LocalizedCopy> = {
  en: {
    name: "English",
    greeting:
      "Hello. I am KHOEM-AI. I can help explain your system, devices, status, and safe actions.",
    question:
      "Sure. Ask me directly. I will explain what is verified and clearly disclose what is not verified.",
    unknown:
      "I do not understand that request yet. Try asking about a device, system status, safety, or an action.",
    placeholder: "Ask KHOEM-AI anything...",
    send: "Send message",
    pause: "Pause animation",
    resume: "Resume animation",
    close: "Close KHOEM-AI",
    title: "KHOEM-AI assistant",
  },
  zh: {
    name: "中文",
    greeting:
      "您好。我是 KHOEM-AI。我可以帮助您了解系统、设备、状态以及安全操作。",
    question:
      "可以。您可以直接提问。我会说明哪些信息已经验证，并清楚说明哪些信息尚未验证。",
    unknown:
      "我暂时还无法理解这个请求。您可以询问设备、系统状态、安全或想执行的操作。",
    placeholder: "请向 KHOEM-AI 提问...",
    send: "发送消息",
    pause: "暂停动画",
    resume: "继续动画",
    close: "关闭 KHOEM-AI",
    title: "KHOEM-AI 助手",
  },
  km: {
    name: "ខ្មែរ",
    greeting:
      "សួស្តីបង។ ខ្ញុំជា KHOEM-AI។ ខ្ញុំអាចជួយពន្យល់អំពីប្រព័ន្ធ ឧបករណ៍ ស្ថានភាព និងសកម្មភាពដែលមានសុវត្ថិភាព។",
    question:
      "បានបង។ បងអាចសួរខ្ញុំដោយផ្ទាល់បាន។ ខ្ញុំនឹងប្រាប់ថាព័ត៌មានណាត្រូវបានផ្ទៀងផ្ទាត់ ហើយបញ្ជាក់ឱ្យច្បាស់នៅពេលព័ត៌មានណាមិនទាន់បានផ្ទៀងផ្ទាត់។",
    unknown:
      "សុំទោសបង ខ្ញុំមិនទាន់យល់សំណួរនេះទេ។ បងអាចសួរអំពីឧបករណ៍ ស្ថានភាពប្រព័ន្ធ សុវត្ថិភាព ឬសកម្មភាពដែលបងចង់ធ្វើ។",
    placeholder: "សួរ KHOEM-AI បានគ្រប់សំណួរ...",
    send: "ផ្ញើសារ",
    pause: "ផ្អាកចលនា",
    resume: "បន្តចលនា",
    close: "បិទ KHOEM-AI",
    title: "ជំនួយការ KHOEM-AI",
  },
};

const GREETING_TEXT = [
  "Hello. Welcome to KHOEM-AI.",
  "您好，欢迎使用 KHOEM-AI。",
  "សួស្តីបង។ សូមស្វាគមន៍មកកាន់ KHOEM-AI។",
].join("  •  ");

const STAR_COLORS = [
  "#67e8f9",
  "#c084fc",
  "#f472b6",
  "#fbbf24",
  "#34d399",
  "#ffffff",
  "#60a5fa",
];

function detectLanguage(text: string): SupportedLanguage {
  if (/[ក-៿]/.test(text)) {
    return "km";
  }

  if (/[㐀-䶿一-鿿]/.test(text)) {
    return "zh";
  }

  return "en";
}

function getIntentText(language: SupportedLanguage, intent: string): string {
  if (intent === "greeting") {
    return COPY[language].greeting;
  }

  if (intent === "question" || intent === "status_request") {
    return COPY[language].question;
  }

  return COPY[language].unknown;
}

function makeMessageId(): string {
  return Date.now().toString() + "-" + Math.random().toString(36).slice(2);
}

export function AIWelcomeBanner({ open, onClose, onOpen }: AIWelcomeBannerProps) {
  const [paused, setPaused] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);

  const stars = useMemo(() => {
    const columns = 8;
    const rows = 20;
    const result: Array<{
      id: number;
      left: number;
      top: number;
      size: number;
      color: string;
      delay: number;
      duration: number;
    }> = [];

    let id = 0;

    for (let row = 0; row < rows; row += 1) {
      for (let column = 0; column < columns; column += 1) {
        const cellWidth = 100 / columns;
        const cellHeight = 100 / rows;

        result.push({
          id,
          left: column * cellWidth + Math.random() * cellWidth,
          top: row * cellHeight + Math.random() * cellHeight,
          size: 1 + Math.random() * 2.5,
          color: STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)],
          delay: Math.random() * 4,
          duration: 2 + Math.random() * 3,
        });

        id += 1;
      }
    }

    return result;
  }, []);

  function handleSend() {
    const text = input.trim();

    if (!text) {
      return;
    }

    const language = detectLanguage(text);
    const userMessage: Message = {
      id: makeMessageId(),
      role: "user",
      text,
      language,
    };

    let intent = "unknown";

    try {
      const result = interpretIntent({ text });
      intent = typeof result?.intent === "string" ? result.intent : "unknown";
    } catch {
      intent = "unknown";
    }

    const respectfulResponse = guardRespectfulResponse(text, language);
    const responseText = respectfulResponse || getIntentText(language, intent);

    const aiMessage: Message = {
      id: makeMessageId(),
      role: "ai",
      text: responseText,
      language,
    };

    setMessages((previous) => [...previous, userMessage, aiMessage]);
    setInput("");
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    handleSend();
  }

  const containerClass = open
    ? "fixed inset-0 z-50 flex h-full w-full flex-col overflow-hidden bg-slate-950"
    : "fixed bottom-0 right-0 top-[112px] z-30 flex w-[360px] max-w-[360px] cursor-pointer flex-col overflow-hidden border-l border-slate-800 bg-slate-950 sm:top-16";

  return (
    <aside
      className={containerClass}
      onClick={!open ? onOpen : undefined}
      aria-label={COPY.en.title}
    >
      <div className={["star-field", paused ? "paused" : ""].join(" ")} aria-hidden="true">
        {stars.map((star) => (
          <span
            key={star.id}
            className="star"
            style={{
              left: star.left + "%",
              top: star.top + "%",
              width: star.size + "px",
              height: star.size + "px",
              background: star.color,
              boxShadow: "0 0 " + star.size * 2 + "px " + star.color,
              animationDelay: star.delay + "s",
              animationDuration: star.duration + "s",
            }}
          />
        ))}
      </div>

      <div
        className="pointer-events-none absolute inset-0 flex items-start justify-end overflow-hidden pr-2 sm:pr-6"
        aria-hidden="true"
      >
        <div
          className={["welcome-scroll-track", "relative z-10", paused ? "paused" : ""].join(" ")}
        >
          {[0, 1].map((copy) => (
            <span
              key={copy}
              className="welcome-vertical-text block text-base font-light tracking-wide text-cyan-300/90 sm:text-2xl"
              style={{ fontFamily: "Inter, system-ui, sans-serif" }}
            >
              {GREETING_TEXT}
            </span>
          ))}
        </div>
      </div>

      {open && (
        <div className="relative z-10 flex h-full flex-col" onClick={(event) => event.stopPropagation()}>
          <div className="flex shrink-0 items-center justify-between border-b border-slate-800/60 bg-slate-950/40 px-4 py-3 backdrop-blur-sm">
            <div>
              <span className="text-sm font-semibold text-white">KHOEM-AI</span>
              <p className="mt-0.5 text-xs text-slate-400">English • 中文 • ខ្មែរ</p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setPaused((value) => !value)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-sky-500/80 text-white transition-colors hover:bg-sky-400"
                aria-label={paused ? COPY.en.resume : COPY.en.pause}
                title={paused ? COPY.en.resume : COPY.en.pause}
              >
                {paused ? <Play size={12} /> : <Pause size={12} />}
              </button>

              <button
                type="button"
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-sky-500/80 text-white transition-colors hover:bg-sky-400"
                aria-label={COPY.en.close}
                title={COPY.en.close}
              >
                <X size={14} />
              </button>
            </div>
          </div>

          <div
            className="flex-1 overflow-y-auto p-4 pr-10 sm:pr-16"
            aria-live="polite"
            aria-label="KHOEM-AI conversation"
          >
            <div className="flex flex-col gap-3">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={[
                    "w-fit max-w-[85%] rounded-xl px-4 py-2 text-sm",
                    message.role === "user"
                      ? "ml-auto bg-sky-500 text-white"
                      : "border border-sky-500/50 bg-sky-500/40 text-sky-50",
                  ].join(" ")}
                  lang={message.language}
                >
                  {message.text.length > 500 ? message.text.slice(0, 500) + "..." : message.text}
                </div>
              ))}
            </div>
          </div>

          <div className="shrink-0 border-t border-slate-800/60 bg-slate-950/40 p-3 backdrop-blur-sm">
            <form className="flex items-center gap-2" onSubmit={handleSubmit}>
              <input
                value={input}
                maxLength={2000}
                onChange={(event) => setInput(event.target.value)}
                placeholder={COPY[detectLanguage(input)].placeholder}
                aria-label={COPY[detectLanguage(input)].placeholder}
                className="flex-1 rounded-xl border border-slate-700 bg-slate-900/60 px-4 py-4 text-base text-white placeholder:text-slate-400 focus:border-brand-500 focus:outline-none"
              />

              <button
                type="submit"
                disabled={!input.trim()}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-500 text-white transition-colors hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
                aria-label={COPY[detectLanguage(input)].send}
                title={COPY[detectLanguage(input)].send}
              >
                <Send size={15} />
              </button>
            </form>
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
