import { AppShell } from "@/components/app-shell";
import { Badge, Button, Card, PageHeader, Select, TextInput } from "@/components/ui";
import { createAgentAction, deleteAgentAction, testAgentAction, toggleAgentAction, updateAgentAction } from "@/app/actions";
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
              <form action={updateAgentAction} className="space-y-3">
                <input type="hidden" name="agentId" value={agent.id} />
                <div className="flex items-start justify-between gap-3">
                  <Badge tone={agent.enabled ? "green" : "slate"}>{agent.enabled ? "enabled" : "disabled"}</Badge>
                  <Badge tone={agent.healthStatus === "ready" ? "green" : agent.healthStatus === "missing" ? "red" : "slate"}>
                    {agent.healthStatus}
                  </Badge>
                </div>
                <TextInput name="name" defaultValue={agent.name} required />
                <Select name="type" defaultValue={agent.type}>
                  <option value="harness">Harness</option>
                  <option value="direct_cli">Direct CLI</option>
                  <option value="manual">Manual</option>
                </Select>
                <TextInput name="agentKey" defaultValue={agent.agentKey} required />
                <TextInput name="command" defaultValue={agent.command} />
                <TextInput name="timeoutSeconds" type="number" min="30" defaultValue={agent.timeoutSeconds} />
                <TextInput name="tags" defaultValue={parseJson<string[]>(agent.capabilities, []).join(",")} />
                <Button type="submit">保存修改</Button>
              </form>
              <div className="mt-4 flex flex-wrap gap-3 border-t border-slate-100 pt-3">
                <form action={testAgentAction}>
                  <input type="hidden" name="agentId" value={agent.id} />
                  <input type="hidden" name="command" value={agent.command} />
                  <Button type="submit" className="bg-slate-700">健康检查</Button>
                </form>
                <form action={toggleAgentAction}>
                  <input type="hidden" name="agentId" value={agent.id} />
                  <input type="hidden" name="enabled" value={agent.enabled ? "false" : "true"} />
                  <Button type="submit" className="bg-slate-700">{agent.enabled ? "禁用" : "启用"}</Button>
                </form>
                {!agent.id.startsWith("agent_") ? (
                  <form action={deleteAgentAction}>
                    <input type="hidden" name="agentId" value={agent.id} />
                    <label className="mr-3 inline-flex items-center gap-2 text-xs text-slate-500">
                      <input type="checkbox" name="confirmDelete" value="yes" required />
                      确认删除
                    </label>
                    <Button type="submit" className="bg-rose-700">删除</Button>
                  </form>
                ) : null}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
