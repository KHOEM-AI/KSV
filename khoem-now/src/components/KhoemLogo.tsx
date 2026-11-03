const SRC = "url('/general-devices-control.jpg?v=2')";
const W = 1079, H = 880, X = 481, Y = 15, S = 102;

export function KhoemLogo({ size = 36 }: { size?: number }) {
  return (
    <div
      role="img"
      aria-label="KHOEM-AI"
      style={{
        width: size,
        height: size,
        flexShrink: 0,
        borderRadius: Math.round(size * 0.22),
        backgroundImage: SRC,
        backgroundRepeat: 'no-repeat',
        backgroundSize: `${(W / S) * 100}% auto`,
        backgroundPosition: `${(X / (W - S)) * 100}% ${(Y / (H - S)) * 100}%`,
      }}
    />
  );
}
