const baseUrl = process.env.AI_WORK_HUB_BASE_URL ?? "http://127.0.0.1:3000";
const token = process.env.AI_WORK_HUB_SMOKE_TOKEN;

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

const workflows = await request("/api/workflows");
const workflow = workflows.items[0];
if (!workflow) throw new Error("No workflow seeded");
console.log("workflow", workflow.id);

const agents = await request("/api/agents");
const manual = agents.items.find((item) => item.id === "agent_manual") ?? agents.items[0];
if (!manual) throw new Error("No agent seeded");
console.log("agent", manual.id);

const run = await request(`/api/workflows/${workflow.id}/run`, {
  method: "POST",
  body: JSON.stringify({
    goal: "生成一个 smoke test PRD 片段",
    agentId: manual.id,
  }),
});
console.log("run", run.id);

const runDetail = await request(`/api/runs/${run.id}`);
if (!runDetail.outputId) throw new Error("Run did not produce output");
console.log("output", runDetail.outputId);

const version = await request(`/api/outputs/${runDetail.outputId}/new-version`, {
  method: "POST",
  body: JSON.stringify({
    content: "# Smoke Output\n\n这是另存的新版本。",
  }),
});
console.log("version", version.id);

await request(`/api/outputs/${version.id}/mark-final`, { method: "POST" });
await request(`/api/outputs/${version.id}/convert-to-knowledge`, { method: "POST" });
console.log("smoke passed");
