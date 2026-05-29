import { AppShell } from "@/components/app-shell";
import { Badge, Button, Card, PageHeader, Select, TextArea, TextInput } from "@/components/ui";
import { createRuleAction, deleteRuleAction, toggleRuleAction, updateRuleAction } from "@/app/actions";
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
              <form action={updateRuleAction} className="space-y-3">
                <input type="hidden" name="ruleId" value={rule.id} />
                <div className="flex items-center justify-between gap-3">
                  <Badge tone={rule.enabled ? "green" : "slate"}>{rule.enabled ? "enabled" : "disabled"}</Badge>
                  <Badge>{rule.type}</Badge>
                </div>
                <TextInput name="name" defaultValue={rule.name} required />
                <Select name="type" defaultValue={rule.type}>
                  <option value="output">输出规则</option>
                  <option value="workflow">流程规则</option>
                  <option value="project">项目规则</option>
                  <option value="quality">质量规则</option>
                </Select>
                <TextArea name="content" defaultValue={rule.content} className="min-h-36" required />
                <Button type="submit">保存修改</Button>
              </form>
              <div className="mt-4 flex flex-wrap gap-3 border-t border-slate-100 pt-3">
                <form action={toggleRuleAction}>
                  <input type="hidden" name="ruleId" value={rule.id} />
                  <input type="hidden" name="enabled" value={rule.enabled ? "false" : "true"} />
                  <Button type="submit" className="bg-slate-700">{rule.enabled ? "禁用" : "启用"}</Button>
                </form>
                <form action={deleteRuleAction}>
                  <input type="hidden" name="ruleId" value={rule.id} />
                  <label className="mr-3 inline-flex items-center gap-2 text-xs text-slate-500">
                    <input type="checkbox" name="confirmDelete" value="yes" required />
                    确认删除
                  </label>
                  <Button type="submit" className="bg-rose-700">删除</Button>
                </form>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
