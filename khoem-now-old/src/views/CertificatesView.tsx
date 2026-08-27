import { GraduationCap, BadgeCheck, Clock, ExternalLink } from 'lucide-react';
import { Panel, SectionHeader, Badge } from '@/components/ui';
import { certificates } from '@/data/domain';

const catVariant: Record<string, 'brand' | 'accent' | 'success' | 'warning' | 'neutral'> = {
  Development: 'brand',
  Security: 'warning',
  IoT: 'accent',
  Database: 'success',
  Cloud: 'brand',
};

export function CertificatesView() {
  return (
    <div className="space-y-6">
      <Panel className="p-5 animate-fade-in bg-gradient-to-br from-brand-500/5 to-transparent">
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-500/15 text-brand-400">
              <GraduationCap size={28} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Sololearn Certificates</h2>
              <p className="text-sm text-ink-400">Verified professional certifications held by KSV team members</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="text-center"><p className="text-2xl font-bold text-white">{certificates.length}</p><p className="text-xs text-ink-400">Certificates</p></div>
            <div className="text-center"><p className="text-2xl font-bold text-success-400">{certificates.filter(c => c.verified).length}</p><p className="text-xs text-ink-400">Verified</p></div>
          </div>
        </div>
      </Panel>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {certificates.map((cert) => (
          <Panel key={cert.id} hover className="p-5 animate-fade-in">
            <div className="flex items-start justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-ink-800 text-brand-400">
                <GraduationCap size={20} />
              </div>
              {cert.verified && (
                <div className="flex items-center gap-1 text-success-400">
                  <BadgeCheck size={18} />
                  <span className="text-xs font-semibold">Verified</span>
                </div>
              )}
            </div>
            <h3 className="mt-3 text-sm font-semibold text-white">{cert.title}</h3>
            <p className="text-xs text-ink-400">{cert.issuer} · {cert.holder}</p>

            <div className="mt-3 flex items-center gap-2">
              <Badge variant={catVariant[cert.category] ?? 'neutral'}>{cert.category}</Badge>
            </div>

            <div className="mt-4 border-t border-ink-700/50 pt-3 flex items-center justify-between text-xs text-ink-400">
              <span className="flex items-center gap-1.5"><Clock size={12} /> Issued {cert.issued}</span>
              <span>Expires: {cert.expires}</span>
            </div>

            <button className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg border border-ink-700 py-2 text-xs font-medium text-ink-300 transition-colors hover:border-ink-600 hover:text-ink-100">
              View certificate <ExternalLink size={12} />
            </button>
          </Panel>
        ))}
      </div>
    </div>
  );
}
