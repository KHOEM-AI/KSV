import { useEffect, useState, type CSSProperties } from 'react';
import { getAccessToken } from '@/lib/auth';
import { ensureDevice, getDevice, sendCommand, type KsvDevice } from '@/lib/ksvDevices';
import {
  buildPayload,
  defaultValue,
  describeState,
  errorText,
  FALLBACK_TYPE,
  isConfirmRequired,
  isOptional,
  parseType,
  type ParamInfo,
  type PanelValues,
  type TypeInfo,
} from '@/components/catalogPanel.logic';

/**
 * One control panel for ANY device type of the KSV gateway. The buttons, sliders and lists come from
 * GET /ksv-api/types/:type, so the gateway is the only place that defines the commands, and every new
 * type gets a panel without new UI code. It uses the same ensureDevice / sendCommand as the other panels.
 */

type Msg = { kind: 'ok' | 'err' | 'warn'; text: string } | null;

interface Props {
  deviceId: string;
  label: string;
  type: string;
  onClose: () => void;
}

const S: Record<string, CSSProperties> = {
  backdrop: { position: 'fixed', inset: 0, background: 'rgba(2,6,16,0.78)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 12 },
  card: { width: '100%', maxWidth: 440, maxHeight: '92vh', overflowY: 'auto', background: '#0b1220', border: '1px solid rgba(45,212,191,0.5)', borderRadius: 16, padding: 16, color: '#e6edf5' },
  head: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 8 },
  box: { border: '1px solid rgba(94,234,212,0.25)', borderRadius: 12, padding: 10, marginTop: 10 },
  btn: { background: '#0f766e', color: '#fff', border: '1px solid #2dd4bf', borderRadius: 10, padding: '8px 12px', fontSize: 14, cursor: 'pointer' },
  ghost: { background: 'transparent', color: '#e6edf5', border: '1px solid rgba(148,163,184,0.5)', borderRadius: 10, padding: '6px 10px', fontSize: 13, cursor: 'pointer' },
  chip: { fontSize: 12, padding: '2px 8px', borderRadius: 999, border: '1px solid rgba(94,234,212,0.35)', color: '#99f6e4' },
  code: { fontFamily: 'ui-monospace, monospace', fontSize: 12, color: '#94a3b8' },
  lbl: { display: 'grid', gap: 4, fontSize: 13, color: '#cbd5e1', marginTop: 8 },
};

const note = (kind: 'ok' | 'err' | 'warn'): CSSProperties => ({
  marginTop: 10,
  padding: '8px 10px',
  borderRadius: 10,
  fontSize: 13,
  border: `1px solid ${kind === 'err' ? '#f87171' : kind === 'warn' ? '#facc15' : '#34d399'}`,
  color: kind === 'err' ? '#fecaca' : kind === 'warn' ? '#fde68a' : '#a7f3d0',
  background: 'rgba(15,23,42,0.8)',
});

