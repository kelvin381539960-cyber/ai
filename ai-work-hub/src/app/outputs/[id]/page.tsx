import { notFound } from "next/navigation";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { Badge, Button, Card, PageHeader, TextArea } from "@/components/ui";
import { markOutputFinalAction, outputToKnowledgeAction, saveOutputVersionAction } from "@/app/actions";
import { getOutputFamily, listWorkflows } from "@/lib/services/app-service";

export const dynamic = "force-dynamic";

export default async function OutputDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { output, versions } = await getOutputFamily(id);
  if (!output) notFound();
  const workflows = await listWorkflows();

  return (
    <AppShell>
      <PageHeader title={output.title} description={`Markdown Output v${output.version}`} action={<Badge tone={output.isFinal ? "green" : "slate"}>{output.isFinal ? "最终版" : "草稿"}</Badge>} />
      <div className="grid gap-5 xl:grid-cols-[260px_1fr_360px]">
        <Card>
          <h2 className="mb-3 text-lg font-semibold">版本</h2>
          <div className="space-y-2">
            {versions.map((version) => (
              <Link key={version.id} href={`/outputs/${version.id}`} className={`block rounded-md border p-3 ${version.id === output.id ? "border-slate-950 bg-slate-50" : "border-slate-200"}`}>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium">v{version.version}</span>
                  {version.isFinal ? <Badge tone="green">final</Badge> : <Badge>draft</Badge>}
                </div>
                <div className="mt-1 text-xs text-slate-500">{new Date(version.updatedAt).toLocaleString()}</div>
              </Link>
            ))}
          </div>
        </Card>
        <Card>
          <form action={saveOutputVersionAction} className="space-y-3">
            <input type="hidden" name="outputId" value={output.id} />
            <TextArea name="content" defaultValue={output.content} className="min-h-[560px] font-mono text-sm" />
            <Button type="submit">另存为新版本</Button>
          </form>
          <div className="mt-5 rounded-md border border-slate-200 p-4">
            <h2 className="mb-3 text-lg font-semibold">Preview</h2>
            <article className="prose max-w-none whitespace-pre-wrap text-sm leading-7 text-slate-700">{output.content}</article>
          </div>
        </Card>
        <Card>
          <h2 className="mb-3 text-lg font-semibold">输出操作</h2>
          <div className="space-y-3">
            <form action={markOutputFinalAction}>
              <input type="hidden" name="outputId" value={output.id} />
              <Button type="submit" className="w-full bg-emerald-700">标记最终版</Button>
            </form>
            <form action={outputToKnowledgeAction}>
              <input type="hidden" name="outputId" value={output.id} />
              <Button type="submit" className="w-full bg-slate-700">转为项目知识</Button>
            </form>
          </div>
          <div className="mt-5 rounded-md bg-slate-50 p-3 text-sm leading-6 text-slate-600">
            最终版可以沉淀回知识库，下一次 Workflow 会自动读取最近的项目知识和规则。
          </div>
          <div className="mt-5 space-y-2">
            <h3 className="text-sm font-semibold">基于 Output 创建下一 Workflow</h3>
            {workflows.slice(0, 5).map((workflow) => (
              <Link key={workflow.id} className="block rounded-md border border-slate-200 px-3 py-2 text-sm hover:bg-slate-50" href={`/workflows/${workflow.id}/start`}>
                {workflow.name}
              </Link>
            ))}
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
