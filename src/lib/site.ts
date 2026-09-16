import { SITE } from "@/config";

export function siteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL || `https://${SITE.domain}`).replace(/\/$/, "");
}

/** v2 gate. Library, Compare and checkout 404 unless this is exactly "true". */
export function paidEnabled(): boolean {
  return process.env.NEXT_PUBLIC_PAID_ENABLED === "true";
}

export function formatRupees(paise: number): string {
  return `₹${(paise / 100).toLocaleString("en-IN")}`;
}

/** "1 day", "30 days". */
export function formatDays(days: number): string {
  return `${days} ${days === 1 ? "day" : "days"}`;
}

export function formatCount(value: number): string {
  return value.toLocaleString("en-IN");
}

/** Only same-site paths, so `?next=` can't send people to another domain. */
export function safeNextPath(value: string | undefined): string | null {
  return value && value.startsWith("/") && !value.startsWith("//") ? value : null;
}
