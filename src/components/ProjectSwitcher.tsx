import React from 'react';

const LINKS = [
  { url: 'http://localhost:5176', text: 'TV AI KHOEM-AI' },
  { url: 'http://localhost:5174', text: 'Scan Overview & Count', sub: 'CAI' },
];

const linkBoxStyle: React.CSSProperties = {
  display: 'block',
  border: '1px solid rgba(255,255,255,0.2)',
  borderRadius: 6,
  padding: '10px 14px',
  textAlign: 'center',
  color: '#e8f0ff',
  textDecoration: 'none',
  width: '100%',
  background: 'transparent',
  cursor: 'pointer',
  font: 'inherit',
};

export default function ProjectSwitcher({ onOpenAIChat }: { onOpenAIChat?: () => void }) {
  return (
    <div style={{ padding: '0 12px 12px', display: 'flex', flexDirection: 'column', gap: 6 }}>
      {LINKS.map((l) => (
        <a key={l.url} href={l.url} style={linkBoxStyle}>
          <div style={{ fontWeight: 700 }}>{l.text}</div>
          {l.sub && <div style={{ fontSize: 12, opacity: 0.8 }}>{l.sub}</div>}
        </a>
      ))}
      {onOpenAIChat && (
        <button onClick={onOpenAIChat} style={linkBoxStyle}>
          <div style={{ fontWeight: 700 }}>AI Assistant</div>
        </button>
      )}
    </div>
  );
}
