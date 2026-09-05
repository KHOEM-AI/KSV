import React from 'react';

const LINKS = [
  { url: 'http://localhost:5176', text: 'TV AI KHOEM-AI' },
  { url: 'http://localhost:5174', text: 'Scan Overview & Count', sub: 'CAI' },
];

export default function ProjectSwitcher() {
  return (
    <div style={{ padding: '0 12px 12px', display: 'flex', flexDirection: 'column', gap: 6 }}>
      {LINKS.map((l) => (
        <a
          key={l.url}
          href={l.url}
          style={{
            display: 'block',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: 6,
            padding: '10px 14px',
            textAlign: 'center',
            color: '#e8f0ff',
            textDecoration: 'none',
          }}
        >
          <div style={{ fontWeight: 700 }}>{l.text}</div>
          {l.sub && <div style={{ fontSize: 12, opacity: 0.8 }}>{l.sub}</div>}
        </a>
      ))}
    </div>
  );
}
