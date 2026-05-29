import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { Badge, Button, Card, PageHeader, TextArea } from "@/components/ui";
import { markOutputFinalAction, outputToKnowledgeAction, saveOutputVersionAction } from "@/app/actions";
import { getOutput } from "@/lib/services/app-service";

export const dynamic = "force-dynamic";

export default async function OutputDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const output = await getOutput(id);
  if (!output) notFound();

  return (
    <AppShell>
      <PageHeader title={output.title} description={`Markdown Output v${output.version}`} action={<Badge tone={output.isFinal ? "green" : "slate"}>{output.isFinal ? "最终版" : "草稿"}</Badge>} />
      <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
        <Card>
          <form action={saveOutputVersionAction} className="space-y-3">
            <input type="hidden" name="outputId" value={output.id} />
            <TextArea name="content" defaultValue={output.content} className="min-h-[560px] font-mono text-sm" />
            <Button type="submit">另存为新版本</Button>
          </form>
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
        </Card>
      </div>
    </AppShell>
  );
}
