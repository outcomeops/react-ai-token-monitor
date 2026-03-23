import express from "express";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { existsSync } from "fs";
import type { Response } from "express";
import { getEntries, resetParser } from "./parser.js";
import { aggregateEntries } from "./aggregator.js";
import { startWatcher, onStatsChange } from "./watcher.js";
import type { AllStats } from "./types.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT) || 3002;

const app = express();

// --- Stats cache ---
let cachedStats: AllStats | null = null;

function getStats(): AllStats {
  if (!cachedStats) {
    const entries = getEntries();
    cachedStats = aggregateEntries(entries);
  }
  return cachedStats;
}

function invalidateCache(): void {
  cachedStats = null;
}

// --- SSE connections ---
const sseClients = new Set<Response>();

onStatsChange(() => {
  invalidateCache();
  // Push to all SSE clients
  for (const res of sseClients) {
    res.write(`data: stats-updated\n\n`);
  }
});

// --- Routes ---
app.get("/api/stats", (_req, res) => {
  try {
    const stats = getStats();
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

app.get("/api/events", (req, res) => {
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });
  res.write(`data: connected\n\n`);

  sseClients.add(res);
  req.on("close", () => sseClients.delete(res));
});

app.get("/api/debug", (_req, res) => {
  const now = new Date();
  res.json({
    serverTZ: process.env.TZ,
    serverNow: now.toString(),
    serverToday: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`,
    latestDates: getStats().daily.slice(-3).map(d => d.date),
  });
});

app.post("/api/refresh", (_req, res) => {
  resetParser();
  invalidateCache();
  const stats = getStats();
  res.json(stats);
});

// --- Static files (production) ---
const distDir = join(__dirname, "..", "dist");
if (existsSync(distDir)) {
  app.use(express.static(distDir));
  app.get("/{*splat}", (_req, res) => {
    res.sendFile(join(distDir, "index.html"));
  });
}

// --- Start ---
startWatcher();

app.listen(PORT, "0.0.0.0", () => {
  console.log(`API server running on http://0.0.0.0:${PORT}`);
});
