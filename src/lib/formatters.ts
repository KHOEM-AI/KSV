/**
 * KSV — Display Formatters
 * Location: khoem-now/src/lib/formatters.ts
 *
 * Pure formatting functions for turning raw data (timestamps, status
 * strings, bytes) into what the UI shows. No API calls, no state —
 * safe to import anywhere.
 */

/**
 * "2026-08-29T14:32:11Z" -> "14:32:11" (matches the Live Control
 * Activity feed's time format seen in ControlsView).
 */
export function formatTime(isoString: string): string {
  const d = new Date(isoString);
  return d.toLocaleTimeString(undefined, { hour12: false });
}

/**
 * "2026-08-29T14:32:11Z" -> "2 minutes ago" style relative time,
 * for command history / audit feeds.
 */
export function formatRelativeTime(isoString: string): string {
  const then = new Date(isoString).getTime();
  const now = Date.now();
  const diffSec = Math.floor((now - then) / 1000);

  if (diffSec < 60) return "ទើបនេះ";
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)} នាទីមុន`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)} ម៉ោងមុន`;
  return `${Math.floor(diffSec / 86400)} ថ្ងៃមុន`;
}

/**
 * Maps a device status string to a Tailwind color class, matching the
 * dashboard's dot colors (online=green, warning=orange, offline=gray,
 * maintenance=blue).
 */
export function statusColor(status: string): string {
  switch (status) {
    case "online":
      return "bg-success-500";
    case "warning":
      return "bg-warning-500";
    case "maintenance":
      return "bg-blue-500";
    case "offline":
    default:
      return "bg-ink-500";
  }
}

/**
 * 1536 -> "1.5 KB", matches the file-size display used in the vault
 * gallery and would be reused for firmware file sizes, exports, etc.
 */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  return `${(bytes / 1024 / 1024 / 1024).toFixed(1)} GB`;
}

/**
 * "DEV-04821" style device codes are already formatted at creation —
 * this just guards against showing "undefined" if a device record is
 * incomplete somewhere in the UI.
 */
export function safeDeviceCode(code?: string | null): string {
  return code && code.trim().length > 0 ? code : "—";
}
