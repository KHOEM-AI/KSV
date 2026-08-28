import { useEffect, useRef, useState } from 'react';
import { Languages, Check } from 'lucide-react';
import { LANGUAGES } from '@/i18n/translations';
import { useLanguage } from '@/i18n/LanguageContext';

// ======================================================================
// KSV — Language Selector (Domain #1, part 2: Language)
//
// Interaction:
//   1. Button shows the CURRENT language (flag + native name).
//   2. Tap → panel drops open with a 3D perspective flip (rotateX),
//      like a flap opening downward from the button's top edge.
//   3. Pick a language → the button itself does a quick 3D flip
//      (rotateY 180°) as its label swaps to the new language, then
//      settles — a visible, physical "the app just changed" moment.
//   4. That choice calls setLanguage() from LanguageContext, which is
//      the single source every screen reads from — so the whole app
//      re-renders in the new language at the same moment.
// ======================================================================

export default function LanguageSelector() {
  const { language, setLanguage, t, dir } = useLanguage();
  const [open, setOpen] = useState(false);
  const [flipping, setFlipping] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const current = LANGUAGES.find((l) => l.code === language) ?? LANGUAGES[0];

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  function choose(code: typeof language) {
    if (code === language) {
      setOpen(false);
      return;
    }
    setFlipping(true);
    setOpen(false);
    // Swap the underlying language at the midpoint of the flip, so the
    // button appears to reveal the new language as it turns — not just
    // pop instantly after the animation.
    window.setTimeout(() => setLanguage(code), 150);
    window.setTimeout(() => setFlipping(false), 300);
  }

  return (
    <div ref={ref} className="relative" style={{ perspective: '800px' }}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t('intl.language')}
        className={[
          'flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2',
          'text-sm text-slate-100 hover:bg-white/[0.08] transition-colors',
          '[transform-style:preserve-3d] transition-transform duration-300 ease-out',
        ].join(' ')}
        style={{ transform: flipping ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
      >
        <span
          className="inline-block [backface-visibility:hidden]"
          style={{ transform: flipping ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
        >
          <span className="text-base leading-none mr-1.5">{current.flag}</span>
          {current.nativeName}
        </span>
        <Languages size={14} className="text-slate-500" />
      </button>

      {open && (
        <div
          role="listbox"
          className={[
            'absolute z-50 mt-2 w-56 origin-top rounded-xl border border-white/10',
            'bg-ink-900/95 backdrop-blur-sm shadow-2xl shadow-black/50 overflow-hidden',
            '[transform-style:preserve-3d] animate-[ksv-flip-open_220ms_ease-out]',
            dir === 'rtl' ? 'right-0' : 'left-0',
          ].join(' ')}
        >
          <p className="px-3 pt-3 pb-2 text-xs font-medium text-slate-500 uppercase tracking-wide">
            {t('intl.chooseLanguage')}
          </p>
          <ul className="max-h-72 overflow-y-auto pb-1">
            {LANGUAGES.map((l) => (
              <li key={l.code}>
                <button
                  role="option"
                  aria-selected={l.code === language}
                  onClick={() => choose(l.code)}
                  className="w-full flex items-center justify-between gap-2 px-3 py-2 text-sm text-slate-200 hover:bg-white/[0.06] transition-colors"
                >
                  <span className="flex items-center gap-2 min-w-0">
                    <span className="text-base leading-none">{l.flag}</span>
                    <span className="truncate">{l.nativeName}</span>
                    <span className="text-xs text-slate-500 truncate">{l.englishName}</span>
                  </span>
                  {l.code === language && <Check size={14} className="text-sky-400 shrink-0" />}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Keyframes for the dropdown's 3D flip-open. Tailwind's config
          doesn't need editing — this is scoped to this component. */}
      <style>{`
        @keyframes ksv-flip-open {
          from { transform: rotateX(-90deg); opacity: 0; }
          to   { transform: rotateX(0deg);   opacity: 1; }
        }
      `}</style>
    </div>
  );
}
