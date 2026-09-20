import HoldToUnlock from "./HoldToUnlock";

interface Props {
  onUnlock: () => void;
  holdMs?: number;
}

export default function AppLockScreen({ onUnlock, holdMs = 10000 }: Props) {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#0a0e17",
      }}
    >
      <div style={{ background: "#131a29", padding: 32, borderRadius: 16, width: "min(92vw, 420px)" }}>
        <h1 style={{ color: "#fff", fontSize: 26, marginBottom: 10 }}>KSV Secured</h1>
        <p style={{ color: "#94a3b8", fontSize: 16, marginBottom: 24 }}>
          Hold the button to confirm you're a human before entering the platform.
        </p>
        <div style={{ zoom: 1.25 }}>
          <HoldToUnlock durationMs={holdMs} onComplete={onUnlock} />
        </div>
      </div>
    </div>
  );
}
