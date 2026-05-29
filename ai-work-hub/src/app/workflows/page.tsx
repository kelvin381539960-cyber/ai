import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { Badge, Button, Card, PageHeader } from "@/components/ui";
import { createWorkflowAction, deleteWorkflowAction, duplicateWorkflowAction, updateWorkflowMetaAction } from "@/app/actions";
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
            <Card key={workflow.id} className="h-full">
              <form action={updateWorkflowMetaAction} className="space-y-3">
                <input type="hidden" name="workflowId" value={workflow.id} />
                <div className="flex items-start justify-between gap-3">
                  <Badge>{workflow.scenario}</Badge>
                </div>
                <input className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm" name="name" defaultValue={workflow.name} required />
                <input className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm" name="scenario" defaultValue={workflow.scenario} required />
                <textarea className="min-h-24 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" name="description" defaultValue={workflow.description} />
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs text-slate-500">{new Date(workflow.updatedAt).toLocaleString()}</span>
                  <Button type="submit">保存</Button>
                </div>
              </form>
              <div className="mt-4 flex flex-wrap gap-3 border-t border-slate-100 pt-3">
                <Link href={`/workflows/${workflow.id}/start`} className="rounded-md bg-slate-950 px-4 py-2 text-sm font-medium text-white">开始运行</Link>
                <Link href={`/workflows/${workflow.id}`} className="rounded-md bg-slate-700 px-4 py-2 text-sm font-medium text-white">查看画布</Link>
                <form action={duplicateWorkflowAction}>
                  <input type="hidden" name="workflowId" value={workflow.id} />
                  <Button type="submit" className="bg-slate-700">复制</Button>
                </form>
                {!workflow.id.startsWith("workflow_") ? (
                  <form action={deleteWorkflowAction}>
                    <input type="hidden" name="workflowId" value={workflow.id} />
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
