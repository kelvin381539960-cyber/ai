import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { Badge, Button, Card, PageHeader } from "@/components/ui";
import { createWorkflowAction } from "@/app/actions";
import { listWorkflows } from "@/lib/services/app-service";
import { workflowTemplates } from "@/lib/templates/workflows";

export const dynamic = "force-dynamic";

export default async function WorkflowsPage() {
  const workflows = await listWorkflows();

  return (
    <AppShell>
      <PageHeader title="Workflow Studio" description="第一版使用可视化线性画布：可以管理步骤，但底层不做分支、循环或并行。" />
      <div className="grid gap-5 lg:grid-cols-[380px_1fr]">
        <Card>
          <h2 className="mb-3 text-lg font-semibold">从模板创建</h2>
          <div className="space-y-3">
            {workflowTemplates.map((template) => (
              <form action={createWorkflowAction} key={template.id} className="rounded-md border border-slate-200 p-3">
                <input type="hidden" name="templateId" value={template.id} />
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-medium">{template.name}</div>
                    <p className="mt-1 text-sm leading-6 text-slate-600">{template.description}</p>
                  </div>
                  <Badge tone="blue">{template.scenario}</Badge>
                </div>
                <Button type="submit" className="mt-3">创建</Button>
              </form>
            ))}
          </div>
        </Card>
        <div className="grid gap-4 md:grid-cols-2">
          {workflows.map((workflow) => (
            <Link key={workflow.id} href={`/workflows/${workflow.id}/start`}>
              <Card className="h-full hover:bg-slate-50">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-semibold">{workflow.name}</h3>
                  <Badge>{workflow.scenario}</Badge>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-600">{workflow.description}</p>
                <div className="mt-4 flex items-center justify-between gap-3">
                  <span className="text-xs text-slate-500">{new Date(workflow.updatedAt).toLocaleString()}</span>
                  <span className="text-sm font-medium text-slate-900">开始运行</span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
