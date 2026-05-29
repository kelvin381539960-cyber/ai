import { AppShell } from "@/components/app-shell";
import { Badge, Button, Card, PageHeader, Select, TextInput } from "@/components/ui";
import { createAgentAction, testAgentAction } from "@/app/actions";
import { listAgents, parseJson } from "@/lib/services/app-service";

export const dynamic = "force-dynamic";

export default async function AgentsPage() {
  const agents = await listAgents();

  return (
    <AppShell>
      <PageHeader title="Agent Hub" description="把 Cursor、Codex、Claude、Manual 当成不同 Provider 管理。Harness 优先，Direct CLI 兜底。" />
      <div className="grid gap-5 lg:grid-cols-[380px_1fr]">
        <Card>
          <h2 className="mb-3 text-lg font-semibold">新增 Agent</h2>
          <form action={createAgentAction} className="space-y-3">
            <TextInput name="name" placeholder="Agent 名称" required />
            <Select name="type" defaultValue="harness">
              <option value="harness">Harness</option>
              <option value="direct_cli">Direct CLI</option>
              <option value="manual">Manual</option>
            </Select>
            <TextInput name="agentKey" placeholder="cursor / codex / claude / manual" required />
            <TextInput name="command" placeholder="harness / cursor-agent / codex / claude" />
            <TextInput name="tags" placeholder="能力，如 prd,research,proposal" />
            <Button type="submit">保存 Agent</Button>
          </form>
        </Card>
        <div className="grid gap-4 md:grid-cols-2">
          {agents.map((agent) => (
            <Card key={agent.id}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold">{agent.name}</h3>
                  <p className="mt-1 text-sm text-slate-500">{agent.type} / {agent.agentKey}</p>
                </div>
                <Badge tone={agent.healthStatus === "ready" ? "green" : agent.healthStatus === "missing" ? "red" : "slate"}>
                  {agent.healthStatus}
                </Badge>
              </div>
              <div className="mt-3 text-sm text-slate-600">命令：{agent.command || "manual"}</div>
              <div className="mt-3 flex flex-wrap gap-2">
                {parseJson<string[]>(agent.capabilities, []).map((capability) => (
                  <Badge key={capability}>{capability}</Badge>
                ))}
              </div>
              <form action={testAgentAction} className="mt-4">
                <input type="hidden" name="agentId" value={agent.id} />
                <input type="hidden" name="command" value={agent.command} />
                <Button type="submit" className="bg-slate-700">健康检查</Button>
              </form>
            </Card>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
