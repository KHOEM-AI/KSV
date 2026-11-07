import { useState, type CSSProperties } from 'react';
import * as api from '@/lib/api';
import { DEVICE_CATALOG, resolveCatalogType, type ParamSpec } from '@/core/devices/device.catalog';
import {
  applyPractice,
  buildPayload,
  defaultValue,
  describeState,
  errorInfo,
  needsConfirm,
  type PanelValues,
} from '@/components/catalogPanel.logic';

/**
 * One control panel for ANY device of the catalog: the buttons, sliders and lists are built from
 * src/core/devices/device.catalog.ts, so every new device type gets a panel without new UI code.
 * If the device or the session is not connected yet, the panel works in practice mode (nothing real
 * is switched), like the other panels.
 */

type Msg = { kind: 'ok' | 'err' | 'warn'; text: string } | null;
type Dispatch = (input: { deviceId: string; type: string; payload?: Record<string, unknown> }) => Promise<unknown>;

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
  const typeKey = resolveCatalogType(type) ?? 'generic';
  const def = DEVICE_CATALOG[typeKey];
  const [values, setValues] = useState<PanelValues>({});
  const [state, setState] = useState<Record<string, unknown>>({});
  const [busy, setBusy] = useState(false);
  const [practice, setPractice] = useState(false);
  const [msg, setMsg] = useState<Msg>(null);
  const [pending, setPending] = useState<{ command: string; payload: Record<string, unknown> } | null>(null);

  const dispatch = (api as unknown as { dispatchCommand?: Dispatch }).dispatchCommand;

  async function send(command: string, payload: Record<string, unknown>, confirmed = false) {
    if (needsConfirm(typeKey, command) && !confirmed) {
      setPending({ command, payload });
      return;
    }
    setPending(null);
    setBusy(true);
    setMsg(null);
    try {
      // No token = not signed in: stay in practice mode instead of calling the server.
      if (!dispatch || !localStorage.getItem('ksv_access_token')) throw Object.assign(new Error('offline'), { status: 401 });
      await dispatch({ deviceId, type: command, payload: confirmed ? { ...payload, confirmed: true } : payload });
      setPractice(false);
      setState((s) => applyPractice(s, command, payload));
      setMsg({ kind: 'ok', text: 'Sent · បានផ្ញើពាក្យបញ្ជា ✔' });
    } catch (e) {
      const info = errorInfo(e);
      if (info.confirm && !confirmed) {
        setPending({ command, payload });
      } else if (info.offline) {
        setPractice(true);
        setState((s) => applyPractice(s, command, payload));
        setMsg({ kind: 'warn', text: 'Practice · ឧបករណ៍មិនទាន់ភ្ជាប់ — ប៊ូតុងគ្រាន់តែសាកល្បង គ្មានអ្វីពិតត្រូវបានបើក/បិទទេ។' });
      } else {
        setMsg({ kind: 'err', text: `${info.code}: ${info.message}` });
      }
    } finally {
      setBusy(false);
    }
  }

  const setVal = (cmd: string, key: string, v: string | number) => setValues((p) => ({ ...p, [`${cmd}.${key}`]: v }));

  const entries = Object.entries(def.commands);
  const simple = entries.filter(([, c]) => !c.params && !c.readOnly);
  const withParams = entries.filter(([, c]) => c.params && !c.readOnly);
  const readOnly = entries.filter(([, c]) => c.readOnly);
  const chips = describeState(state);

  const control = (cmd: string, key: string, spec: ParamSpec, current: string | number) => {
    if (spec.type === 'int') {
      return (
        <>
          <input type="range" min={spec.min} max={spec.max} value={Number(current)} onChange={(e) => setVal(cmd, key, Number(e.target.value))} style={{ width: '100%' }} />
          <span>
            {String(current)} {spec.unit ?? ''}
          </span>
        </>
      );
    }
    if (spec.type === 'enum') {
      return (
        <select value={String(current)} onChange={(e) => setVal(cmd, key, e.target.value)} style={{ padding: 8, borderRadius: 8, background: '#0f172a', color: '#e6edf5', border: '1px solid #334155' }}>
          {spec.values.map((o) => (
            <option key={String(o)} value={String(o)}>
              {String(o)}
            </option>
          ))}
        </select>
      );
    }
    return <input type="color" value={String(current)} onChange={(e) => setVal(cmd, key, e.target.value)} style={{ width: 64, height: 36, border: 'none', background: 'transparent' }} />;
  };

  return (
    <div style={S.backdrop} onClick={onClose}>
      <div style={S.card} onClick={(e) => e.stopPropagation()} role="dialog" aria-label={label}>
        <div style={S.head}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700 }}>
              {def.km} · {label}
            </div>
            <div style={S.code}>
              {typeKey} · {deviceId}
            </div>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" style={S.ghost}>
            ✕
          </button>
        </div>

        {practice && <div style={note('warn')}>Practice · ឧបករណ៍មិនទាន់ភ្ជាប់ — ប៊ូតុងគ្រាន់តែសាកល្បង។</div>}

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
            {simple.map(([cmd, c]) => (
              <button key={cmd} type="button" disabled={busy} onClick={() => send(cmd, {})} style={S.btn} title={cmd}>
                {c.km}
              </button>
            ))}
          </div>
        )}

        {withParams.map(([cmd, c]) => {
          const params = c.params ?? {};
          const mine: PanelValues = {};
          for (const k of Object.keys(params)) {
            const v = values[`${cmd}.${k}`];
            if (v !== undefined) mine[k] = v;
          }
          return (
            <div key={cmd} style={S.box}>
              <div>
                <b>{c.km}</b> <span style={S.code}>{cmd}</span>
              </div>
              {Object.entries(params).map(([k, spec]) => (
                <label key={k} style={S.lbl}>
                  <span>
                    {k}
                    {spec.optional ? ' (optional · ជម្រើស)' : ''}
                  </span>
                  {control(cmd, k, spec, mine[k] ?? defaultValue(spec))}
                </label>
              ))}
              <button type="button" disabled={busy} onClick={() => send(cmd, buildPayload(params, mine))} style={{ ...S.btn, marginTop: 10 }}>
                Send · ផ្ញើ
              </button>
            </div>
          );
        })}

        {readOnly.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
            {readOnly.map(([cmd, c]) => (
              <button key={cmd} type="button" disabled={busy} onClick={() => send(cmd, {})} style={S.ghost} title={cmd}>
                {c.km}
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
              <button type="button" disabled={busy} onClick={() => send(pending.command, pending.payload, true)} style={S.btn}>
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
