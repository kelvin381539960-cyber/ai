import { AppShell } from "@/components/app-shell";
import { Badge, Button, Card, PageHeader, TextArea, TextInput } from "@/components/ui";
import { createProjectAction, deleteProjectAction, switchProjectAction, updateProjectAction } from "@/app/actions";
import { getActiveProject, listProjects } from "@/lib/services/app-service";

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const [projects, activeProject] = await Promise.all([listProjects(), getActiveProject()]);

  return (
    <AppShell>
      <PageHeader title="Projects" description="每个项目都有自己的知识、资料源、规则、Workflow、Run 和 Output。AIX 代码只属于 AIX 项目上下文。" />
      <div className="grid gap-5 lg:grid-cols-[380px_1fr]">
        <Card>
          <h2 className="mb-3 text-lg font-semibold">新增项目</h2>
          <form action={createProjectAction} className="space-y-3">
            <TextInput name="name" placeholder="项目名称，例如 AIX 项目" required />
            <TextArea name="description" placeholder="项目说明" className="min-h-32" />
            <Button type="submit">创建并切换</Button>
          </form>
        </Card>

        <div className="space-y-4">
          {projects.map((project) => (
            <Card key={project.id}>
              <form action={updateProjectAction} className="space-y-3">
                <input type="hidden" name="projectId" value={project.id} />
                <div className="flex items-center justify-between gap-3">
                  <Badge tone={project.id === activeProject.id ? "green" : "slate"}>{project.id === activeProject.id ? "当前项目" : "未选中"}</Badge>
                  <span className="text-xs text-slate-500">{new Date(project.updatedAt).toLocaleString()}</span>
                </div>
                <TextInput name="name" defaultValue={project.name} required />
                <TextArea name="description" defaultValue={project.description} className="min-h-28" />
                <Button type="submit">保存项目</Button>
              </form>
              <div className="mt-4 flex flex-wrap gap-3 border-t border-slate-100 pt-3">
                <form action={switchProjectAction}>
                  <input type="hidden" name="projectId" value={project.id} />
                  <Button type="submit" className="bg-slate-700" disabled={project.id === activeProject.id}>切换到此项目</Button>
                </form>
                {projects.length > 1 ? (
                  <form action={deleteProjectAction}>
                    <input type="hidden" name="projectId" value={project.id} />
                    <label className="mr-3 inline-flex items-center gap-2 text-xs text-slate-500">
                      <input type="checkbox" name="confirmDelete" value="yes" required />
                      确认删除项目记录
                    </label>
                    <Button type="submit" className="bg-rose-700" disabled={project.id === activeProject.id}>删除</Button>
                  </form>
                ) : null}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
