import { useState } from 'react';
import { X, Sparkles, Send } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';

interface Message {
  id: string;
  role: 'user' | 'ai';
  text: string;
}

export function AIChatOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useLanguage();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);

  if (!open) return null;

  function handleSend() {
    if (!input.trim()) return;
    setMessages((prev) => [...prev, { id: Date.now().toString(), role: 'user', text: input }]);
    setInput('');
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-ink-950/95 backdrop-blur-sm animate-fade-in">
      <div className="flex items-center justify-between border-b border-ink-700 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-2">
          <Sparkles size={18} className="text-brand-400" />
          <div><p className="text-sm font-semibold text-white">KHOEM-AI</p><p className="text-[11px] text-ink-400">{t('aiChat.subtitle')}</p></div>
        </div>
        <button
          onClick={onClose}
          aria-label={t('common.close')}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-ink-700 bg-ink-850/60 text-ink-400 transition-colors hover:text-white"
        >
          <X size={17} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-ink-500">
            Start a conversation with KHOEM-AI
          </div>
        ) : (
          <div className="mx-auto flex max-w-2xl flex-col gap-3">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`rounded-xl px-4 py-2 text-sm ${
                  m.role === 'user' ? 'ml-auto bg-brand-500 text-white' : 'bg-ink-850 text-ink-200'
                } max-w-[80%]`}
              >
                {m.text}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="border-t border-ink-700 p-4 sm:p-6">
        <div className="mx-auto flex max-w-2xl items-center gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={t('common.search')}
            className="flex-1 rounded-xl border border-ink-700 bg-ink-850/60 px-4 py-2 text-sm text-white placeholder:text-ink-500 focus:border-brand-500 focus:outline-none"
          />
          <button
            onClick={handleSend}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500 text-white transition-colors hover:bg-brand-600"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
