import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const baseUrl = process.env.AI_WORK_HUB_BASE_URL ?? "http://127.0.0.1:3000";
const token = process.env.AI_WORK_HUB_SMOKE_TOKEN;
const fixtureDir = path.join(process.cwd(), "data", "smoke-codebase");

async function request(path, options) {
  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      "content-type": "application/json",
      ...(token ? { "x-ai-work-hub-token": token } : {}),
      ...(options?.headers ?? {}),
    },
  });
  if (!response.ok) {
    throw new Error(`${path} failed: ${response.status} ${await response.text()}`);
  }
  return response.json();
}

const health = await request("/api/health");
console.log("health", health.ok);

const knowledge = await request("/api/knowledge", {
  method: "POST",
  body: JSON.stringify({
    title: "Smoke 项目背景",
    type: "background",
    tags: ["smoke"],
    content: "这是 smoke test 写入的项目背景，用于验证知识库和上下文构建。",
  }),
});
console.log("knowledge", knowledge.id);

const rule = await request("/api/rules", {
  method: "POST",
  body: JSON.stringify({
    name: "Smoke 输出规则",
    type: "output",
    content: "输出必须简洁、结构化、可验证。",
  }),
});
console.log("rule", rule.id);

await mkdir(fixtureDir, { recursive: true });
await writeFile(
  path.join(fixtureDir, "README.md"),
  "# Smoke Codebase\n\nThis fixture verifies server folder context source indexing.\n",
);
await writeFile(
  path.join(fixtureDir, "product.ts"),
  "export const smokeProduct = { name: 'AI Work Hub', scenario: 'context source' };\n",
);

const source = await request("/api/context/sources", {
  method: "POST",
  body: JSON.stringify({
    name: "Smoke Codebase",
    type: "server_folder",
    rootPath: fixtureDir,
    includePatterns: ["**/*.md", "**/*.ts"],
    indexNow: true,
  }),
});
const sourceDetail = await request(`/api/context/sources/${source.id}`);
const sourceFile = sourceDetail.files.find((file) => file.path === "product.ts") ?? sourceDetail.files[0];
if (!sourceFile) throw new Error("Source indexing produced no files");
console.log("source", source.id, sourceFile.path);

const workflows = await request("/api/workflows");
const workflow = workflows.items[0];
if (!workflow) throw new Error("No workflow seeded");
console.log("workflow", workflow.id);

const agents = await request("/api/agents");
const manual = agents.items.find((item) => item.id === "agent_manual") ?? agents.items[0];
if (!manual) throw new Error("No agent seeded");
console.log("agent", manual.id);

const workflowRun = await request("/api/workflow-runs", {
  method: "POST",
  body: JSON.stringify({
    workflowId: workflow.id,
    title: "Smoke v2 PRD",
    goal: "生成一个 smoke test PRD 片段",
    background: "验证成熟 Workflow 主路径。",
    expectedOutput: "PRD 片段",
    constraints: "保持简洁。",
    selectedKnowledgeIds: [knowledge.id],
    selectedRuleIds: [rule.id],
    selectedFileRefs: [{ sourceId: source.id, filePath: sourceFile.path, mode: "reference_only" }],
    workspacePath: fixtureDir,
    temporaryRules: "输出 Markdown。",
    agentId: manual.id,
  }),
});
console.log("workflowRun", workflowRun.id);

await request(`/api/workflow-runs/${workflowRun.id}/start`, { method: "POST" });
let runDetail = await request(`/api/workflow-runs/${workflowRun.id}`);
if (runDetail.run.status !== "waiting_user") throw new Error(`Expected waiting_user, got ${runDetail.run.status}`);

await request(`/api/workflow-runs/${workflowRun.id}/steps/complete`, {
  method: "POST",
  body: JSON.stringify({
    content: "# Smoke Output\n\n这是 v2 workflow run 回填的输出。",
  }),
});
runDetail = await request(`/api/workflow-runs/${workflowRun.id}`);
if (!runDetail.run.outputId) throw new Error("Workflow run did not produce output");
console.log("output", runDetail.run.outputId);

const version = await request(`/api/outputs/${runDetail.run.outputId}/new-version`, {
  method: "POST",
  body: JSON.stringify({
    content: "# Smoke Output\n\n这是另存的新版本。",
  }),
});
console.log("version", version.id);

await request(`/api/outputs/${version.id}/mark-final`, { method: "POST" });
await request(`/api/outputs/${version.id}/convert-to-knowledge`, { method: "POST" });
console.log("smoke passed");
