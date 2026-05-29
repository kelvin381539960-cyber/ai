import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { Badge, Card, PageHeader } from "@/components/ui";
import { listOutputs } from "@/lib/services/app-service";

export const dynamic = "force-dynamic";

export default async function OutputsPage() {
  const outputs = await listOutputs();
  return (
    <AppShell>
      <PageHeader title="Output Library" description="保存 Markdown 输出，支持编辑、版本、最终版和沉淀到知识库。" />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {outputs.map((output) => (
          <Link key={output.id} href={`/outputs/${output.id}`}>
            <Card className="h-full hover:bg-slate-50">
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-semibold">{output.title}</h3>
                <Badge tone={output.isFinal ? "green" : "slate"}>v{output.version}{output.isFinal ? " final" : ""}</Badge>
              </div>
              <p className="mt-3 line-clamp-5 whitespace-pre-wrap text-sm leading-6 text-slate-600">{output.content}</p>
              <div className="mt-4 text-xs text-slate-500">{new Date(output.updatedAt).toLocaleString()}</div>
            </Card>
          </Link>
        ))}
      </div>
    </AppShell>
  );
}
