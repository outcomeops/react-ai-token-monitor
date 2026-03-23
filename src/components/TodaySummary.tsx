import type { DailyUsage } from "../lib/types";
import { formatTokens, formatCost, getTotalTokens } from "../lib/format";

interface Props {
  today: DailyUsage | null;
  weekAvg: number;
}

export function TodaySummary({ today, weekAvg }: Props) {
  const totalTokens = today ? getTotalTokens(today.tokens) : 0;
  const cost = today?.cost_usd ?? 0;
  const messages = today?.messages ?? 0;
  const sessions = today?.sessions ?? 0;

  const comparison = weekAvg > 0
    ? Math.round(((totalTokens - weekAvg) / weekAvg) * 100)
    : 0;

  return (
    <div style={{
      background: "var(--bg-card)",
      borderRadius: "var(--radius-lg)",
      padding: 20,
      boxShadow: "var(--shadow-card)",
    }}>
      <div style={{
        fontSize: 13,
        fontWeight: 700,
        color: "var(--text-secondary)",
        textTransform: "uppercase",
        letterSpacing: "0.5px",
        marginBottom: 10,
      }}>
        Today
      </div>

      <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 6 }}>
        <span style={{
          fontSize: 36,
          fontWeight: 800,
          color: "var(--accent-purple)",
          letterSpacing: "-1px",
        }}>
          {formatTokens(totalTokens)}
        </span>
        <span style={{ fontSize: 16, color: "var(--text-secondary)", fontWeight: 600 }}>
          tokens
        </span>
        {comparison !== 0 && (
          <span style={{
            fontSize: 13,
            fontWeight: 700,
            color: comparison > 0 ? "var(--accent-pink)" : "var(--accent-mint)",
            background: comparison > 0
              ? "rgba(255,143,164,0.1)"
              : "rgba(93,217,168,0.1)",
            padding: "2px 6px",
            borderRadius: 6,
          }}>
            {comparison > 0 ? "+" : ""}{comparison}% vs 7d avg
          </span>
        )}
      </div>

      <div style={{ display: "flex", gap: 24, marginTop: 12 }}>
        <StatChip label="Cost" value={formatCost(cost)} color="var(--accent-orange)" />
        <StatChip label="Messages" value={String(messages)} color="var(--accent-purple)" />
        <StatChip label="Sessions" value={String(sessions)} color="var(--accent-mint)" />
      </div>
    </div>
  );
}

function StatChip({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <span style={{ fontSize: 12, color: "var(--text-secondary)", fontWeight: 600 }}>
        {label}
      </span>
      <span style={{ fontSize: 20, fontWeight: 700, color }}>
        {value}
      </span>
    </div>
  );
}
