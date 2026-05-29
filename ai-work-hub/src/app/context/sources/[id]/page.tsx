import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { Badge, Button, Card, PageHeader, TextArea, TextInput } from "@/components/ui";
import { deleteProjectSourceAction, indexProjectSourceAction, updateProjectSourceAction } from "@/app/actions";
import { getProjectSource, defaultSourcePatterns } from "@/lib/services/context-source-service";
import { parseJson } from "@/lib/services/app-service";

export const dynamic = "force-dynamic";

export default async function SourcePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ q?: string }>;
}) {
  const { id } = await params;
  const { q } = await searchParams;
  const data = await getProjectSource(id, q);
  if (!data) notFound();
  const { source, files } = data;
  const patterns = defaultSourcePatterns();

  return (
    <AppShell>
      <PageHeader
        title={source.name}
        description={`${source.rootPath} · 只读索引，默认拦截密钥、环境变量、数据库和构建产物。`}
        action={<Badge tone={source.status === "indexed" ? "green" : source.status === "failed" ? "red" : "amber"}>{source.status}</Badge>}
      />
      <div className="grid gap-5 xl:grid-cols-[360px_1fr]">
        <div className="space-y-5">
          <Card>
            <h2 className="mb-3 text-lg font-semibold">索引状态</h2>
            <div className="space-y-2 text-sm leading-6 text-slate-600">
              <p>文件数：{source.fileCount}</p>
              <p>最后索引：{source.lastIndexedAt ? new Date(source.lastIndexedAt).toLocaleString() : "never"}</p>
              <p>模式：{source.readonly ? "只读" : "可写"}</p>
              {source.errorMessage ? <p className="text-rose-700">{source.errorMessage}</p> : null}
            </div>
            <form action={indexProjectSourceAction} className="mt-4">
              <input type="hidden" name="sourceId" value={source.id} />
              <Button type="submit">重新索引</Button>
            </form>
          </Card>

          <Card>
            <h2 className="mb-3 text-lg font-semibold">编辑资料源</h2>
            <form action={updateProjectSourceAction} className="space-y-3">
              <input type="hidden" name="sourceId" value={source.id} />
              <TextInput name="name" defaultValue={source.name} required />
              <TextInput value={source.rootPath} readOnly />
              <TextArea name="includePatterns" defaultValue={parseJson<string[]>(source.includePatterns, patterns.includes).join("\n")} className="min-h-32" />
              <TextArea name="excludePatterns" defaultValue={parseJson<string[]>(source.excludePatterns, patterns.excludes).join("\n")} className="min-h-40" />
              <Button type="submit">保存资料源</Button>
            </form>
            <form action={deleteProjectSourceAction} className="mt-4 border-t border-slate-100 pt-3">
              <input type="hidden" name="sourceId" value={source.id} />
              <label className="flex items-center gap-2 text-xs text-slate-500">
                <input type="checkbox" name="confirmDelete" value="yes" required />
                确认删除资料源记录和索引，不删除真实目录
              </label>
              <Button type="submit" className="mt-2 bg-rose-700">删除资料源</Button>
            </form>
          </Card>

          <Card>
            <h2 className="mb-3 text-lg font-semibold">默认安全规则</h2>
            <div className="space-y-3 text-xs leading-5 text-slate-600">
              <div>
                <div className="mb-1 font-medium text-slate-800">Include</div>
                <pre className="whitespace-pre-wrap rounded bg-slate-50 p-2">{patterns.includes.join("\n")}</pre>
              </div>
              <div>
                <div className="mb-1 font-medium text-slate-800">Exclude</div>
                <pre className="whitespace-pre-wrap rounded bg-slate-50 p-2">{patterns.excludes.join("\n")}</pre>
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <form className="flex gap-2">
            <TextInput name="q" placeholder="搜索文件路径或摘要" defaultValue={q ?? ""} />
            <Button type="submit">搜索</Button>
          </form>
          <Card>
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold">文件索引</h2>
              <Badge>{files.length} shown</Badge>
            </div>
            <div className="divide-y divide-slate-100">
              {files.map((file) => (
                <div key={file.id} className="py-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="font-mono text-sm">{file.path}</div>
                    <div className="flex gap-2">
                      <Badge tone={file.riskLevel === "blocked" ? "red" : file.riskLevel === "sensitive" ? "amber" : "slate"}>{file.riskLevel}</Badge>
                      <Badge>{file.language}</Badge>
                    </div>
                  </div>
                  <div className="mt-1 text-xs text-slate-500">{file.sizeBytes} bytes · {new Date(file.indexedAt).toLocaleString()}</div>
                  {file.summary ? <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">{file.summary}</p> : null}
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
