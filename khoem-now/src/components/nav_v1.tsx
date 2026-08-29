import { type ReactNode } from 'react';
import {
  LayoutDashboard,
  Map,
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

// ======================================================================
// KSV — Navigation registry (Domain #1, part 2: Language)
//
// This file used to hold hardcoded English strings ("Dashboard",
// "Overview", ...). It now holds translation KEYS only — the actual
// text lives in src/i18n/translations.ts, one place per language.
// App.tsx calls t(group.labelKey) / t(item.labelKey) / t(meta.titleKey)
// when rendering, so the sidebar and header follow whatever language
// is active without this file ever changing again.
//
// 2026-08-XX: added 'map' (README Section 44 — Interactive GIS Map),
// placed in devicesControl group next to devices/controls, matching
// the "Devices | Fleet | Map" grouping in README Section 43.1.
// ======================================================================

export type ViewId =
  | 'dashboard'
  | 'devices'
  | 'map'
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
  labelKey: string;
  items: { id: ViewId; labelKey: string; icon: ReactNode; badge?: string }[];
}

export const navGroups: NavGroup[] = [
  {
    labelKey: 'navgroup.overview',
    items: [
      { id: 'dashboard', labelKey: 'nav.dashboard', icon: <LayoutDashboard size={18} /> },
    ],
  },
  {
    labelKey: 'navgroup.devicesControl',
    items: [
      { id: 'devices', labelKey: 'nav.devices', icon: <Cpu size={18} /> },
      { id: 'map', labelKey: 'nav.map', icon: <Map size={18} /> },
      { id: 'controls', labelKey: 'nav.controls', icon: <SlidersHorizontal size={18} /> },
      { id: 'protocols', labelKey: 'nav.protocols', icon: <Radio size={18} /> },
      { id: 'gateway', labelKey: 'nav.gateway', icon: <Network size={18} /> },
    ],
  },
  {
    labelKey: 'navgroup.securitySafety',
    items: [
      { id: 'security', labelKey: 'nav.security', icon: <ShieldCheck size={18} /> },
      { id: 'safety', labelKey: 'nav.safety', icon: <ShieldAlert size={18} /> },
      { id: 'audit', labelKey: 'nav.audit', icon: <ScrollText size={18} /> },
    ],
  },
  {
    labelKey: 'navgroup.organization',
    items: [
      { id: 'organization', labelKey: 'nav.organization', icon: <Building2 size={18} /> },
      { id: 'international', labelKey: 'nav.international', icon: <Globe2 size={18} /> },
      { id: 'certificates', labelKey: 'nav.certificates', icon: <GraduationCap size={18} /> },
      { id: 'settings', labelKey: 'nav.settings', icon: <Settings size={18} /> },
    ],
  },
];

// titleKey reuses the same key as the sidebar label (the page header
// says the same name as the menu item that opened it — one word to
// translate instead of two). subtitleKey is its own key since the
// description text is unique to each page.
export const viewMeta: Record<ViewId, { titleKey: string; subtitleKey: string }> = {
  dashboard: { titleKey: 'nav.dashboard', subtitleKey: 'view.dashboard.subtitle' },
  devices: { titleKey: 'nav.devices', subtitleKey: 'view.devices.subtitle' },
  map: { titleKey: 'nav.map', subtitleKey: 'view.map.subtitle' },
  controls: { titleKey: 'nav.controls', subtitleKey: 'view.controls.subtitle' },
  protocols: { titleKey: 'nav.protocols', subtitleKey: 'view.protocols.subtitle' },
  gateway: { titleKey: 'nav.gateway', subtitleKey: 'view.gateway.subtitle' },
  security: { titleKey: 'nav.security', subtitleKey: 'view.security.subtitle' },
  safety: { titleKey: 'nav.safety', subtitleKey: 'view.safety.subtitle' },
  organization: { titleKey: 'nav.organization', subtitleKey: 'view.organization.subtitle' },
  international: { titleKey: 'nav.international', subtitleKey: 'view.international.subtitle' },
  audit: { titleKey: 'nav.audit', subtitleKey: 'view.audit.subtitle' },
  certificates: { titleKey: 'nav.certificates', subtitleKey: 'view.certificates.subtitle' },
  settings: { titleKey: 'nav.settings', subtitleKey: 'view.settings.subtitle' },
};
