import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { ensureStorageDirs, dbPath } from "@/lib/paths";
import * as schema from "./schema";

const globalForDb = globalThis as unknown as {
  aiWorkHubClient?: ReturnType<typeof createClient>;
  aiWorkHubReady?: Promise<void>;
};

export const client =
  globalForDb.aiWorkHubClient ??
  createClient({
    url: `file:${dbPath}`,
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.aiWorkHubClient = client;
}

export const db = drizzle(client, { schema });

export async function initDb() {
  if (!globalForDb.aiWorkHubReady) {
    globalForDb.aiWorkHubReady = (async () => {
      await ensureStorageDirs();
      await client.batch(
        [
          `CREATE TABLE IF NOT EXISTS projects (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            description TEXT NOT NULL DEFAULT '',
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
          )`,
          `CREATE TABLE IF NOT EXISTS knowledge_items (
            id TEXT PRIMARY KEY,
            project_id TEXT NOT NULL,
            type TEXT NOT NULL,
            title TEXT NOT NULL,
            content TEXT NOT NULL,
            tags TEXT NOT NULL DEFAULT '[]',
            source_run_id TEXT,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
          )`,
          `CREATE TABLE IF NOT EXISTS rules (
            id TEXT PRIMARY KEY,
            project_id TEXT NOT NULL,
            type TEXT NOT NULL,
            name TEXT NOT NULL,
            content TEXT NOT NULL,
            enabled INTEGER NOT NULL DEFAULT 1,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
          )`,
          `CREATE TABLE IF NOT EXISTS workflows (
            id TEXT PRIMARY KEY,
            project_id TEXT NOT NULL,
            name TEXT NOT NULL,
            scenario TEXT NOT NULL,
            description TEXT NOT NULL DEFAULT '',
            definition TEXT NOT NULL,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
          )`,
          `CREATE TABLE IF NOT EXISTS agents (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            type TEXT NOT NULL,
            agent_key TEXT NOT NULL,
            command TEXT NOT NULL DEFAULT '',
            capabilities TEXT NOT NULL DEFAULT '[]',
            enabled INTEGER NOT NULL DEFAULT 1,
            timeout_seconds INTEGER NOT NULL DEFAULT 300,
            health_status TEXT NOT NULL DEFAULT 'unknown',
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
          )`,
          `CREATE TABLE IF NOT EXISTS runs (
            id TEXT PRIMARY KEY,
            project_id TEXT NOT NULL,
            workflow_id TEXT,
            agent_id TEXT,
            title TEXT NOT NULL,
            status TEXT NOT NULL,
            goal TEXT NOT NULL DEFAULT '',
            context_snapshot TEXT NOT NULL DEFAULT '',
            prompt TEXT NOT NULL DEFAULT '',
            stdout TEXT NOT NULL DEFAULT '',
            stderr TEXT NOT NULL DEFAULT '',
            final_text TEXT NOT NULL DEFAULT '',
            error_message TEXT NOT NULL DEFAULT '',
            events TEXT NOT NULL DEFAULT '[]',
            output_id TEXT,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
          )`,
          `CREATE TABLE IF NOT EXISTS outputs (
            id TEXT PRIMARY KEY,
            project_id TEXT NOT NULL,
            run_id TEXT,
            parent_id TEXT,
            title TEXT NOT NULL,
            content TEXT NOT NULL,
            version INTEGER NOT NULL DEFAULT 1,
            is_final INTEGER NOT NULL DEFAULT 0,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
          )`,
          `CREATE INDEX IF NOT EXISTS idx_knowledge_search ON knowledge_items(project_id, type, title)`,
          `CREATE INDEX IF NOT EXISTS idx_rules_project ON rules(project_id, enabled)`,
          `CREATE INDEX IF NOT EXISTS idx_runs_project ON runs(project_id, created_at)`,
          `CREATE INDEX IF NOT EXISTS idx_outputs_project ON outputs(project_id, updated_at)`,
        ],
        "write",
      );
    })();
  }
  await globalForDb.aiWorkHubReady;
}
