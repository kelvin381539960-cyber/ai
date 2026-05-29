import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { Badge, Button, Card, PageHeader, Select, TextArea, TextInput } from "@/components/ui";
import { createWorkflowRunAction } from "@/app/actions";
import {
  getWorkflow,
  listAgents,
  listKnowledge,
  listRules,
  parseJson,
} from "@/lib/services/app-service";
import { getProjectSource, listProjectSources } from "@/lib/services/context-source-service";

export const dynamic = "force-dynamic";

export default async function WorkflowStartPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const workflow = await getWorkflow(id);
  if (!workflow) notFound();
  const [knowledge, rules, agents, sources] = await Promise.all([listKnowledge(), listRules(), listAgents(), listProjectSources()]);
  const sourceDetails = await Promise.all(sources.filter((source) => source.status === "indexed").map((source) => getProjectSource(source.id)));
  const enabledRules = rules.filter((rule) => rule.enabled);
  const defaultWorkspacePath = sources.find((source) => source.type === "server_folder" && source.status === "indexed")?.rootPath ?? "";

  return (
    <AppShell>
      <PageHeader
        title={`开始运行：${workflow.name}`}
        description="按成熟主路径准备一次 Workflow：目标、资料、规则、Agent、Context Preview。"
        action={<Badge tone="blue">{workflow.scenario}</Badge>}
      />
      <form action={createWorkflowRunAction} className="grid gap-5 xl:grid-cols-[1fr_420px]">
        <input type="hidden" name="workflowId" value={workflow.id} />
        <div className="space-y-5">
          <Card>
            <div className="mb-4 flex items-center gap-2">
              <Badge tone="blue">1</Badge>
              <h2 className="text-lg font-semibold">目标</h2>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <TextInput name="title" placeholder="标题，例如 AI 工作台 v2 PRD" required />
              <TextInput name="expectedOutput" placeholder="预期输出，例如 PRD 初稿" />
              <TextArea name="goal" placeholder="目标：你希望这次 Workflow 解决什么问题？" required className="md:col-span-2 min-h-32" />
              <TextArea name="background" placeholder="背景：补充项目现状、用户、业务约束" className="min-h-28" />
              <TextArea name="constraints" placeholder="限制条件：不要做什么、必须遵守什么" className="min-h-28" />
            </div>
          </Card>

          <Card>
            <div className="mb-4 flex items-center gap-2">
              <Badge tone="blue">2</Badge>
              <h2 className="text-lg font-semibold">选择项目知识</h2>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {knowledge.length === 0 ? <p className="text-sm text-slate-500">暂无知识，可先在知识库添加项目背景。</p> : null}
              {knowledge.slice(0, 12).map((item) => (
                <label key={item.id} className="flex gap-3 rounded-md border border-slate-200 p-3 hover:bg-slate-50">
                  <input name="knowledgeIds" value={item.id} type="checkbox" defaultChecked={item.type === "background" || item.type === "output"} className="mt-1" />
                  <span>
                    <span className="block text-sm font-medium">{item.title}</span>
                    <span className="mt-1 block text-xs leading-5 text-slate-500">
                      {item.type} · {parseJson<string[]>(item.tags, []).join(", ") || "无标签"}
                    </span>
                    <span className="mt-2 block line-clamp-2 text-xs leading-5 text-slate-600">{item.content}</span>
                  </span>
                </label>
              ))}
            </div>
          </Card>

          <Card>
            <div className="mb-4 flex items-center gap-2">
              <Badge tone="blue">3</Badge>
              <h2 className="text-lg font-semibold">选择代码/文件引用</h2>
            </div>
            <TextInput name="workspacePath" placeholder="Agent 工作目录，例如 /opt/AIX代码" defaultValue={defaultWorkspacePath} />
            <div className="mt-3 space-y-3">
              {sourceDetails.length === 0 ? <p className="text-sm text-slate-500">暂无已索引资料源，可先到 Project Context 注册服务器目录。</p> : null}
              {sourceDetails.map((detail) => detail ? (
                <div key={detail.source.id} className="rounded-md border border-slate-200 p-3">
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <div>
                      <div className="text-sm font-medium">{detail.source.name}</div>
                      <div className="text-xs text-slate-500">{detail.source.rootPath}</div>
                    </div>
                    <Badge tone="green">{detail.source.fileCount} files</Badge>
                  </div>
                  <div className="max-h-72 space-y-2 overflow-auto">
                    {detail.files.slice(0, 30).map((file) => (
                      <label key={file.id} className="flex gap-3 rounded border border-slate-100 p-2 hover:bg-slate-50">
                        <input
                          name="fileRefs"
                          value={`${detail.source.id}::${file.path}`}
                          type="checkbox"
                          className="mt-1"
                          disabled={file.riskLevel === "blocked"}
                        />
                        <span>
                          <span className="block text-xs font-medium">{file.path}</span>
                          <span className="mt-1 block text-xs text-slate-500">{file.language} · {file.riskLevel} · {file.sizeBytes} bytes</span>
                          {file.summary ? <span className="mt-1 block line-clamp-2 text-xs leading-5 text-slate-600">{file.summary}</span> : null}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              ) : null)}
            </div>
          </Card>

          <Card>
            <div className="mb-4 flex items-center gap-2">
              <Badge tone="blue">4</Badge>
              <h2 className="text-lg font-semibold">选择规则</h2>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {enabledRules.map((rule) => (
                <label key={rule.id} className="flex gap-3 rounded-md border border-slate-200 p-3 hover:bg-slate-50">
                  <input name="ruleIds" value={rule.id} type="checkbox" defaultChecked className="mt-1" />
                  <span>
                    <span className="block text-sm font-medium">{rule.name}</span>
                    <span className="mt-1 block text-xs text-slate-500">{rule.type}</span>
                    <span className="mt-2 block line-clamp-2 text-xs leading-5 text-slate-600">{rule.content}</span>
                  </span>
                </label>
              ))}
            </div>
            <TextArea name="temporaryRules" placeholder="临时规则：本次 Workflow 特别要求" className="mt-3 min-h-24" />
          </Card>
        </div>

        <div className="space-y-5">
          <Card>
            <div className="mb-4 flex items-center gap-2">
              <Badge tone="blue">5</Badge>
              <h2 className="text-lg font-semibold">执行确认</h2>
            </div>
            <Select name="agentId" defaultValue="agent_manual">
              {agents.map((agent) => (
                <option key={agent.id} value={agent.id}>
                  {agent.name} / {agent.type} / {agent.healthStatus}
                </option>
              ))}
            </Select>
            <div className="mt-4 rounded-md bg-slate-50 p-3 text-sm leading-6 text-slate-600">
              提交后会创建 Step-by-step Workflow Run。Manual Agent 会进入 waiting_user；真实 CLI Agent 会通过 Harness/Direct CLI 执行。
            </div>
            <Button type="submit" className="mt-4 w-full">创建并开始运行</Button>
          </Card>

          <Card>
            <h2 className="mb-3 text-lg font-semibold">Context Preview 规则</h2>
            <div className="space-y-2 text-sm leading-6 text-slate-600">
              <p>Context 会包含：目标、背景、预期输出、限制条件、已选资料、已选规则、临时规则。</p>
              <p>Run Console 会展示完整 Context Snapshot，执行前后可追溯。</p>
            </div>
          </Card>
        </div>
      </form>
    </AppShell>
  );
}
