import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { Badge, Button, Card, PageHeader } from "@/components/ui";
import { cancelRunAction, retryRunAction } from "@/app/actions";
import { getRun } from "@/lib/services/app-service";

export const dynamic = "force-dynamic";

export default async function RunDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const run = await getRun(id);
  if (!run) notFound();

  return (
    <AppShell>
      <PageHeader title={run.title} description={run.goal} action={<Badge tone={run.status === "success" ? "green" : run.status === "failed" ? "red" : "amber"}>{run.status}</Badge>} />
      <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          <Card>
            <h2 className="mb-3 text-lg font-semibold">Context Snapshot</h2>
            <pre className="max-h-72 overflow-auto whitespace-pre-wrap rounded-md bg-slate-950 p-4 text-xs leading-6 text-slate-100">{run.contextSnapshot}</pre>
          </Card>
          <Card>
            <h2 className="mb-3 text-lg font-semibold">Prompt</h2>
            <pre className="max-h-72 overflow-auto whitespace-pre-wrap rounded-md bg-slate-950 p-4 text-xs leading-6 text-slate-100">{run.prompt}</pre>
          </Card>
          {run.stderr ? (
            <Card>
              <h2 className="mb-3 text-lg font-semibold">Error</h2>
              <pre className="whitespace-pre-wrap text-sm text-rose-700">{run.stderr || run.errorMessage}</pre>
            </Card>
          ) : null}
        </div>
        <Card>
          <h2 className="mb-3 text-lg font-semibold">操作</h2>
          <div className="space-y-3">
            {run.outputId ? (
              <Link className="block rounded-md bg-slate-950 px-4 py-2 text-center text-sm font-medium text-white" href={`/outputs/${run.outputId}`}>
                查看 Output
              </Link>
            ) : null}
            <form action={retryRunAction}>
              <input type="hidden" name="runId" value={run.id} />
              <Button type="submit" className="w-full bg-slate-700">重试</Button>
            </form>
            <form action={cancelRunAction}>
              <input type="hidden" name="runId" value={run.id} />
              <Button type="submit" className="w-full bg-rose-700">取消</Button>
            </form>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
