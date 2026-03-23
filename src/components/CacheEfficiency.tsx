import type { AllStats } from "../lib/types";

interface Props {
  stats: AllStats;
}

export function CacheEfficiency({ stats }: Props) {
  let totalInput = 0;
  let totalCacheRead = 0;
  let totalCacheWrite = 0;

  for (const usage of Object.values(stats.model_usage)) {
    totalInput += usage.input_tokens;
    totalCacheRead += usage.cache_read;
    totalCacheWrite += usage.cache_write;
  }

  const hitRate = totalInput + totalCacheRead > 0
    ? (totalCacheRead / (totalInput + totalCacheRead)) * 100
    : 0;

  const R = 48;
  const STROKE = 10;
  const C = 2 * Math.PI * R;
  const filled = (hitRate / 100) * C;

  return (
    <div style={{
      background: "var(--bg-card)",
      borderRadius: "var(--radius-lg)",
      padding: 20,
      boxShadow: "var(--shadow-card)",
    }}>
      <div style={{
        fontSize: 13, fontWeight: 700, color: "var(--text-secondary)",
        textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 14,
      }}>
        Cache Efficiency
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        <div style={{ position: "relative", width: 116, height: 116, flexShrink: 0 }}>
          <svg viewBox="0 0 116 116" width="116" height="116">
            <circle cx="58" cy="58" r={R} fill="none" stroke="var(--heat-0)" strokeWidth={STROKE} />
            <circle
              cx="58" cy="58" r={R} fill="none"
              stroke="var(--accent-mint)" strokeWidth={STROKE}
              strokeDasharray={`${filled} ${C - filled}`}
              strokeDashoffset={C / 4} strokeLinecap="round"
              style={{ transition: "stroke-dasharray 0.4s ease" }}
            />
          </svg>
          <div style={{
            position: "absolute", inset: 0,
            display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column",
          }}>
            <span style={{ fontSize: 24, fontWeight: 800, color: "var(--accent-mint)", lineHeight: 1 }}>
              {hitRate.toFixed(1)}%
            </span>
            <span style={{ fontSize: 11, color: "var(--text-secondary)", fontWeight: 600 }}>
              cached
            </span>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <CacheStat label="Cache Read" value={totalCacheRead} color="var(--accent-mint)" />
          <CacheStat label="Cache Write" value={totalCacheWrite} color="var(--accent-orange)" />
          <CacheStat label="Input" value={totalInput} color="var(--accent-purple)" />
        </div>
      </div>
    </div>
  );
}

function CacheStat({ label, value, color }: { label: string; value: number; color: string }) {
  const formatted = value >= 1_000_000
    ? `${(value / 1_000_000).toFixed(1)}M`
    : value >= 1_000
      ? `${(value / 1_000).toFixed(1)}K`
      : String(value);

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <div style={{ width: 6, height: 6, borderRadius: 2, background: color, flexShrink: 0 }} />
      <span style={{ fontSize: 13, color: "var(--text-secondary)", fontWeight: 600, width: 90 }}>
        {label}
      </span>
      <span style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>
        {formatted}
      </span>
    </div>
  );
}
