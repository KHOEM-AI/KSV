import { Building2, ChevronRight, Users, Cpu, Shield } from 'lucide-react';
import { Panel, SectionHeader, Badge, ProgressBar } from '@/components/ui';
import { orgTree, type OrgNode } from '@/data/domain';

const typeIcon: Record<string, string> = {
  company: 'Holding',
  site: 'Region/Site',
  building: 'Building',
  floor: 'Floor',
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

export function OrganizationView() {
  const tree = buildTree(orgTree);

  return (
    <div className="space-y-6">
      {/* Hierarchy tree */}
      <Panel className="p-5 animate-fade-in">
        <SectionHeader
          title="Organization Hierarchy"
          subtitle="Company → Site → Building → Device policy inheritance"
          icon={<Building2 size={18} />}
          action={<Badge variant="brand">{orgTree.length} nodes</Badge>}
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
                    <Badge variant={typeVariant[node.type]}>{typeIcon[node.type]}</Badge>
                  </div>
                  <p className="text-xs text-ink-400">{node.policy}</p>
                </div>
                <div className="hidden gap-4 sm:flex">
                  <div className="text-right">
                    <p className="text-xs text-ink-400"><Cpu size={10} className="inline" /> Devices</p>
                    <p className="text-sm font-semibold text-white tabular-nums">{node.devices.toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-ink-400"><Users size={10} className="inline" /> Users</p>
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
          <SectionHeader title="Access Policies" subtitle="Policy-based access control (PBAC) rules" icon={<Shield size={18} />} />
          <div className="space-y-3">
            {[
              { name: 'HQ Strict', scope: 'Frankfurt HQ', rules: 24, coverage: 100 },
              { name: 'DC Critical', scope: 'Singapore DC', rules: 31, coverage: 100 },
              { name: 'Fab Cleanroom', scope: 'Taipei Fab', rules: 18, coverage: 94 },
              { name: 'EMEA Baseline', scope: 'EMEA Region', rules: 12, coverage: 100 },
              { name: 'APAC Baseline', scope: 'APAC Region', rules: 12, coverage: 88 },
            ].map((p) => (
              <div key={p.name} className="rounded-xl border border-ink-700/50 bg-ink-900/40 p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-ink-100">{p.name}</p>
                    <p className="text-xs text-ink-400">{p.scope} · {p.rules} rules</p>
                  </div>
                  <Badge variant={p.coverage === 100 ? 'success' : 'warning'}>{p.coverage}%</Badge>
                </div>
                <div className="mt-2"><ProgressBar value={p.coverage} size="sm" color={p.coverage === 100 ? 'success' : 'warning'} /></div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel className="p-5 animate-fade-in">
          <SectionHeader title="Role Definitions" subtitle="Platform-wide role catalog" icon={<Users size={18} />} />
          <div className="space-y-3">
            {[
              { role: 'Org Owner', users: 3, perms: 'Full platform control', color: 'danger' as const },
              { role: 'Site Admin', users: 18, perms: 'Site-level management', color: 'warning' as const },
              { role: 'Safety Engineer', users: 42, perms: 'Safety rules + device controls', color: 'brand' as const },
              { role: 'Network Admin', users: 12, perms: 'Gateway + protocol config', color: 'accent' as const },
              { role: 'Operator', users: 856, perms: 'Device control + view audit', color: 'success' as const },
              { role: 'Viewer', users: 309, perms: 'Read-only dashboard access', color: 'neutral' as const },
            ].map((r) => (
              <div key={r.role} className="flex items-center justify-between rounded-xl border border-ink-700/50 bg-ink-900/40 p-3">
                <div className="flex items-center gap-3">
                  <Badge variant={r.color}>{r.role}</Badge>
                  <span className="text-xs text-ink-400">{r.perms}</span>
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
