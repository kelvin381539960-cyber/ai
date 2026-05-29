import { AppShell } from "@/components/app-shell";
import { Badge, Button, Card, PageHeader, Select, TextArea, TextInput } from "@/components/ui";
import { createKnowledgeAction } from "@/app/actions";
import { listKnowledge, parseJson } from "@/lib/services/app-service";

export const dynamic = "force-dynamic";

export default async function KnowledgePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const items = await listKnowledge(params.q);

  return (
    <AppShell>
      <PageHeader title="项目知识库" description="沉淀项目背景、规则、PRD、调研、决策和历史输出。第一版使用标签 + 全文搜索。" />
      <div className="grid gap-5 lg:grid-cols-[380px_1fr]">
        <Card>
          <h2 className="mb-3 text-lg font-semibold">添加知识</h2>
          <form action={createKnowledgeAction} className="space-y-3">
            <TextInput name="title" placeholder="标题" required />
            <Select name="type" defaultValue="background">
              <option value="background">项目背景</option>
              <option value="prd">PRD</option>
              <option value="rule">规则</option>
              <option value="research">调研</option>
              <option value="decision">决策</option>
              <option value="output">历史输出</option>
              <option value="note">备注</option>
            </Select>
            <TextInput name="tags" placeholder="标签，用逗号分隔" />
            <TextArea name="content" placeholder="Markdown 内容" required className="min-h-56" />
            <Button type="submit">保存知识</Button>
          </form>
        </Card>
        <div className="space-y-4">
          <form className="flex gap-2">
            <TextInput name="q" placeholder="搜索标题、内容、标签" defaultValue={params.q ?? ""} />
            <Button type="submit">搜索</Button>
          </form>
          {items.map((item) => (
            <Card key={item.id}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-semibold">{item.title}</h3>
                  <div className="mt-1 flex flex-wrap gap-2">
                    <Badge tone="blue">{item.type}</Badge>
                    {parseJson<string[]>(item.tags, []).map((tag) => (
                      <Badge key={tag}>{tag}</Badge>
                    ))}
                  </div>
                </div>
                <span className="text-xs text-slate-500">{new Date(item.updatedAt).toLocaleString()}</span>
              </div>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-700">{item.content}</p>
            </Card>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
