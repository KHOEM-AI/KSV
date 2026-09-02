import React from 'react';

interface ProjectSwitcherProps {
  current?: 'KSV' | 'CAI' | 'AI';
}

const PROJECTS = [
  { key: 'KSV', label: 'KSV', url: 'http://localhost:5173' },
  { key: 'CAI', label: 'CAI', url: 'http://localhost:5174' },
  { key: 'AI',  label: 'AI',  url: 'http://localhost:5175' },
] as const;

export default function ProjectSwitcher({ current = 'KSV' }: ProjectSwitcherProps) {
  return (
    <div style={{ display: 'flex', gap: 8, padding: '4px 0' }}>
      {PROJECTS.map((p) => (
        <a
          key={p.key}
          href={p.url}
          style={{
            flex: 1, padding: '8px 0', borderRadius: 8, textAlign: 'center',
            textDecoration: 'none', fontWeight: 700, fontSize: 13, color: '#fff',
            background: current === p.key ? '#2563eb' : '#374151',
          }}
        >
          {p.label}
        </a>
      ))}
    </div>
  );
}
