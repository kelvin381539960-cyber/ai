import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { Badge, Card, PageHeader } from "@/components/ui";
import { getDashboard, parseJson } from "@/lib/services/app-service";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const dashboard = await getDashboard();

  return (
    <AppShell>
      <PageHeader
        title="智能工作台"
        description="用 Workflow 管理 PRD、调研、方案和复盘；用项目知识库让每次执行都带上上下文；用 Agent Hub 接入 Cursor、Codex、Claude。"
      />
      <div className="grid gap-4 lg:grid-cols-4">
        <Card>
          <div className="text-sm text-slate-500">项目知识</div>
          <div className="mt-2 text-3xl font-semibold">{dashboard.knowledge.length}</div>
        </Card>
        <Card>
          <div className="text-sm text-slate-500">Workflow</div>
          <div className="mt-2 text-3xl font-semibold">{dashboard.workflows.length}</div>
        </Card>
        <Card>
          <div className="text-sm text-slate-500">Agent</div>
          <div className="mt-2 text-3xl font-semibold">{dashboard.agents.length}</div>
        </Card>
        <Card>
          <div className="text-sm text-slate-500">Output</div>
          <div className="mt-2 text-3xl font-semibold">{dashboard.outputs.length}</div>
        </Card>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[1.3fr_1fr]">
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Workflow 模板</h2>
            <Link className="text-sm font-medium text-slate-700 hover:text-slate-950" href="/workflows">
              查看全部
            </Link>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {dashboard.workflows.slice(0, 5).map((workflow) => (
              <Link key={workflow.id} href={`/workflows/${workflow.id}/start`} className="rounded-md border border-slate-200 p-4 hover:bg-slate-50">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold">{workflow.name}</h3>
                    <p className="mt-1 text-sm leading-6 text-slate-600">{workflow.description}</p>
                  </div>
                  <Badge tone="blue">{workflow.scenario}</Badge>
                </div>
              </Link>
            ))}
          </div>
        </Card>

        <Card>
          <h2 className="mb-4 text-lg font-semibold">最近 Runs</h2>
          <div className="space-y-3">
            {dashboard.runs.length === 0 ? (
              <p className="text-sm text-slate-500">还没有执行记录。</p>
            ) : (
              dashboard.runs.map((run) => (
                <Link key={run.id} href={`/runs/${run.id}`} className="block rounded-md border border-slate-200 p-3 hover:bg-slate-50">
                  <div className="flex items-center justify-between gap-3">
                    <div className="truncate text-sm font-medium">{run.title}</div>
                    <Badge tone={run.status === "success" ? "green" : run.status === "failed" ? "red" : "amber"}>{run.status}</Badge>
                  </div>
                  <div className="mt-1 text-xs text-slate-500">{new Date(run.createdAt).toLocaleString()}</div>
                </Link>
              ))
            )}
          </div>
        </Card>
      </div>

      <Card className="mt-5">
        <h2 className="mb-4 text-lg font-semibold">Agent Provider</h2>
        <div className="grid gap-3 md:grid-cols-4">
          {dashboard.agents.map((agent) => (
            <div key={agent.id} className="rounded-md border border-slate-200 p-3">
              <div className="flex items-center justify-between gap-2">
                <div className="font-medium">{agent.name}</div>
                <Badge tone={agent.healthStatus === "ready" ? "green" : "slate"}>{agent.healthStatus}</Badge>
              </div>
              <div className="mt-2 text-xs text-slate-500">{parseJson<string[]>(agent.capabilities, []).join(", ")}</div>
            </div>
          ))}
        </div>
      </Card>
    </AppShell>
  );
}
