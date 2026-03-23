import { readFileSync, statSync } from "fs";
import { globSync } from "glob";
import { homedir } from "os";
import { join } from "path";
import type { SessionEntry } from "./types.js";

// Track file offsets for incremental parsing
const fileOffsets = new Map<string, number>();
const dedupMap = new Map<string, SessionEntry>();

export function resetParser(): void {
  fileOffsets.clear();
  dedupMap.clear();
}

export function parseSessionLine(line: string): SessionEntry | null {
  // Quick pre-filter
  if (!line.includes('"type":"assistant"')) return null;

  try {
    const value = JSON.parse(line);
    if (value.type !== "assistant") return null;

    const message = value.message;
    if (!message?.usage?.input_tokens) return null;

    const timestamp = value.timestamp;
    if (!timestamp) return null;
    // Convert to local time so dates match the user's browser timezone
    // Set TZ env var on the server to match the user's timezone
    const d = new Date(timestamp);
    const date = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

    const model: string = message.model;
    if (!model || model.startsWith("<") || model === "synthetic") return null;

    return {
      date,
      model,
      sessionId: value.sessionId ?? "",
      messageId: message.id ?? "",
      requestId: value.requestId ?? "",
      inputTokens: message.usage.input_tokens ?? 0,
      outputTokens: message.usage.output_tokens ?? 0,
      cacheReadInputTokens: message.usage.cache_read_input_tokens ?? 0,
      cacheCreationInputTokens: message.usage.cache_creation_input_tokens ?? 0,
    };
  } catch {
    return null;
  }
}

function discoverJsonlFiles(claudeDir: string): string[] {
  const pattern = join(claudeDir, "projects", "**", "*.jsonl");
  return globSync(pattern);
}

export function parseAllFiles(): Map<string, SessionEntry> {
  const claudeDir = join(homedir(), ".claude");
  const files = discoverJsonlFiles(claudeDir);

  for (const filePath of files) {
    let fileSize: number;
    try {
      fileSize = statSync(filePath).size;
    } catch {
      continue;
    }

    const prevOffset = fileOffsets.get(filePath) ?? 0;
    const startOffset = prevOffset > fileSize ? 0 : prevOffset;

    if (startOffset >= fileSize) continue;

    try {
      const content = readFileSync(filePath, "utf-8");
      // Skip to the offset position by counting bytes
      const sliced = startOffset > 0 ? content.slice(startOffset) : content;
      const lines = sliced.split("\n");

      for (const line of lines) {
        if (!line.trim()) continue;
        const entry = parseSessionLine(line);
        if (entry) {
          const key = `${entry.messageId}:${entry.requestId}`;
          dedupMap.set(key, entry);
        }
      }

      fileOffsets.set(filePath, fileSize);
    } catch {
      // Skip files we can't read
    }
  }

  return dedupMap;
}

export function getEntries(): SessionEntry[] {
  return Array.from(parseAllFiles().values());
}
