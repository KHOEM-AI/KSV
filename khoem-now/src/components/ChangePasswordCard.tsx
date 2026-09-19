import { useState } from "react";
import HoldToUnlock from "./HoldToUnlock";

interface Props {
  onSubmit: (currentPassword: string, newPassword: string) => Promise<void>;
  holdMs?: number;
}

const input: React.CSSProperties = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: 12,
  border: "1px solid #cbd5e1",
  fontSize: 15,
  boxSizing: "border-box",
};

export default function ChangePasswordCard({ onSubmit, holdMs = 30000 }: Props) {
  const [unlocked, setUnlocked] = useState(false);
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [ok, setOk] = useState(false);

  const reset = () => {
    setUnlocked(false);
    setCurrent("");
    setNext("");
    setConfirm("");
    setError("");
  };

  const submit = async () => {
    setError("");
    if (!current) return setError("សូមបញ្ចូលពាក្យសម្ងាត់បច្ចុប្បន្ន");
    if (next.length < 12) return setError("ពាក្យសម្ងាត់ថ្មីត្រូវមានយ៉ាងតិច ១២ តួអក្សរ");
    if (next !== confirm) return setError("ពាក្យសម្ងាត់ថ្មីមិនដូចគ្នា");
    if (next === current) return setError("ពាក្យសម្ងាត់ថ្មីត្រូវខុសពីចាស់");
    setBusy(true);
    try {
      await onSubmit(current, next);
      setOk(true);
      reset();
    } catch (e) {
      setError(e instanceof Error ? e.message : "ប្តូរពាក្យសម្ងាត់មិនបាន");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ padding: 16, borderRadius: 16, border: "1px solid #e2e8f0", background: "#fff", maxWidth: 420 }}>
      <h3 style={{ margin: "0 0 12px", fontSize: 17 }}>ប្តូរពាក្យសម្ងាត់</h3>

      {ok && !unlocked && (
        <div style={{ marginBottom: 12, color: "#15803d", fontWeight: 600 }}>✓ ប្តូរពាក្យសម្ងាត់ជោគជ័យ</div>
      )}

      {!unlocked ? (
        <HoldToUnlock
          durationMs={holdMs}
          onComplete={() => {
            setOk(false);
            setUnlocked(true);
          }}
        />
      ) : (
        <div style={{ display: "grid", gap: 10 }}>
          <input style={input} type="password" placeholder="ពាក្យសម្ងាត់បច្ចុប្បន្ន" autoComplete="current-password" value={current} onChange={(e) => setCurrent(e.target.value)} />
          <input style={input} type="password" placeholder="ពាក្យសម្ងាត់ថ្មី (យ៉ាងតិច ១២ តួ)" autoComplete="new-password" value={next} onChange={(e) => setNext(e.target.value)} />
          <input style={input} type="password" placeholder="បញ្ជាក់ពាក្យសម្ងាត់ថ្មី" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
          {error && <div style={{ color: "#dc2626", fontSize: 14 }}>{error}</div>}
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={submit} disabled={busy} style={{ flex: 1, padding: 12, borderRadius: 12, border: 0, background: "#0ea5e9", color: "#fff", fontWeight: 700, fontSize: 15 }}>
              {busy ? "កំពុងរក្សាទុក..." : "រក្សាទុក"}
            </button>
            <button onClick={reset} disabled={busy} style={{ padding: 12, borderRadius: 12, border: "1px solid #cbd5e1", background: "#fff", fontSize: 15 }}>
              បោះបង់
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
