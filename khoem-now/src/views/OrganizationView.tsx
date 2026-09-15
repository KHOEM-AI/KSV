// src/views/OrganizationView.tsx
import { Building2, ChevronRight, Users, Cpu, Shield } from 'lucide-react';
import { Panel, SectionHeader, Badge, ProgressBar } from '@/components/ui';
import { orgTree, type OrgNode } from '@/data/domain';
import { useLanguage } from '@/i18n/LanguageContext';

const typeKey: Record<string, string> = {
  company: 'view.organization.type.company',
  site: 'view.organization.type.site',
  building: 'view.organization.type.building',
  floor: 'view.organization.type.floor',
};

const typeVariant: Record<string, 'brand' | 'accent' | 'success' | 'neutral'> = {
  company: 'brand',
  site: 'accent',
  building: 'success',
  floor: 'neutral',
};

function buildTree(nodes: OrgNode[], parentId?: string, depth = 0): OrgNode[] {
  return nodes
    .filter((n) => n.parentId === parentId)
    .flatMap((n) => [n, ...buildTree(nodes, n.id, depth + 1)]);
}

// Data below is illustrative UI content, not domain data — kept as
// translation-key references so labels localize with everything else.
const accessPolicies = [
  { nameKey: 'view.organization.policy.hqStrict', scopeKey: 'view.organization.site.frankfurt', rules: 24, coverage: 100 },
  { nameKey: 'view.organization.policy.dcCritical', scopeKey: 'view.organization.site.singapore', rules: 31, coverage: 100 },
  { nameKey: 'view.organization.policy.fabCleanroom', scopeKey: 'view.organization.site.taipei', rules: 18, coverage: 94 },
  { nameKey: 'view.organization.policy.emeaBaseline', scopeKey: 'view.organization.site.emea', rules: 12, coverage: 100 },
  { nameKey: 'view.organization.policy.apacBaseline', scopeKey: 'view.organization.site.apac', rules: 12, coverage: 88 },
];

const roleDefinitions = [
  { roleKey: 'view.organization.role.orgOwner', users: 3, permsKey: 'view.organization.perms.orgOwner', color: 'danger' as const },
  { roleKey: 'view.organization.role.siteAdmin', users: 18, permsKey: 'view.organization.perms.siteAdmin', color: 'warning' as const },
  { roleKey: 'view.organization.role.safetyEngineer', users: 42, permsKey: 'view.organization.perms.safetyEngineer', color: 'brand' as const },
  { roleKey: 'view.organization.role.networkAdmin', users: 12, permsKey: 'view.organization.perms.networkAdmin', color: 'accent' as const },
  { roleKey: 'view.organization.role.operator', users: 856, permsKey: 'view.organization.perms.operator', color: 'success' as const },
  { roleKey: 'view.organization.role.viewer', users: 309, permsKey: 'view.organization.perms.viewer', color: 'neutral' as const },
];

export function OrganizationView() {
  const { t } = useLanguage();
  const tree = buildTree(orgTree);

  return (
    <div className="space-y-6">
      {/* Hierarchy tree */}
      <Panel className="p-5 animate-fade-in">
        <SectionHeader
          title={t('view.organization.hierarchyTitle')}
          subtitle={t('view.organization.hierarchySubtitle')}
          icon={<Building2 size={18} />}
          action={<Badge variant="brand">{orgTree.length} {t('view.organization.nodes')}</Badge>}
        />
        <div className="space-y-1">
          {tree.map((node) => {
            const depth = node.parentId ? orgTree.findIndex((n) => n.id === node.parentId) : -1;
            const level = depth >= 0 ? Math.ceil((orgTree.indexOf(node) - depth) / 1) : 0;
            return (
              <div
                key={node.id}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-ink-800/40"
                style={{ paddingLeft: `${12 + level * 24}px` }}
              >
                <ChevronRight size={14} className="text-ink-500" />
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-ink-800 text-brand-400">
                  <Building2 size={14} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-ink-100">{node.name}</span>
                    <Badge variant={typeVariant[node.type]}>{t(typeKey[node.type])}</Badge>
                  </div>
                  <p className="text-xs text-ink-400">{node.policy}</p>
                </div>
                <div className="hidden gap-4 sm:flex">
                  <div className="text-right">
                    <p className="text-xs text-ink-400"><Cpu size={10} className="inline" /> {t('dashboard.gateway.devices')}</p>
                    <p className="text-sm font-semibold text-white tabular-nums">{node.devices.toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-ink-400"><Users size={10} className="inline" /> {t('view.organization.users')}</p>
                    <p className="text-sm font-semibold text-white tabular-nums">{node.users}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Panel>

      {/* Policy-based access control */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Panel className="p-5 animate-fade-in">
          <SectionHeader title={t('view.organization.accessPoliciesTitle')} subtitle={t('view.organization.accessPoliciesSubtitle')} icon={<Shield size={18} />} />
          <div className="space-y-3">
            {accessPolicies.map((p) => (
              <div key={p.nameKey} className="rounded-xl border border-ink-700/50 bg-ink-900/40 p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-ink-100">{t(p.nameKey)}</p>
                    <p className="text-xs text-ink-400">{t(p.scopeKey)} · {p.rules} {t('view.organization.rules')}</p>
                  </div>
                  <Badge variant={p.coverage === 100 ? 'success' : 'warning'}>{p.coverage}%</Badge>
                </div>
                <div className="mt-2"><ProgressBar value={p.coverage} size="sm" color={p.coverage === 100 ? 'success' : 'warning'} /></div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel className="p-5 animate-fade-in">
          <SectionHeader title={t('view.organization.roleDefinitionsTitle')} subtitle={t('view.organization.roleDefinitionsSubtitle')} icon={<Users size={18} />} />
          <div className="space-y-3">
            {roleDefinitions.map((r) => (
              <div key={r.roleKey} className="flex items-center justify-between rounded-xl border border-ink-700/50 bg-ink-900/40 p-3">
                <div className="flex items-center gap-3">
                  <Badge variant={r.color}>{t(r.roleKey)}</Badge>
                  <span className="text-xs text-ink-400">{t(r.permsKey)}</span>
                </div>
                <span className="text-sm font-semibold text-white tabular-nums">{r.users}</span>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}
