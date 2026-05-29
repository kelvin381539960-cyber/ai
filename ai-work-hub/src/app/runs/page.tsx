import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { Badge, Card, PageHeader } from "@/components/ui";
import { listRuns } from "@/lib/services/app-service";

export const dynamic = "force-dynamic";

export default async function RunsPage() {
  const runs = await listRuns();
  return (
    <AppShell>
      <PageHeader title="Run Center" description="记录每次 Workflow 和 Agent 执行的输入、上下文快照、日志、错误和输出。" />
      <div className="space-y-3">
        {runs.map((run) => (
          <Link key={run.id} href={`/runs/${run.id}`}>
            <Card className="hover:bg-slate-50">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="font-semibold">{run.title}</h3>
                  <p className="mt-1 text-sm text-slate-500">{run.goal}</p>
                </div>
                <Badge tone={run.status === "success" ? "green" : run.status === "failed" ? "red" : "amber"}>{run.status}</Badge>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </AppShell>
  );
}
