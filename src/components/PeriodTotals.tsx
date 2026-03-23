import { useState, useMemo } from "react";
import type { DailyUsage } from "../lib/types";
import { formatTokens, formatCost, getTotalTokens, toLocalDateStr } from "../lib/format";
import { PeriodSelector } from "./PeriodSelector";

interface Props {
  daily: DailyUsage[];
}

function getWeekRange(offset: number): { start: string; end: string; label: string } {
  const now = new Date();
  const dow = now.getDay();
  const mondayOffset = dow === 0 ? 6 : dow - 1;
  const monday = new Date(now);
  monday.setDate(now.getDate() - mondayOffset - offset * 7);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  const start = toLocalDateStr(monday);
  const end = toLocalDateStr(sunday);

  if (offset === 0) return { start, end, label: "This Week" };
  if (offset === 1) return { start, end, label: "Last Week" };

  const m1 = monday.toLocaleDateString("en", { month: "short", day: "numeric" });
  const m2 = sunday.toLocaleDateString("en", { day: "numeric" });
  return { start, end, label: `${m1}-${m2}` };
}

function getMonthRange(offset: number): { start: string; end: string; label: string } {
  const now = new Date();
  const targetMonth = new Date(now.getFullYear(), now.getMonth() - offset, 1);
  const lastDay = new Date(targetMonth.getFullYear(), targetMonth.getMonth() + 1, 0);

  const start = toLocalDateStr(targetMonth);
  const end = toLocalDateStr(lastDay);

  if (offset === 0) return { start, end, label: "This Month" };
  if (offset === 1) return { start, end, label: "Last Month" };

  return { start, end, label: targetMonth.toLocaleDateString("en", { month: "short", year: "numeric" }) };
}

function aggregate(daily: DailyUsage[], start: string, end: string) {
  let tokens = 0, cost = 0, sessions = 0;
  for (const d of daily) {
    if (d.date >= start && d.date <= end) {
      tokens += getTotalTokens(d.tokens);
      cost += d.cost_usd;
      sessions += d.sessions;
    }
  }
  return { tokens, cost, sessions };
}

export function PeriodTotals({ daily }: Props) {
  const [weekOffset, setWeekOffset] = useState(0);
  const [monthOffset, setMonthOffset] = useState(0);

  const weekRange = useMemo(() => getWeekRange(weekOffset), [weekOffset]);
  const monthRange = useMemo(() => getMonthRange(monthOffset), [monthOffset]);

  const weekData = useMemo(() => aggregate(daily, weekRange.start, weekRange.end), [daily, weekRange]);
  const monthData = useMemo(() => aggregate(daily, monthRange.start, monthRange.end), [daily, monthRange]);

  return (
    <div style={{ display: "flex", gap: 10 }}>
      <PeriodCard
        label={weekRange.label}
        tokens={weekData.tokens}
        cost={weekData.cost}
        sessions={weekData.sessions}
        color="var(--accent-purple)"
        onPrev={() => setWeekOffset((o) => o + 1)}
        onNext={() => setWeekOffset((o) => Math.max(0, o - 1))}
        canNext={weekOffset > 0}
      />
      <PeriodCard
        label={monthRange.label}
        tokens={monthData.tokens}
        cost={monthData.cost}
        sessions={monthData.sessions}
        color="var(--accent-pink)"
        onPrev={() => setMonthOffset((o) => o + 1)}
        onNext={() => setMonthOffset((o) => Math.max(0, o - 1))}
        canNext={monthOffset > 0}
      />
    </div>
  );
}

function PeriodCard({ label, tokens, cost, sessions, color, onPrev, onNext, canNext }: {
  label: string; tokens: number; cost: number; sessions: number; color: string;
  onPrev: () => void; onNext: () => void; canNext: boolean;
}) {
  return (
    <div style={{
      flex: 1,
      background: "var(--bg-card)",
      borderRadius: "var(--radius-lg)",
      padding: 18,
      boxShadow: "var(--shadow-card)",
    }}>
      <PeriodSelector label={label} onPrev={onPrev} onNext={onNext} canNext={canNext} />
      <div style={{
        fontSize: 26,
        fontWeight: 800,
        color,
        letterSpacing: "-0.5px",
        marginTop: 6,
      }}>
        {formatTokens(tokens)}
      </div>
      <div style={{
        display: "flex",
        gap: 8,
        marginTop: 4,
        fontSize: 13,
        color: "var(--text-secondary)",
        fontWeight: 600,
      }}>
        <span>{formatCost(cost)}</span>
        <span>&middot;</span>
        <span>{sessions} sessions</span>
      </div>
    </div>
  );
}
