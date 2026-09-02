import React from 'react';

interface ProjectSwitcherProps {
  current?: 'KSV' | 'AI';
}

export default function ProjectSwitcher({ current = 'KSV' }: ProjectSwitcherProps) {
  return (
    <div style={{ display: 'flex', gap: 8, padding: '4px 0' }}>
      <a
        href="http://localhost:5173"
        style={{
          flex: 1, padding: '8px 0', borderRadius: 8, textAlign: 'center',
          textDecoration: 'none', fontWeight: 700, fontSize: 13, color: '#fff',
          background: current === 'KSV' ? '#2563eb' : '#374151',
        }}
      >
        KSV
      </a>
      <a
        href="http://localhost:5174"
        style={{
          flex: 1, padding: '8px 0', borderRadius: 8, textAlign: 'center',
          textDecoration: 'none', fontWeight: 700, fontSize: 13, color: '#fff',
          background: current === 'AI' ? '#2563eb' : '#374151',
        }}
      >
        AI
      </a>
    </div>
  );
}
