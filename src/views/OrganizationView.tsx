// src/views/OrganizationView.tsx
import { useState, useEffect } from 'react';
import { Building2, ChevronRight, Users, Cpu, Shield } from 'lucide-react';
import { Panel, SectionHeader, Badge, ProgressBar } from '@/components/ui';
import { listMyOrgs, listSites, listBuildings, listMembers } from '@/lib/api';
import type { KSVOrganization, KSVSite, KSVBuilding, KSVOrgMember } from '../../API/organization';
import { useLanguage } from '@/i18n/LanguageContext';

const typeVariant: Record<string, 'brand' | 'accent' | 'success' | 'neutral'> = {
  company: 'brand',
  site: 'accent',
  building: 'success',
};

type TreeNode = {
  id: string;
  name: string;
  type: 'company' | 'site' | 'building';
  parentId?: string;
  devices: number;
  users: number;
  policy: string;
};

// Static illustrative policies and roles (not domain data).
// These belong to UI content, not to the database yet.
const accessPolicies = [
  { nameKey: 'view.organization.policy.hqStrict', scopeKey: 'view.organization.site.frankfurt', rules: 24, coverage: 100 },
  { nameKey: 'view.organization.policy.dcCritical', scopeKey: 'view.organization.site.singapore', rules: 31, coverage: 100 },
  { nameKey: 'view.organization.policy.fabCleanroom', scopeKey: 'view.organization.site.taipei', rules: 18, coverage: 94 },
  { nameKey: 'view.organization.policy.emeaBaseline', scopeKey: 'view.organization.site.emea', rules: 12, coverage: 100 },
  { nameKey: 'view.organization.policy.apacBaseline', scopeKey: 'view.organization.site.apac', rules: 12, coverage: 88 },
];

const roleDefinitions = [
  { roleKey: 'view.organization.role.orgOwner', permsKey: 'view.organization.perms.orgOwner', color: 'danger' as const },
  { roleKey: 'view.organization.role.siteAdmin', permsKey: 'view.organization.perms.siteAdmin', color: 'warning' as const },
  { roleKey: 'view.organization.role.safetyEngineer', permsKey: 'view.organization.perms.safetyEngineer', color: 'brand' as const },
  { roleKey: 'view.organization.role.networkAdmin', permsKey: 'view.organization.perms.networkAdmin', color: 'accent' as const },
  { roleKey: 'view.organization.role.operator', permsKey: 'view.organization.perms.operator', color: 'success' as const },
  { roleKey: 'view.organization.role.viewer', permsKey: 'view.organization.perms.viewer', color: 'neutral' as const },
];

export function OrganizationView() {
  const { t } = useLanguage();
  const [tree, setTree] = useState<TreeNode[]>([]);
  const [members, setMembers] = useState<KSVOrgMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const orgsRes = await listMyOrgs();
        const orgs: KSVOrganization[] = orgsRes.organizations ?? [];
        if (orgs.length === 0) {
          if (!cancelled) setTree([]);
          return;
        }

        const org = orgs[0];
        const [sites, memberList] = await Promise.all([
          listSites(org.orgId).catch(() => [] as KSVSite[]),
          listMembers(org.orgId).catch(() => [] as KSVOrgMember[]),
        ]);

        const buildingsBySite: Record<string, KSVBuilding[]> = {};
        await Promise.all(
          sites.map(async (s) => {
            buildingsBySite[s.siteId] = await listBuildings(org.orgId, s.siteId).catch(() => [] as KSVBuilding[]);
          })
        );

        const nodes: TreeNode[] = [];
        nodes.push({
          id: org.orgId,
          name: org.name,
          type: 'company',
          devices: org.deviceCount ?? 0,
          users: org.memberCount ?? memberList.length,
          policy: org.countryCode ?? '',
        });

        for (const site of sites) {
          nodes.push({
            id: site.siteId,
            name: site.name,
            type: 'site',
            parentId: org.orgId,
            devices: site.deviceCount ?? 0,
            users: 0,
            policy: site.countryCode ?? '',
          });
          for (const b of buildingsBySite[site.siteId] ?? []) {
            nodes.push({
              id: b.buildingId,
              name: b.name,
              type: 'building',
              parentId: site.siteId,
              devices: b.deviceCount ?? 0,
              users: 0,
              policy: b.type ?? 'main',
            });
          }
        }

        if (!cancelled) {
          setTree(nodes);
          setMembers(memberList);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load organization');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="space-y-6">
      {/* Hierarchy tree */}
      <Panel className="p-5 animate-fade-in">
        <SectionHeader
          title={t('view.organization.hierarchyTitle')}
          subtitle={t('view.organization.hierarchySubtitle')}
          icon={<Building2 size={18} />}
          action={<Badge variant="brand">{tree.length} {t('view.organization.nodes')}</Badge>}
        />

        {loading && <div className="py-12 text-center text-ink-400">Loading organization…</div>}
        {error && <div className="py-12 text-center text-red-400">Error: {error}</div>}

        {!loading && !error && (
          <div className="space-y-1">
            {tree.map((node) => {
              const depth = node.type === 'company' ? 0 : node.type === 'site' ? 1 : 2;
              return (
                <div
                  key={node.id}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-ink-800/40"
                  style={{ paddingLeft: `${12 + depth * 24}px` }}
                >
                  <ChevronRight size={14} className="text-ink-500" />
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-ink-800 text-brand-400">
                    <Building2 size={14} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-ink-100">{node.name}</span>
                      <Badge variant={typeVariant[node.type]}>{node.type}</Badge>
                    </div>
                    <p className="text-xs text-ink-400">{node.policy || '—'}</p>
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
            {tree.length === 0 && (
              <div className="py-8 text-center text-ink-400">No organization found.</div>
            )}
          </div>
        )}
      </Panel>

      {/* Policy-based access control (static) */}
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
            {roleDefinitions.map((r) => {
              const count = members.filter((m) => {
                const role = (m.role || '').toLowerCase();
                if (r.roleKey.includes('orgOwner')) return role === 'owner';
                if (r.roleKey.includes('siteAdmin')) return role === 'admin';
                if (r.roleKey.includes('operator')) return role === 'operator';
                if (r.roleKey.includes('viewer')) return role === 'viewer';
                return false;
              }).length;
              return (
                <div key={r.roleKey} className="flex items-center justify-between rounded-xl border border-ink-700/50 bg-ink-900/40 p-3">
                  <div className="flex items-center gap-3">
                    <Badge variant={r.color}>{t(r.roleKey)}</Badge>
                    <span className="text-xs text-ink-400">{t(r.permsKey)}</span>
                  </div>
                  <span className="text-sm font-semibold text-white tabular-nums">{count}</span>
                </div>
              );
            })}
          </div>
        </Panel>
      </div>
    </div>
  );
}
