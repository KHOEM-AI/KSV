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
      <div style={{ background: "#131a29", padding: 32, borderRadius: 12, width: 320 }}>
        <h1 style={{ color: "#fff", fontSize: 20, marginBottom: 8 }}>KSV Secured</h1>
        <p style={{ color: "#94a3b8", fontSize: 13, marginBottom: 20 }}>
          Hold the button to confirm you're a human before entering the platform.
        </p>
        <HoldToUnlock durationMs={holdMs} onComplete={onUnlock} />
      </div>
    </div>
  );
}
