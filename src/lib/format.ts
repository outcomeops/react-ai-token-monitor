export function formatTokens(n: number, format: "compact" | "full" = "compact"): string {
  if (format === "full") {
    return n.toLocaleString("en-US");
  }
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

export function formatCost(usd: number): string {
  if (usd >= 100) return `$${usd.toFixed(0)}`;
  if (usd >= 1) return `$${usd.toFixed(2)}`;
  return `$${usd.toFixed(4)}`;
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

export function getTotalTokens(tokens: Record<string, number>): number {
  return Object.values(tokens).reduce((sum, v) => sum + v, 0);
}

/** Format a Date to YYYY-MM-DD in UTC to match server-side date extraction */
export function toLocalDateStr(d: Date): string {
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
}
