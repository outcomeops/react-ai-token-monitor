import { useEffect, useRef, useState, useCallback } from "react";
import type { AllStats } from "../lib/types";

export function useTokenStats() {
  const [stats, setStats] = useState<AllStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const hasDataRef = useRef(false);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch("/api/stats");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: AllStats = await res.json();
      setStats(data);
      setError(null);
      hasDataRef.current = true;
    } catch (e) {
      if (!hasDataRef.current) {
        setError(String(e));
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();

    // SSE for live updates
    const eventSource = new EventSource("/api/events");
    eventSource.onmessage = (event) => {
      if (event.data === "stats-updated") {
        fetchStats();
      }
    };

    // Fallback polling every 60s
    const interval = setInterval(fetchStats, 60_000);

    return () => {
      eventSource.close();
      clearInterval(interval);
    };
  }, [fetchStats]);

  return { stats, error, loading, refetch: fetchStats };
}
