export type AnalyticsEvent =
  | "sign_up"
  | "login"
  | "map_created"
  | "map_opened"
  | "element_added"
  | "element_deleted"
  | "map_saved"
  | "map_shared"
  | "public_map_viewed"
  | "pro_clicked"
  | "pro_waitlist_joined"
  | "free_limit_reached";

type Props = Record<string, unknown>;

/** Fire-and-forget analytics. Never throws, never blocks the UI. */
export function track(event: AnalyticsEvent, properties: Props = {}) {
  try {
    if (typeof window === "undefined") return;
    const payload = { event, properties, at: new Date().toISOString() };
    const w = window as unknown as {
      __lovableEvents?: { track?: (e: string, p?: Props) => unknown };
    };
    try {
      w.__lovableEvents?.track?.(event, properties);
    } catch {
      /* ignore */
    }
    try {
      const key = "mapcraft_events";
      const raw = window.localStorage.getItem(key);
      const list: unknown[] = raw ? (JSON.parse(raw) as unknown[]) : [];
      list.push(payload);
      window.localStorage.setItem(key, JSON.stringify(list.slice(-100)));
    } catch {
      /* ignore */
    }
  } catch {
    /* analytics must never break the app */
  }
}