export function CatalogPanel({ deviceId, label, type, onClose }: Props) {
  const [info, setInfo] = useState<TypeInfo | null>(null);
  const [dev, setDev] = useState<KsvDevice | null>(null);
  const [values, setValues] = useState<PanelValues>({});
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<Msg>(null);
  const [pending, setPending] = useState<{ command: string; params: Record<string, unknown> } | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const token = getAccessToken();
        const res = await fetch(`/ksv-api/types/${encodeURIComponent(type)}`, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
        const parsed = res.ok ? parseType(await res.json()) : null;
        if (alive) setInfo(parsed ?? FALLBACK_TYPE);
      } catch {
        if (alive) setInfo(FALLBACK_TYPE);
      }
      try {
        const d = await ensureDevice(deviceId, label, type);
        if (alive) setDev(d);
      } catch (e) {
        if (alive) setMsg({ kind: 'err', text: `${errorText(e)} — sign in on the Security page first · សូមចូលគណនីនៅទំព័រ Security ជាមុន` });
      }
    })();
    return () => {
      alive = false;
    };
  }, [deviceId, label, type]);

  async function send(command: string, params: Record<string, unknown>, confirmed = false) {
    setPending(null);
    setBusy(true);
    setMsg(null);
    try {
      await sendCommand(deviceId, command, params, confirmed);
      setDev(await getDevice(deviceId));
      setMsg({ kind: 'ok', text: 'Sent · បានផ្ញើពាក្យបញ្ជា ✔' });
    } catch (e) {
      if (isConfirmRequired(e) && !confirmed) setPending({ command, params });
      else setMsg({ kind: 'err', text: errorText(e) });
    } finally {
      setBusy(false);
    }
  }

  const setVal = (cmd: string, key: string, v: string | number | boolean) => setValues((p) => ({ ...p, [`${cmd}.${key}`]: v }));

  const commands = info?.commands ?? [];
  const simple = commands.filter((c) => !c.params && !c.readOnly);
  const withParams = commands.filter((c) => c.params && Object.keys(c.params).length > 0 && !c.readOnly);
  const readOnly = commands.filter((c) => c.readOnly);
  const chips = describeState(dev?.state);

  const control = (cmd: string, key: string, spec: ParamInfo, current: string | number | boolean) => {
    if (spec.type === 'int' || spec.type === 'number') {
      return (
        <>
          <input type="range" min={spec.min ?? 0} max={spec.max ?? 100} value={Number(current)} onChange={(e) => setVal(cmd, key, Number(e.target.value))} style={{ width: '100%' }} />
          <span>
            {String(current)} {spec.unit ?? ''}
          </span>
        </>
      );
    }
    if (spec.type === 'enum') {
      return (
        <select value={String(current)} onChange={(e) => setVal(cmd, key, e.target.value)} style={{ padding: 8, borderRadius: 8, background: '#0f172a', color: '#e6edf5', border: '1px solid #334155' }}>
          {(spec.values ?? []).map((o) => (
            <option key={String(o)} value={String(o)}>
              {String(o)}
            </option>
          ))}
        </select>
      );
    }
    if (spec.type === 'hex' || spec.type === 'color') {
      return <input type="color" value={String(current)} onChange={(e) => setVal(cmd, key, e.target.value)} style={{ width: 64, height: 36, border: 'none', background: 'transparent' }} />;
    }
    if (spec.type === 'bool' || spec.type === 'boolean') {
      return <input type="checkbox" checked={Boolean(current)} onChange={(e) => setVal(cmd, key, e.target.value === 'true')} />;
    }
    return <input type="text" value={String(current)} onChange={(e) => setVal(cmd, key, e.target.value)} style={{ padding: 8, borderRadius: 8, background: '#0f172a', color: '#e6edf5', border: '1px solid #334155' }} />;
  };

  return (
    <div style={S.backdrop} onClick={onClose}>
      <div style={S.card} onClick={(e) => e.stopPropagation()} role="dialog" aria-label={label}>
        <div style={S.head}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700 }}>
              {info?.km ?? type} · {label}
            </div>
            <div style={S.code}>
              {type} · {deviceId}
            </div>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" style={S.ghost}>
            ✕
          </button>
        </div>

        {dev?.adapter === 'sim' && <div style={note('warn')}>Simulated · ឧបករណ៍ក្លែងក្លាយ (adapter sim) — គ្មានអ្វីពិតត្រូវបានបើក/បិទទេ។</div>}
        {!info && <div style={note('warn')}>Loading…</div>}

        {chips.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
            {chips.map((c) => (
              <span key={c} style={S.chip}>
                {c}
              </span>
            ))}
          </div>
        )}

        {simple.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
            {simple.map((c) => (
              <button key={c.command} type="button" disabled={busy || !dev} onClick={() => send(c.command, {})} style={S.btn} title={c.command}>
                {c.km ?? c.command}
              </button>
            ))}
          </div>
        )}

        {withParams.map((c) => {
          const params = c.params ?? {};
          const mine: PanelValues = {};
          for (const k of Object.keys(params)) {
            const v = values[`${c.command}.${k}`];
            if (v !== undefined) mine[k] = v;
          }
          return (
            <div key={c.command} style={S.box}>
              <div>
                <b>{c.km ?? c.command}</b> <span style={S.code}>{c.command}</span>
              </div>
              {Object.entries(params).map(([k, spec]) => (
                <label key={k} style={S.lbl}>
                  <span>
                    {k}
                    {isOptional(spec) ? ' (optional · ជម្រើស)' : ''}
                  </span>
                  {control(c.command, k, spec, mine[k] ?? defaultValue(spec))}
                </label>
              ))}
              <button type="button" disabled={busy || !dev} onClick={() => send(c.command, buildPayload(params, mine))} style={{ ...S.btn, marginTop: 10 }}>
                Send · ផ្ញើ
              </button>
            </div>
          );
        })}

        {readOnly.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
            {readOnly.map((c) => (
              <button key={c.command} type="button" disabled={busy || !dev} onClick={() => send(c.command, {})} style={S.ghost} title={c.command}>
                {c.km ?? c.command}
              </button>
            ))}
          </div>
        )}

        {pending && (
          <div style={note('warn')}>
            <div>
              Confirm · បញ្ជាក់ម្ដងទៀត៖ <b>{pending.command}</b> ?
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <button type="button" disabled={busy} onClick={() => send(pending.command, pending.params, true)} style={S.btn}>
                Confirm · បញ្ជាក់
              </button>
              <button type="button" onClick={() => setPending(null)} style={S.ghost}>
                Cancel · បោះបង់
              </button>
            </div>
          </div>
        )}

        {msg && <div style={note(msg.kind)}>{msg.text}</div>}
      </div>
    </div>
  );
}
