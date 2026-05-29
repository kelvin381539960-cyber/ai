import { createHash } from "node:crypto";
import { Dirent } from "node:fs";
import { opendir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import { and, desc, eq, like, or } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { projectSources, sourceFiles } from "@/lib/db/schema";
import { newId, nowIso } from "@/lib/id";
import { getDefaultProject, parseJson } from "@/lib/services/app-service";
import type { SourceType, WorkflowFileReference } from "@/lib/types";

const defaultIncludes = [
  "**/*.md",
  "**/*.txt",
  "**/*.ts",
  "**/*.tsx",
  "**/*.js",
  "**/*.jsx",
  "**/*.json",
  "**/*.yml",
  "**/*.yaml",
  "**/*.css",
  "**/*.scss",
  "**/*.html",
  "**/*.py",
  "**/*.go",
  "**/*.java",
  "**/*.php",
  "**/*.sql",
];

const defaultExcludes = [
  ".git/**",
  "node_modules/**",
  "dist/**",
  "build/**",
  ".next/**",
  "coverage/**",
  ".env*",
  "**/.env*",
  "**/*.pem",
  "**/*.key",
  "**/*.crt",
  "**/*.p12",
  "**/*.sqlite",
  "**/*.db",
  "**/*.log",
  "**/package-lock.json",
  "**/pnpm-lock.yaml",
  "**/yarn.lock",
];

const blockedRoots = new Set(["/", "/etc", "/var", "/usr", "/bin", "/sbin", "/dev", "/proc", "/sys", "/root", "/private"]);
const maxIndexedFiles = 5000;
const maxSummaryBytes = 4096;
const maxFileBytes = 1024 * 1024;

export async function createProjectSource(input: {
  name: string;
  type: SourceType;
  rootPath: string;
  includePatterns?: string[];
  excludePatterns?: string[];
}) {
  const project = await getDefaultProject();
  const normalizedRoot = await validateSourceRoot(input.rootPath);
  const now = nowIso();
  const id = newId("src");
  await db.insert(projectSources).values({
    id,
    projectId: project.id,
    name: input.name,
    type: input.type,
    rootPath: normalizedRoot,
    includePatterns: JSON.stringify(input.includePatterns?.length ? input.includePatterns : defaultIncludes),
    excludePatterns: JSON.stringify(input.excludePatterns?.length ? input.excludePatterns : defaultExcludes),
    readonly: true,
    status: "pending",
    fileCount: 0,
    lastIndexedAt: null,
    errorMessage: "",
    createdAt: now,
    updatedAt: now,
  });
  return id;
}

export async function updateProjectSource(id: string, input: {
  name: string;
  includePatterns: string[];
  excludePatterns: string[];
}) {
  await getDefaultProject();
  await db
    .update(projectSources)
    .set({
      name: input.name,
      includePatterns: JSON.stringify(input.includePatterns.length ? input.includePatterns : defaultIncludes),
      excludePatterns: JSON.stringify(input.excludePatterns.length ? input.excludePatterns : defaultExcludes),
      status: "pending",
      updatedAt: nowIso(),
    })
    .where(eq(projectSources.id, id));
}

export async function deleteProjectSource(id: string) {
  await getDefaultProject();
  await db.delete(sourceFiles).where(eq(sourceFiles.sourceId, id));
  await db.delete(projectSources).where(eq(projectSources.id, id));
}

export async function listProjectSources() {
  await getDefaultProject();
  return db.select().from(projectSources).orderBy(desc(projectSources.updatedAt));
}

export async function getProjectSource(id: string, query?: string) {
  const [source] = await db.select().from(projectSources).where(eq(projectSources.id, id)).limit(1);
  if (!source) return null;
  const files = query
    ? await db
        .select()
        .from(sourceFiles)
        .where(
          and(
            eq(sourceFiles.sourceId, id),
            or(
              like(sourceFiles.path, `%${query}%`),
              like(sourceFiles.summary, `%${query}%`),
            ),
          ),
        )
        .orderBy(sourceFiles.path)
        .limit(200)
    : await db.select().from(sourceFiles).where(eq(sourceFiles.sourceId, id)).orderBy(sourceFiles.path).limit(200);
  return { source, files };
}

export async function indexProjectSource(id: string) {
  const [source] = await db.select().from(projectSources).where(eq(projectSources.id, id)).limit(1);
  if (!source) throw new Error("Source not found");
  if (source.type !== "server_folder") throw new Error("Only server folder sources can be indexed in v1");

  const now = nowIso();
  await db.update(projectSources).set({ status: "indexing", errorMessage: "", updatedAt: now }).where(eq(projectSources.id, id));

  try {
    const includePatterns = parseJson<string[]>(source.includePatterns, defaultIncludes);
    const excludePatterns = parseJson<string[]>(source.excludePatterns, defaultExcludes);
    const files: Array<typeof sourceFiles.$inferInsert> = [];

    for await (const item of walkSource(source.rootPath, includePatterns, excludePatterns)) {
      if (files.length >= maxIndexedFiles) break;
      const absolutePath = path.join(source.rootPath, item.relativePath);
      const fileStat = await stat(absolutePath);
      if (fileStat.size > maxFileBytes) continue;

      const riskLevel = assessRisk(item.relativePath);
      const summary = riskLevel === "normal" ? await summarizeFile(absolutePath) : "已按安全规则标记，不读取内容摘要。";
      const hash = createHash("sha256").update(`${item.relativePath}:${fileStat.size}:${fileStat.mtimeMs}`).digest("hex");

      files.push({
        id: stableFileId(id, item.relativePath),
        sourceId: id,
        path: item.relativePath,
        language: detectLanguage(item.relativePath),
        sizeBytes: fileStat.size,
        mtimeMs: Math.round(fileStat.mtimeMs),
        hash,
        summary,
        riskLevel,
        indexedAt: now,
      });
    }

    await db.delete(sourceFiles).where(eq(sourceFiles.sourceId, id));
    if (files.length > 0) {
      await db.insert(sourceFiles).values(files);
    }
    await db
      .update(projectSources)
      .set({ status: "indexed", fileCount: files.length, lastIndexedAt: now, errorMessage: "", updatedAt: now })
      .where(eq(projectSources.id, id));
    return files.length;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    await db.update(projectSources).set({ status: "failed", errorMessage: message, updatedAt: nowIso() }).where(eq(projectSources.id, id));
    throw error;
  }
}

export async function resolveFileReferences(refs: WorkflowFileReference[]) {
  const resolved = [];
  for (const ref of refs) {
    const [source] = await db.select().from(projectSources).where(eq(projectSources.id, ref.sourceId)).limit(1);
    if (!source) continue;
    const [file] = await db
      .select()
      .from(sourceFiles)
      .where(eq(sourceFiles.id, stableFileId(ref.sourceId, ref.filePath)))
      .limit(1);
    if (!file || file.riskLevel === "blocked") continue;
    resolved.push({ ref, source, file, absolutePath: path.join(source.rootPath, file.path) });
  }
  return resolved;
}

export function defaultSourcePatterns() {
  return { includes: defaultIncludes, excludes: defaultExcludes };
}

async function validateSourceRoot(rootPath: string) {
  const trimmed = rootPath.trim();
  if (!trimmed) throw new Error("Source path is required");
  if (!path.isAbsolute(trimmed)) throw new Error("Source path must be absolute");
  const resolved = path.resolve(trimmed);
  if (blockedRoots.has(resolved)) throw new Error("System directory cannot be registered as a source");
  const rootStat = await stat(resolved);
  if (!rootStat.isDirectory()) throw new Error("Source path must be a directory");
  return resolved;
}

async function* walkSource(root: string, includes: string[], excludes: string[], current = ""): AsyncGenerator<{ relativePath: string }> {
  const dir = await opendir(path.join(root, current));
  for await (const entry of dir as AsyncIterable<Dirent>) {
    const relativePath = current ? `${current}/${entry.name}` : entry.name;
    if (isExcluded(relativePath, excludes)) continue;
    if (entry.isDirectory()) {
      yield* walkSource(root, includes, excludes, relativePath);
    } else if (entry.isFile() && isIncluded(relativePath, includes)) {
      yield { relativePath };
    }
  }
}

function isIncluded(filePath: string, patterns: string[]) {
  return patterns.length === 0 || patterns.some((pattern) => matchPattern(filePath, pattern));
}

function isExcluded(filePath: string, patterns: string[]) {
  return patterns.some((pattern) => matchPattern(filePath, pattern));
}

function matchPattern(filePath: string, pattern: string) {
  if (pattern.endsWith("/**")) return filePath === pattern.slice(0, -3) || filePath.startsWith(pattern.slice(0, -3));
  if (pattern.startsWith("**/*")) return filePath.endsWith(pattern.slice(4));
  if (pattern.endsWith("*")) return filePath.startsWith(pattern.slice(0, -1));
  return filePath === pattern;
}

function assessRisk(filePath: string) {
  const lower = filePath.toLowerCase();
  if (lower.includes(".env") || lower.endsWith(".pem") || lower.endsWith(".key") || lower.endsWith(".p12")) return "blocked";
  if (lower.includes("secret") || lower.includes("credential") || lower.includes("password")) return "sensitive";
  return "normal";
}

async function summarizeFile(filePath: string) {
  const content = await readFile(filePath, "utf8").catch(() => "");
  const normalized = content
    .slice(0, maxSummaryBytes)
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("//") && !line.startsWith("#") && !line.startsWith("*"))
    .slice(0, 3)
    .join(" / ");
  return maskSensitiveText(normalized).slice(0, 400);
}

