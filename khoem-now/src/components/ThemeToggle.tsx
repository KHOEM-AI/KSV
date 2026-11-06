// Copyright (c) 2026 @KHOEM-AI. All rights reserved.
import { useState } from 'react';
import { getTheme, setTheme, type Theme } from '@/lib/theme';

const RAYS = [0, 45, 90, 135, 180, 225, 270, 315];
const pt = (deg: number, r: number) => {
  const a = (deg * Math.PI) / 180;
  return { x: +(r * Math.cos(a)).toFixed(2), y: +(r * Math.sin(a)).toFixed(2) };
};

export function ThemeToggle() {
  const [theme, set] = useState<Theme>(getTheme);
  const light = theme === 'light';
  const flip = () => {
    const next: Theme = light ? 'dark' : 'light';
    setTheme(next);
    set(next);
  };
  const fade = (on: boolean) => ({ opacity: on ? 1 : 0, transition: 'opacity .45s ease' });

  return (
    <button
      type="button"
      role="switch"
      aria-checked={light}
      onClick={flip}
      aria-label="ប្តូរទម្រង់ថ្ងៃ ឬយប់ · Day or night"
      title={light ? 'ទម្រង់ថ្ងៃ · Day' : 'ទម្រង់យប់ · Night'}
      style={{ background: 'none', border: 0, padding: 4, cursor: 'pointer', lineHeight: 0, borderRadius: 999 }}
    >
      <svg width="72" height="36" viewBox="0 0 72 36" aria-hidden="true" style={{ display: 'block' }}>
        <defs>
          <linearGradient id="ksvNight" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#0b1536" /><stop offset="1" stopColor="#1e2a5a" />
          </linearGradient>
          <linearGradient id="ksvDay" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#4fb8ff" /><stop offset="1" stopColor="#c4ebff" />
          </linearGradient>
          <radialGradient id="ksvSun" cx=".4" cy=".35" r=".8">
            <stop offset="0" stopColor="#fff3b0" /><stop offset="1" stopColor="#ffb300" />
          </radialGradient>
          <radialGradient id="ksvMoon" cx=".35" cy=".3" r=".9">
            <stop offset="0" stopColor="#ffffff" /><stop offset="1" stopColor="#c9d4f2" />
          </radialGradient>
          <mask id="ksvBite" maskUnits="userSpaceOnUse" x="-14" y="-14" width="28" height="28">
            <rect x="-14" y="-14" width="28" height="28" fill="#fff" />
            <circle cx="5.5" cy="-3.5" r="9" fill="#000" />
          </mask>
        </defs>

        <rect x="1" y="1" width="70" height="34" rx="17" fill="url(#ksvNight)" />
        <rect x="1" y="1" width="70" height="34" rx="17" fill="url(#ksvDay)" style={fade(light)} />

        <g fill="#fff" style={fade(!light)}>
          <circle cx="40" cy="10" r="1" /><circle cx="47" cy="23" r=".8" />
          <circle cx="55" cy="12" r="1.2" /><circle cx="61" cy="24" r=".8" />
          <circle cx="34" cy="26" r=".7" /><circle cx="64" cy="9" r=".7" />
        </g>
        <g fill="#fff" style={fade(light)}>
          <ellipse cx="22" cy="23" rx="8" ry="3.6" opacity=".95" />
          <ellipse cx="29" cy="19.5" rx="6" ry="4" opacity=".95" />
          <ellipse cx="15" cy="19" rx="4.5" ry="2.6" opacity=".9" />
        </g>

        <rect x="1" y="1" width="70" height="34" rx="17" fill="none"
          stroke={light ? 'rgba(0,70,140,.30)' : 'rgba(255,255,255,.22)'} />

        <g style={{ transform: `translate(${light ? 54 : 18}px, 18px)`, transition: 'transform .45s cubic-bezier(.4,0,.2,1)' }}>
          <circle r="11" fill="url(#ksvMoon)" mask="url(#ksvBite)" style={fade(!light)} />
          <g style={fade(light)}>
            <circle r="8.5" fill="url(#ksvSun)" />
            {RAYS.map((d) => {
              const a = pt(d, 11.5), b = pt(d, 14.5);
              return <line key={d} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#ffc61a" strokeWidth="1.8" strokeLinecap="round" />;
            })}
          </g>
        </g>
      </svg>
    </button>
  );
}
