import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { Badge, Button, Card, PageHeader, Select, TextArea, TextInput } from "@/components/ui";
import { createProjectSourceAction } from "@/app/actions";
import { defaultSourcePatterns, listProjectSources } from "@/lib/services/context-source-service";

export const dynamic = "force-dynamic";

export default async function ContextPage() {
  const sources = await listProjectSources();
  const patterns = defaultSourcePatterns();

  return (
    <AppShell>
      <PageHeader title="Project Context" description="把手动知识、代码目录、输出沉淀和规则统一成项目上下文。代码源只引用和索引，不搬运完整代码。" />
      <div className="grid gap-5 lg:grid-cols-[420px_1fr]">
        <Card>
          <h2 className="mb-3 text-lg font-semibold">新增服务器目录资料源</h2>
          <form action={createProjectSourceAction} className="space-y-3">
            <TextInput name="name" placeholder="名称，例如 AIX 项目代码" required />
            <Select name="type" defaultValue="server_folder">
              <option value="server_folder">服务器目录</option>
            </Select>
            <TextInput name="rootPath" placeholder="绝对路径，例如 /opt/AIX代码" required />
            <TextArea name="includePatterns" defaultValue={patterns.includes.join("\n")} className="min-h-36" />
            <TextArea name="excludePatterns" defaultValue={patterns.excludes.join("\n")} className="min-h-44" />
            <Button type="submit">保存并索引</Button>
          </form>
        </Card>

        <div className="space-y-4">
          {sources.length === 0 ? (
            <Card>
              <p className="text-sm leading-6 text-slate-600">还没有资料源。先注册一个服务器目录，之后 Workflow 就可以引用真实项目代码。</p>
            </Card>
          ) : null}
          {sources.map((source) => (
            <Card key={source.id}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="text-base font-semibold">{source.name}</h3>
                  <p className="mt-1 text-sm text-slate-500">{source.rootPath}</p>
                  {source.errorMessage ? <p className="mt-2 text-sm text-rose-700">{source.errorMessage}</p> : null}
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge tone={source.status === "indexed" ? "green" : source.status === "failed" ? "red" : "amber"}>{source.status}</Badge>
                  <Badge>{source.fileCount} files</Badge>
                  <Badge>{source.readonly ? "readonly" : "writable"}</Badge>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <span className="text-xs text-slate-500">Last indexed: {source.lastIndexedAt ? new Date(source.lastIndexedAt).toLocaleString() : "never"}</span>
                <Link href={`/context/sources/${source.id}`} className="rounded-md bg-slate-950 px-4 py-2 text-sm font-medium text-white">
                  打开资料源
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
