import { mkdir } from "node:fs/promises";
import { mkdirSync } from "node:fs";
import path from "node:path";

export const appDataDir =
  process.env.AI_WORK_HUB_DATA_DIR ?? path.join(process.cwd(), "data");

export const dbPath = path.join(appDataDir, "db.sqlite");

mkdirSync(appDataDir, { recursive: true });

export const storageDirs = {
  knowledge: path.join(appDataDir, "knowledge"),
  outputs: path.join(appDataDir, "outputs"),
  runs: path.join(appDataDir, "runs"),
  workflows: path.join(appDataDir, "workflows"),
};

export async function ensureStorageDirs() {
  await mkdir(appDataDir, { recursive: true });
  await Promise.all(
    Object.values(storageDirs).map((dir) => mkdir(dir, { recursive: true })),
  );
}
