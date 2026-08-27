import { type ReactNode } from 'react';
import {
  type DeviceStatus,
} from '@/data/domain';

export function Panel({
  children,
  className = '',
  hover = false,
}: {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}) {
  return (
    <div className={`panel ${hover ? 'panel-hover' : ''} ${className}`}>
      {children}
    </div>
  );
}

export function SectionHeader({
  title,
  subtitle,
  icon,
  action,
}: {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 mb-5">
      <div className="flex items-start gap-3">
        {icon && (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-ink-700 bg-ink-800/60 text-brand-400">
            {icon}
          </div>
        )}
        <div>
          <h2 className="text-lg font-semibold text-white">{title}</h2>
          {subtitle && <p className="mt-0.5 text-sm text-ink-400">{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}

export function StatusDot({
  status,
  label,
}: {
  status: DeviceStatus | 'active' | 'degraded' | 'offline' | 'online' | 'warning' | 'maintenance' | 'expired' | 'revoked' | 'success' | 'denied' | 'error' | 'verified' | 'pending';
  label?: string;
}) {
  const map: Record<string, string> = {
    online: 'bg-success-500',
    active: 'bg-success-500',
    success: 'bg-success-500',
    verified: 'bg-success-500',
    warning: 'bg-warning-500',
    maintenance: 'bg-brand-400',
    pending: 'bg-warning-500',
    degraded: 'bg-warning-500',
    offline: 'bg-ink-500',
    expired: 'bg-ink-500',
    revoked: 'bg-danger-500',
    denied: 'bg-danger-500',
    error: 'bg-danger-500',
  };
  const color = map[status] ?? 'bg-ink-500';
  const pulse = status === 'online' || status === 'active' || status === 'warning';
  return (
    <span className="inline-flex items-center gap-2">
      <span className="relative flex h-2 w-2">
        {pulse && (
          <span className={`absolute inline-flex h-full w-full rounded-full ${color} opacity-75 animate-pulse-ring`} />
        )}
        <span className={`relative inline-flex h-2 w-2 rounded-full ${color}`} />
      </span>
      {label && <span className="text-xs font-medium text-ink-300">{label}</span>}
    </span>
  );
}

export function Badge({
  children,
  variant = 'neutral',
}: {
  children: ReactNode;
  variant?: 'neutral' | 'brand' | 'success' | 'warning' | 'danger' | 'accent';
}) {
  const variants: Record<string, string> = {
    neutral: 'bg-ink-800 text-ink-300 border-ink-700',
    brand: 'bg-brand-500/15 text-brand-300 border-brand-500/30',
    success: 'bg-success-500/15 text-success-400 border-success-500/30',
    warning: 'bg-warning-500/15 text-warning-400 border-warning-500/30',
    danger: 'bg-danger-500/15 text-danger-400 border-danger-500/30',
    accent: 'bg-accent-500/15 text-accent-400 border-accent-500/30',
  };
  return (
    <span className={`chip border ${variants[variant]}`}>
      {children}
    </span>
  );
}

export function StatCard({
  label,
  value,
  unit,
  icon,
  trend,
  trendUp,
  accent = 'brand',
}: {
  label: string;
  value: string | number;
  unit?: string;
  icon: ReactNode;
  trend?: string;
  trendUp?: boolean;
  accent?: 'brand' | 'success' | 'warning' | 'danger' | 'accent';
}) {
  const accents: Record<string, string> = {
    brand: 'text-brand-400 bg-brand-500/10',
    success: 'text-success-400 bg-success-500/10',
    warning: 'text-warning-400 bg-warning-500/10',
    danger: 'text-danger-400 bg-danger-500/10',
    accent: 'text-accent-400 bg-accent-500/10',
  };
  return (
    <Panel hover className="p-5 animate-fade-in">
      <div className="flex items-start justify-between">
        <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${accents[accent]}`}>
          {icon}
        </div>
        {trend && (
          <span className={`text-xs font-semibold ${trendUp ? 'text-success-400' : 'text-danger-400'}`}>
            {trendUp ? '↑' : '↓'} {trend}
          </span>
        )}
      </div>
      <div className="mt-4">
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-bold text-white tabular-nums">{value}</span>
          {unit && <span className="text-sm text-ink-400">{unit}</span>}
        </div>
        <p className="mt-1 text-sm text-ink-400">{label}</p>
      </div>
    </Panel>
  );
}

export function Sparkline({
  data,
  height = 48,
  color = '#2a9dff',
  fill = true,
}: {
  data: number[];
  height?: number;
  color?: string;
  fill?: boolean;
}) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const width = 100;
  const points = data
    .map((d, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - ((d - min) / range) * height;
      return `${x},${y}`;
    })
    .join(' ');
  const areaPoints = `0,${height} ${points} ${width},${height}`;
  const gradId = `spark-${color.replace('#', '')}`;
  return (
    <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className="w-full" style={{ height }}>
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {fill && <polygon points={areaPoints} fill={`url(#${gradId})`} />}
      <polyline points={points} fill="none" stroke={color} strokeWidth="1.5" vectorEffect="non-scaling-stroke" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

export function ProgressBar({
  value,
  max = 100,
  color = 'brand',
  size = 'md',
}: {
  value: number;
  max?: number;
  color?: 'brand' | 'success' | 'warning' | 'danger' | 'accent';
  size?: 'sm' | 'md';
}) {
  const pct = Math.min(100, (value / max) * 100);
  const colors: Record<string, string> = {
    brand: 'bg-brand-500',
    success: 'bg-success-500',
    warning: 'bg-warning-500',
    danger: 'bg-danger-500',
    accent: 'bg-accent-500',
  };
  return (
    <div className={`w-full rounded-full bg-ink-800 ${size === 'sm' ? 'h-1.5' : 'h-2'}`}>
      <div
        className={`h-full rounded-full ${colors[color]} transition-all duration-500`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export function Donut({
  segments,
  size = 120,
  thickness = 14,
  centerLabel,
  centerSub,
}: {
  segments: { value: number; color: string; label: string }[];
  size?: number;
  thickness?: number;
  centerLabel?: string;
  centerSub?: string;
}) {
  const total = segments.reduce((s, seg) => s + seg.value, 0) || 1;
  const radius = (size - thickness) / 2;
  const circ = 2 * Math.PI * radius;
  let offset = 0;
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#121829" strokeWidth={thickness} />
        {segments.map((seg, i) => {
          const len = (seg.value / total) * circ;
          const el = (
            <circle
              key={i}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={seg.color}
              strokeWidth={thickness}
              strokeDasharray={`${len} ${circ - len}`}
              strokeDashoffset={-offset}
              strokeLinecap="round"
            />
          );
          offset += len;
          return el;
        })}
      </svg>
      {centerLabel && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-bold text-white">{centerLabel}</span>
          {centerSub && <span className="text-[10px] text-ink-400">{centerSub}</span>}
        </div>
      )}
    </div>
  );
}

export function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <button
      onClick={onChange}
      className={`relative h-6 w-11 rounded-full transition-colors duration-200 ${checked ? 'bg-brand-500' : 'bg-ink-700'}`}
    >
      <span
        className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${checked ? 'translate-x-5' : ''}`}
      />
    </button>
  );
}
