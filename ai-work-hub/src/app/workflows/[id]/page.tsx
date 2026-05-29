import { notFound } from "next/navigation";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { Button, Card, PageHeader, Select, TextArea } from "@/components/ui";
import { WorkflowCanvas } from "@/components/workflow-canvas";
import { runWorkflowAction } from "@/app/actions";
import { getWorkflow, listAgents, parseJson } from "@/lib/services/app-service";
import type { WorkflowDefinition } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function WorkflowDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const workflow = await getWorkflow(id);
  if (!workflow) notFound();
  const agents = await listAgents();
  const definition = parseJson<WorkflowDefinition>(workflow.definition, { nodes: [], edges: [] });

  return (
    <AppShell>
      <PageHeader
        title={workflow.name}
        description={workflow.description}
        action={<Link className="rounded-md bg-slate-950 px-4 py-2 text-sm font-medium text-white" href={`/workflows/${workflow.id}/start`}>开始运行</Link>}
      />
      <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          <WorkflowCanvas definition={definition} />
          <Card>
            <h2 className="mb-3 text-lg font-semibold">线性步骤</h2>
            <div className="grid gap-3 md:grid-cols-2">
              {definition.nodes.map((node, index) => (
                <div key={node.id} className="rounded-md border border-slate-200 p-3">
                  <div className="text-xs text-slate-500">Step {index + 1}</div>
                  <div className="mt-1 font-medium">{node.title}</div>
                  <div className="mt-1 text-sm leading-6 text-slate-600">{node.description}</div>
                </div>
              ))}
            </div>
          </Card>
        </div>
        <Card>
          <h2 className="mb-3 text-lg font-semibold">运行 Workflow</h2>
          <form action={runWorkflowAction} className="space-y-3">
            <input type="hidden" name="workflowId" value={workflow.id} />
            <TextArea name="goal" className="min-h-44" placeholder="输入本次目标、背景和预期输出" required />
            <Select name="agentId" defaultValue="agent_manual">
              {agents.map((agent) => (
                <option key={agent.id} value={agent.id}>
                  {agent.name} / {agent.type}
                </option>
              ))}
            </Select>
            <Button type="submit">确认执行</Button>
          </form>
          <p className="mt-4 text-sm leading-6 text-slate-500">
            第一版默认推荐 Manual Agent，真实 CLI 可在 Agent Hub 健康检查通过后选择。
          </p>
        </Card>
      </div>
    </AppShell>
  );
}