function detectLanguage(filePath: string) {
  const ext = path.extname(filePath).toLowerCase();
  const map: Record<string, string> = {
    ".md": "markdown",
    ".txt": "text",
    ".ts": "typescript",
    ".tsx": "typescript-react",
    ".js": "javascript",
    ".jsx": "javascript-react",
    ".json": "json",
    ".yml": "yaml",
    ".yaml": "yaml",
    ".css": "css",
    ".scss": "scss",
    ".html": "html",
    ".py": "python",
    ".go": "go",
    ".java": "java",
    ".php": "php",
    ".sql": "sql",
  };
  return map[ext] ?? "text";
}

function stableFileId(sourceId: string, filePath: string) {
  return `sf_${createHash("sha1").update(`${sourceId}:${filePath}`).digest("hex").slice(0, 24)}`;
}

function maskSensitiveText(text: string) {
  return text
    .replace(/AKIA[0-9A-Z]{16}/g, "[MASKED_AWS_KEY]")
    .replace(/ASIA[0-9A-Z]{16}/g, "[MASKED_AWS_KEY]")
    .replace(/LTAI[0-9A-Za-z]{12,}/g, "[MASKED_ALIYUN_KEY]")
    .replace(/-----BEGIN [^-]+ PRIVATE KEY-----/g, "[MASKED_PRIVATE_KEY]");
}
