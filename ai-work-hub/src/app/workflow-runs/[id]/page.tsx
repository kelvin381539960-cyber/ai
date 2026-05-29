import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { Badge, Button, Card, PageHeader, TextArea } from "@/components/ui";
import {
  cancelWorkflowRunAction,
  continueWorkflowRunAction,
  retryWorkflowStepAction,
  startWorkflowRunAction,
} from "@/app/actions";
import { getWorkflowRun } from "@/lib/services/workflow-run-service";

export const dynamic = "force-dynamic";

function tone(status: string) {
  if (status === "success") return "green";
  if (status === "failed" || status === "cancelled") return "red";
  if (status === "running" || status === "waiting_user") return "amber";
  return "slate";
}

export default async function WorkflowRunPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getWorkflowRun(id);
  if (!data) notFound();
  const { run, steps, workflow, agent, output } = data;
  const currentStep = steps.find((step) => step?.stepId === run.currentStepId) ?? steps.find((step) => step?.status === "waiting_user") ?? steps[0];

  return (
    <AppShell>
      <PageHeader
        title={run.title}
        description={`${workflow?.name ?? "Workflow"} · ${agent?.name ?? "No agent"}`}
        action={<Badge tone={tone(run.status)}>{run.status}</Badge>}
      />
      <div className="grid gap-5 xl:grid-cols-[280px_1fr_360px]">
        <Card>
          <h2 className="mb-4 text-lg font-semibold">步骤</h2>
          <div className="space-y-2">
            {steps.map((step, index) => step ? (
              <div key={step.id} className={`rounded-md border p-3 ${step.stepId === run.currentStepId ? "border-slate-950 bg-slate-50" : "border-slate-200"}`}>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs text-slate-500">Step {index + 1}</span>
                  <Badge tone={tone(step.status)}>{step.status}</Badge>
                </div>
                <div className="mt-1 text-sm font-medium">{step.title}</div>
              </div>
            ) : null)}
          </div>
        </Card>

        <div className="space-y-5">
          <Card>
            <h2 className="mb-3 text-lg font-semibold">当前步骤</h2>
            {currentStep ? (
              <div>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="font-medium">{currentStep.title}</div>
                    <div className="mt-1 text-sm text-slate-500">{currentStep.stepType}</div>
                  </div>
                  <Badge tone={tone(currentStep.status)}>{currentStep.status}</Badge>
                </div>
                {currentStep.output ? <pre className="mt-4 whitespace-pre-wrap rounded-md bg-slate-50 p-3 text-sm leading-6 text-slate-700">{currentStep.output}</pre> : null}
                {currentStep.error ? <pre className="mt-4 whitespace-pre-wrap rounded-md bg-rose-50 p-3 text-sm leading-6 text-rose-700">{currentStep.error}</pre> : null}
              </div>
            ) : null}
          </Card>

          <Card>
            <h2 className="mb-3 text-lg font-semibold">Context Snapshot</h2>
            <pre className="max-h-96 overflow-auto whitespace-pre-wrap rounded-md bg-slate-950 p-4 text-xs leading-6 text-slate-100">{run.contextSnapshot}</pre>
          </Card>

          <Card>
            <h2 className="mb-3 text-lg font-semibold">Prompt</h2>
            <pre className="max-h-72 overflow-auto whitespace-pre-wrap rounded-md bg-slate-950 p-4 text-xs leading-6 text-slate-100">{run.prompt}</pre>
          </Card>
        </div>

        <Card>
          <h2 className="mb-3 text-lg font-semibold">操作</h2>
          <div className="space-y-3">
            {run.status === "pending" ? (
              <form action={startWorkflowRunAction}>
                <input type="hidden" name="workflowRunId" value={run.id} />
                <Button type="submit" className="w-full">开始</Button>
              </form>
            ) : null}

            {run.status === "waiting_user" ? (
              <form action={continueWorkflowRunAction} className="space-y-3">
                <input type="hidden" name="workflowRunId" value={run.id} />
                <TextArea name="manualOutput" placeholder="如果外部 AI 已返回结果，粘贴到这里；如果只是确认审阅，可留空继续。" className="min-h-40" />
                <Button type="submit" className="w-full">回填并继续</Button>
              </form>
            ) : null}

            {currentStep ? (
              <form action={retryWorkflowStepAction}>
                <input type="hidden" name="workflowRunId" value={run.id} />
                <input type="hidden" name="stepId" value={currentStep.stepId} />
                <Button type="submit" className="w-full bg-slate-700">重试当前步骤</Button>
              </form>
            ) : null}

            <form action={cancelWorkflowRunAction}>
              <input type="hidden" name="workflowRunId" value={run.id} />
              <Button type="submit" className="w-full bg-rose-700">取消</Button>
            </form>

            {output ? (
              <Link className="block rounded-md bg-emerald-700 px-4 py-2 text-center text-sm font-medium text-white" href={`/outputs/${output.id}`}>
                打开 Output Draft
              </Link>
            ) : null}
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
