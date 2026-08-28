import { type ReactNode } from 'react';
import {
  LayoutDashboard,
  Cpu,
  SlidersHorizontal,
  ShieldCheck,
  ShieldAlert,
  Radio,
  Network,
  Building2,
  Globe2,
  ScrollText,
  GraduationCap,
  Settings,
} from 'lucide-react';

export type ViewId =
  | 'dashboard'
  | 'devices'
  | 'controls'
  | 'security'
  | 'safety'
  | 'protocols'
  | 'gateway'
  | 'organization'
  | 'international'
  | 'audit'
  | 'certificates'
  | 'settings';

export interface NavGroup {
  label: string;
  items: { id: ViewId; label: string; icon: ReactNode; badge?: string }[];
}

export const navGroups: NavGroup[] = [
  {
    label: 'Overview',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    ],
  },
  {
    label: 'Devices & Control',
    items: [
      { id: 'devices', label: 'Device Management', icon: <Cpu size={18} /> },
      { id: 'controls', label: 'Controls', icon: <SlidersHorizontal size={18} /> },
      { id: 'protocols', label: 'Protocols', icon: <Radio size={18} /> },
      { id: 'gateway', label: 'Edge Gateways', icon: <Network size={18} /> },
    ],
  },
  {
    label: 'Security & Safety',
    items: [
      { id: 'security', label: 'Security Status', icon: <ShieldCheck size={18} /> },
      { id: 'safety', label: 'Safety Controls', icon: <ShieldAlert size={18} /> },
      { id: 'audit', label: 'Audit Log', icon: <ScrollText size={18} /> },
    ],
  },
  {
    label: 'Organization',
    items: [
      { id: 'organization', label: 'Organization', icon: <Building2 size={18} /> },
      { id: 'international', label: 'International', icon: <Globe2 size={18} /> },
      { id: 'certificates', label: 'Certificates', icon: <GraduationCap size={18} /> },
      { id: 'settings', label: 'Settings', icon: <Settings size={18} /> },
    ],
  },
];

export const viewMeta: Record<ViewId, { title: string; subtitle: string }> = {
  dashboard: { title: 'Operations Dashboard', subtitle: 'Real-time platform overview across all sites' },
  devices: { title: 'Device Management', subtitle: 'Capability registry and device health monitoring' },
  controls: { title: 'Device Controls', subtitle: 'Live control panel for connected devices' },
  protocols: { title: 'Protocol Adapters', subtitle: 'Bluetooth, Wi-Fi, MQTT, IR, and Zigbee abstraction layer' },
  gateway: { title: 'Edge Gateways', subtitle: 'Local network discovery and offline mode status' },
  security: { title: 'Security Status', subtitle: 'Authentication, sessions, and access audit' },
  safety: { title: 'Safety Controls', subtitle: 'Independent safety rules engine for doors, vehicles, and industrial tools' },
  organization: { title: 'Organization', subtitle: 'Company hierarchy and policy-based access control' },
  international: { title: 'International', subtitle: '195-country support, localizations, and timezones' },
  audit: { title: 'Audit Log', subtitle: 'Immutable record of all platform events' },
  certificates: { title: 'Certificates', subtitle: 'Sololearn certification showcase and verification' },
  settings: { title: 'Settings', subtitle: 'Platform configuration and preferences' },
};
