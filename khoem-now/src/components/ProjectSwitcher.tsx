import React from 'react';

interface ProjectSwitcherProps {
  current?: 'KSV' | 'AI' | 'CAI';
}

const LINKS: Record<'KSV' | 'AI' | 'CAI', { url: string; label: string }> = {
  KSV: { url: 'http://localhost:5173', label: 'KSV' },
  AI:  { url: 'http://localhost:5175', label: 'TV AI KHOEM-AI' },
  CAI: { url: 'http://localhost:5176', label: 'CAI · ស្គេនទូទៅ & វិភាគ' },
};

export default function ProjectSwitcher({ current = 'KSV' }: ProjectSwitcherProps) {
  const others = (Object.keys(LINKS) as (keyof typeof LINKS)[]).filter((key) => key !== current);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '4px 0' }}>
      {others.map((key) => (
        <a
          key={key}
          href={LINKS[key].url}
          style={{
            width: '100%', padding: '10px 12px', borderRadius: 10, textAlign: 'center',
            textDecoration: 'none', fontWeight: 600, fontSize: 13, color: '#94a3b8',
            background: '#111827',
            border: '1px solid rgba(56,189,248,0.35)',
            boxSizing: 'border-box',
          }}
        >
          {LINKS[key].label}
        </a>
      ))}
    </div>
  );
}
