// Remembers which page the user is on, so a refresh / reopen stays in place.
const KEY = "khoem_ai_active_view";

export function loadActiveView(valid: string[], fallback = "controls"): string {
  try {
    const v = localStorage.getItem(KEY);
    return v && valid.includes(v) ? v : fallback;
  } catch {
    return fallback;
  }
}

export function saveActiveView(id: string): void {
  try {
    localStorage.setItem(KEY, id);
  } catch {
    /* ignore */
  }
}
