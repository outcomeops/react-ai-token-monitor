import { useState, useMemo } from "react";
import { useTokenStats } from "./hooks/useTokenStats";
import { getTotalTokens, toLocalDateStr } from "./lib/format";
import { Header } from "./components/Header";
import { TabBar } from "./components/TabBar";
import type { TabType } from "./components/TabBar";
import { TodaySummary } from "./components/TodaySummary";
import { DailyChart } from "./components/DailyChart";
import { Heatmap } from "./components/Heatmap";
import { ModelBreakdown } from "./components/ModelBreakdown";
import { PeriodTotals } from "./components/PeriodTotals";
import { CacheEfficiency } from "./components/CacheEfficiency";
import { ActivityGraph } from "./components/ActivityGraph";

function App() {
  const { stats, error, loading, refetch } = useTokenStats();
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const todayStr = toLocalDateStr(new Date());

  const { today, weekAvg } = useMemo(() => {
    if (!stats) return { today: null, weekAvg: 0 };

    const today = stats.daily.find((d) => d.date === todayStr) ?? null;

    const last7 = stats.daily
      .filter((d) => {
        const diff = (new Date(todayStr).getTime() - new Date(d.date).getTime()) / 86400000;
        return diff >= 1 && diff <= 7;
      })
      .map((d) => getTotalTokens(d.tokens));

    const weekAvg = last7.length > 0
      ? last7.reduce((a, b) => a + b, 0) / last7.length
      : 0;

    return { today, weekAvg };
  }, [stats, todayStr]);

  if (loading) {
    return (
      <Shell>
        <Header />
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "center",
          flex: 1, color: "var(--text-secondary)", fontSize: 13, fontWeight: 600,
          minHeight: 200,
        }}>
          Loading...
        </div>
      </Shell>
    );
  }

  if (error || !stats) {
    return (
      <Shell>
        <Header onRefresh={refetch} />
        <div style={{
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          flex: 1, gap: 8, color: "var(--text-secondary)", fontSize: 12, fontWeight: 600,
          textAlign: "center", padding: 20, minHeight: 200,
        }}>
          <div style={{ fontSize: 24 }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 8v4M12 16h.01"/>
            </svg>
          </div>
          <div>Could not load stats</div>
          <div style={{ fontSize: 10 }}>Make sure Claude Code has been used at least once</div>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <Header onRefresh={refetch} />
      <TabBar activeTab={activeTab} onChange={setActiveTab} />

      <div style={{ display: activeTab === "overview" ? "contents" : "none" }}>
        <TodaySummary today={today} weekAvg={weekAvg} />
        <DailyChart daily={stats.daily} days={7} />
        <PeriodTotals daily={stats.daily} />
        <Heatmap daily={stats.daily} weeks={8} />
      </div>

      <div style={{ display: activeTab === "analytics" ? "contents" : "none" }}>
        <ActivityGraph daily={stats.daily} />
        <DailyChart daily={stats.daily} days={30} />
        <PeriodTotals daily={stats.daily} />
        <ModelBreakdown modelUsage={stats.model_usage} />
        <CacheEfficiency stats={stats} />
      </div>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      maxWidth: 900,
      margin: "0 auto",
      padding: "24px 32px",
      display: "flex",
      flexDirection: "column",
      gap: 16,
      minHeight: "100vh",
    }}>
      {children}
    </div>
  );
}

export default App;
