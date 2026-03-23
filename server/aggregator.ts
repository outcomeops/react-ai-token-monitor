import type { SessionEntry, AllStats, DailyUsage, ModelUsage } from "./types.js";
import { getPricing, calculateCost } from "./pricing.js";

export function aggregateEntries(entries: SessionEntry[]): AllStats {
  const dailyMap = new Map<string, DailyUsage>();
  const modelUsageMap = new Map<string, ModelUsage>();
  const dailySessionIds = new Map<string, Set<string>>();
  let totalMessages = 0;
  let firstDate: string | null = null;

  for (const entry of entries) {
    totalMessages++;

    if (firstDate === null || entry.date < firstDate) {
      firstDate = entry.date;
    }

    const pricing = getPricing(entry.model);
    const cost = calculateCost(
      pricing,
      entry.inputTokens,
      entry.outputTokens,
      entry.cacheReadInputTokens,
      entry.cacheCreationInputTokens,
    );
    const totalTokens = entry.inputTokens + entry.outputTokens;

    // Daily aggregation
    let daily = dailyMap.get(entry.date);
    if (!daily) {
      daily = {
        date: entry.date,
        tokens: {},
        cost_usd: 0,
        messages: 0,
        sessions: 0,
        input_tokens: 0,
        output_tokens: 0,
        cache_read_tokens: 0,
        cache_write_tokens: 0,
      };
      dailyMap.set(entry.date, daily);
    }
    daily.tokens[entry.model] = (daily.tokens[entry.model] ?? 0) + totalTokens;
    daily.cost_usd += cost;
    daily.messages++;
    daily.input_tokens += entry.inputTokens;
    daily.output_tokens += entry.outputTokens;
    daily.cache_read_tokens += entry.cacheReadInputTokens;
    daily.cache_write_tokens += entry.cacheCreationInputTokens;

    // Track sessions per day
    if (entry.sessionId) {
      let sessions = dailySessionIds.get(entry.date);
      if (!sessions) {
        sessions = new Set();
        dailySessionIds.set(entry.date, sessions);
      }
      sessions.add(entry.sessionId);
    }

    // Model aggregation
    let mu = modelUsageMap.get(entry.model);
    if (!mu) {
      mu = { input_tokens: 0, output_tokens: 0, cache_read: 0, cache_write: 0, cost_usd: 0 };
      modelUsageMap.set(entry.model, mu);
    }
    mu.input_tokens += entry.inputTokens;
    mu.output_tokens += entry.outputTokens;
    mu.cache_read += entry.cacheReadInputTokens;
    mu.cache_write += entry.cacheCreationInputTokens;
    mu.cost_usd += cost;
  }

  // Set session counts
  for (const [date, sessionIds] of dailySessionIds) {
    const daily = dailyMap.get(date);
    if (daily) daily.sessions = sessionIds.size;
  }

  // Sort daily by date
  const daily = Array.from(dailyMap.values()).sort((a, b) => a.date.localeCompare(b.date));
  const totalSessions = daily.reduce((sum, d) => sum + d.sessions, 0);

  return {
    daily,
    model_usage: Object.fromEntries(modelUsageMap),
    total_sessions: totalSessions,
    total_messages: totalMessages,
    first_session_date: firstDate,
  };
}
