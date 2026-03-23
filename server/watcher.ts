import chokidar from "chokidar";
import { homedir } from "os";
import { join } from "path";

type Callback = () => void;

let debounceTimer: ReturnType<typeof setTimeout> | null = null;
const listeners: Set<Callback> = new Set();

export function onStatsChange(cb: Callback): () => void {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

function notify(): void {
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    for (const cb of listeners) cb();
  }, 500);
}

export function startWatcher(): void {
  const claudeDir = join(homedir(), ".claude", "projects");
  const watcher = chokidar.watch(join(claudeDir, "**/*.jsonl"), {
    ignoreInitial: true,
    awaitWriteFinish: { stabilityThreshold: 300 },
  });

  watcher.on("add", notify);
  watcher.on("change", notify);
}
