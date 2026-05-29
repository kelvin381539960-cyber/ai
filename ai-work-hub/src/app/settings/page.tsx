import { AppShell } from "@/components/app-shell";
import { Badge, Button, Card, PageHeader, Select, TextArea, TextInput } from "@/components/ui";
import { createRuleAction } from "@/app/actions";
import { listRules } from "@/lib/services/app-service";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const rules = await listRules();

  return (
    <AppShell>
      <PageHeader title="Rule Center" description="管理输出规则、流程规则、项目规则和质量检查规则。规则会进入 Context Builder。" />
      <div className="grid gap-5 lg:grid-cols-[380px_1fr]">
        <Card>
          <h2 className="mb-3 text-lg font-semibold">新增规则</h2>
          <form action={createRuleAction} className="space-y-3">
            <TextInput name="name" placeholder="规则名称" required />
            <Select name="type" defaultValue="output">
              <option value="output">输出规则</option>
              <option value="workflow">流程规则</option>
              <option value="project">项目规则</option>
              <option value="quality">质量规则</option>
            </Select>
            <TextArea name="content" placeholder="规则内容" required className="min-h-48" />
            <Button type="submit">保存规则</Button>
          </form>
        </Card>
        <div className="space-y-4">
          {rules.map((rule) => (
            <Card key={rule.id}>
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-semibold">{rule.name}</h3>
                <Badge tone={rule.enabled ? "green" : "slate"}>{rule.type}</Badge>
              </div>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-700">{rule.content}</p>
            </Card>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
