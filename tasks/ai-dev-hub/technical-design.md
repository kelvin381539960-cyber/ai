# AI Work Hub 技术方案设计

## 1. 文档目标

本技术方案基于以下产品文档：

- `brd.md`
- `prd.md`
- `prd-detail.md`
- `ux-optimized-plan.md`
- `onboarding.md`
- `seed-templates.md`
- `manual-run-flow.md`
- `material-rules.md`
- `output-rules.md`
- `workflow-run-rules.md`

目标：给出可直接指导 MVP 实现的技术架构。

## 2. 技术结论

MVP 推荐采用：

```text
模块化单体架构
```

不要一开始做微服务。

推荐技术栈：

```text
前端/后端：Next.js + TypeScript
UI：React
数据库：SQLite
文件存储：本地/服务器文件系统
ORM：Prisma 或 Drizzle
运行方式：私有服务器 / 本机均可
```

MVP 优先服务产品/运营用户，不把 Git、CLI、代码能力作为默认主流程。

## 3. 总体架构

```text
Browser UI
   ↓
Next.js App
   ↓
App Services
   ├── Workspace Service
   ├── Task Service
   ├── Material Service
   ├── Assistant Service
   ├── Workflow Service
   ├── Run Service
   ├── Output Service
   ├── Context Builder
   ├── Template Service
   └── Onboarding Service
   ↓
Storage Layer
   ├── SQLite
   └── File Storage
   ↓
Adapter Layer
   ├── Manual Adapter
   ├── Generic CLI Adapter，高级能力
   └── Future HTTP / MCP / Action Adapter
```

## 4. 部署模式

## 4.1 私有服务器模式，推荐

适合用户：公司电脑和个人电脑都要访问同一任务现场。

```text
腾讯云服务器
  ├── AI Work Hub App
  ├── SQLite DB
  ├── Materials 文件
  ├── Outputs 文件
  └── Runs 文件
```

访问方式：

```text
浏览器访问服务器地址
```

安全建议：

```text
不要直接裸露公网
使用 SSH Tunnel / VPN / Tailscale / Cloudflare Zero Trust
```

## 4.2 本机模式

适合单机自用。

数据目录：

```text
~/.ai-work-hub/
```

## 5. 数据目录结构

推荐数据目录：

```text
.ai-work-hub/
  db.sqlite
  materials/
    <material_id>/
      original
      meta.json
  outputs/
    <output_id>.md
  runs/
    <run_id>/
      prompt.md
      result.md
      meta.json
  workflow-runs/
    <workflow_run_id>/
      state.json
  exports/
  templates/
```

原则：

- SQLite 存结构化状态。
- 大文本和文件存文件系统。
- 数据库保存文件路径和摘要。
- 用户资料和输出默认保存在私有服务器或本机。

## 6. 核心数据模型

## 6.1 Workspace

```ts
interface Workspace {
  id: string
  name: string
  dataDir: string
  createdAt: string
  updatedAt: string
}
```

## 6.2 Project / Space

```ts
interface Project {
  id: string
  workspaceId: string
  name: string
  description?: string
  createdAt: string
  updatedAt: string
}
```

## 6.3 Task

```ts
interface Task {
  id: string
  projectId: string
  title: string
  type: TaskType
  goal: string
  expectedOutput?: string
  defaultAssistantId?: string
  workflowId?: string
  contextScope: 'light' | 'standard' | 'full'
  status: 'draft' | 'ready' | 'running' | 'blocked' | 'reviewing' | 'done' | 'archived'
  createdAt: string
  updatedAt: string
}
```

## 6.4 Material

```ts
interface Material {
  id: string
  taskId: string
  type: 'text' | 'url' | 'file' | 'image' | 'meeting_note' | 'user_feedback' | 'competitor_info' | 'ai_output' | 'custom'
  title: string
  content?: string
  filePath?: string
  sourceUrl?: string
  usageStatus: 'active' | 'key' | 'excluded' | 'archived'
  createdAt: string
  updatedAt: string
}
```

## 6.5 Assistant

```ts
interface Assistant {
  id: string
  workspaceId: string
  name: string
  type: 'manual' | 'cli'
  applicableTaskTypes: string[]
  capabilities: string[]
  promptTemplate?: string
  defaultContextScope: 'light' | 'standard' | 'full'
  enabled: boolean
  config: Record<string, unknown>
  createdAt: string
  updatedAt: string
}
```

## 6.6 Workflow

```ts
interface Workflow {
  id: string
  workspaceId: string
  name: string
  applicableTaskTypes: string[]
  description?: string
  steps: WorkflowStep[]
  enabled: boolean
  createdAt: string
  updatedAt: string
}
```

## 6.7 WorkflowStep

```ts
interface WorkflowStep {
  id: string
  title: string
  type: 'manual_input' | 'add_material' | 'context_build' | 'assistant_run' | 'review_prompt' | 'output_build'
  assistantId?: string
  useDefaultAssistant?: boolean
  contextScope?: 'light' | 'standard' | 'full'
  required: boolean
}
```

## 6.8 Run

```ts
interface Run {
  id: string
  taskId: string
  assistantId: string
  workflowRunId?: string
  workflowStepId?: string
  reason?: string
  contextScope: 'light' | 'standard' | 'full'
  promptPath: string
  resultPath?: string
  status: 'pending' | 'running' | 'waiting_user' | 'success' | 'failed' | 'cancelled' | 'timeout'
  usedMaterialIds: string[]
  createdAt: string
  completedAt?: string
}
```

## 6.9 Output

```ts
interface Output {
  id: string
  taskId: string
  type: 'research_report' | 'prd_draft' | 'competitive_analysis' | 'ops_plan' | 'meeting_summary' | 'data_review' | 'review_result' | 'action_items' | 'handoff' | 'custom'
  title: string
  contentPath: string
  version: number
  isFinal: boolean
  sourceRunIds: string[]
  sourceMaterialIds: string[]
  createdAt: string
  updatedAt: string
}
```

## 6.10 WorkflowRun

```ts
interface WorkflowRun {
  id: string
  taskId: string
  workflowId: string
  status: 'pending' | 'running' | 'waiting_user' | 'success' | 'failed' | 'cancelled'
  currentStepId?: string
  stepStates: Record<string, StepState>
  createdAt: string
  updatedAt: string
}
```

## 7. 模块设计

## 7.1 Onboarding Service

职责：

- 判断是否首次启动。
- 创建数据目录。
- 创建 Workspace。
- 安装默认模板。
- 初始化 SQLite。

关键方法：

```ts
isFirstRun(): boolean
initializeWorkspace(input): Workspace
installSeedTemplates(workspaceId): void
```

## 7.2 Template Service

职责：

- 管理默认任务类型。
- 管理默认助手模板。
- 管理默认流程模板。
- 支持恢复默认模板。

关键规则：

- 初始化时安装默认模板。
- 不覆盖用户自定义模板。
- 默认模板可复制为自定义模板。

## 7.3 Task Service

职责：

- 创建任务。
- 推荐默认助手和流程。
- 管理任务状态。
- 查询任务详情。

创建任务时：

```text
任务类型 → 推荐助手 → 推荐流程 → 推荐输出类型 → 推荐资料范围
```

## 7.4 Material Service

职责：

- 添加资料。
- 编辑资料。
- 标记重点资料。
- 暂不使用资料。
- 记录资料引用。

运行前必须提供：

```text
本次将使用哪些资料
```

## 7.5 Assistant Service

职责：

- 管理助手。
- 管理助手模板。
- 调用 Assistant Runtime。

用户侧表达是“助手”。底层仍可叫 Assistant/Agent。

## 7.6 Assistant Runtime

职责：

- 根据 Assistant 类型选择 Adapter。
- 构建 prompt。
- 创建 Run。
- 保存结果。

MVP 必须实现：

```text
Manual Adapter
```

高级能力：

```text
Generic CLI Adapter
```

## 7.7 Manual Adapter

职责：

- 生成 prompt。
- 保存 Run 状态为 waiting_user。
- 支持用户回填外部 AI 输出。
- 保存 Output。
- 恢复 waiting_user。

状态流：

```text
created → prompt_ready → waiting_user → success
```

## 7.8 Workflow Service

职责：

- 创建流程。
- 运行流程。
- 暂停流程。
- 继续流程。
- 取消流程。
- 恢复 waiting_user 流程。

MVP 只支持线性步骤。

## 7.9 Workflow Runtime

执行规则：

```text
按 steps 顺序执行
遇到 waiting_user 暂停
用户补充后继续
失败后允许重试或取消
```

每个 Step 可以产出：

```text
Material
Run
Output
Note
```

## 7.10 Context Builder

职责：

- 按资料范围构建上下文。
- 选择本次使用资料。
- 生成 prompt。
- 记录资料引用。

资料范围：

```text
light: 任务目标 + 最新输出 + 本次输入
standard: 任务目标 + 重点资料 + 普通资料摘要 + 最近输出
full: 全部资料 + 历史输出 + 关键执行记录
```

## 7.11 Output Service

职责：

- 创建 Output。
- 编辑 Output。
- 创建新版本。
- 标记最终版。
- 复制 Markdown。
- Output 转 Material。
- 基于 Output 创建新任务。

## 8. API 设计草案

## 8.1 Workspace

```text
GET /api/workspaces
POST /api/workspaces
GET /api/workspaces/:id
```

## 8.2 Tasks

```text
GET /api/tasks
POST /api/tasks
GET /api/tasks/:id
PATCH /api/tasks/:id
POST /api/tasks/:id/complete
```

## 8.3 Materials

```text
GET /api/tasks/:taskId/materials
POST /api/tasks/:taskId/materials
PATCH /api/materials/:id
DELETE /api/materials/:id
```

## 8.4 Assistants

```text
GET /api/assistants
POST /api/assistants
PATCH /api/assistants/:id
POST /api/assistants/:id/run
```

## 8.5 Runs

```text
GET /api/tasks/:taskId/runs
GET /api/runs/:id
POST /api/runs/:id/complete
POST /api/runs/:id/cancel
```

## 8.6 Workflows

```text
GET /api/workflows
POST /api/workflows
PATCH /api/workflows/:id
POST /api/workflows/:id/run
```

## 8.7 Workflow Runs

```text
GET /api/workflow-runs/:id
POST /api/workflow-runs/:id/continue
POST /api/workflow-runs/:id/cancel
POST /api/workflow-runs/:id/retry-step
```

## 8.8 Outputs

```text
GET /api/tasks/:taskId/outputs
POST /api/tasks/:taskId/outputs
GET /api/outputs/:id
PATCH /api/outputs/:id
POST /api/outputs/:id/new-version
POST /api/outputs/:id/mark-final
POST /api/outputs/:id/convert-to-material
POST /api/outputs/:id/create-task
```

## 9. UI 实现重点

## 9.1 首页

必须优先展示任务类型入口。

不要让用户先管理助手和流程。

## 9.2 任务详情页

核心区域：

```text
任务概览
任务资料
当前输出
任务流程
默认助手
执行记录
```

主按钮：

```text
继续生成
添加资料
找其他助手看看
更换默认助手
生成最终结论
```

## 9.3 Manual Run 页面

必须有：

```text
Prompt 展示
复制 Prompt
本次使用资料
结果粘贴区
保存为输出
继续流程
取消运行
```

## 10. 安全设计

## 10.1 数据安全

- 用户资料默认存私有服务器或本机。
- 上传文件不公开暴露。
- Output 不自动发送到外部 AI。
- Manual Run 复制前提示用户检查敏感信息。

## 10.2 执行安全

MVP 默认不自动：

```text
push
merge
deploy
删除文件
修改密钥
```

CLI Assistant 是高级能力。

## 10.3 Web UI 暴露

推荐：

```text
SSH Tunnel
VPN
Tailscale
Cloudflare Zero Trust
```

不建议公网裸露。

## 11. MVP 实现阶段

## Phase 1：基础框架

```text
Next.js 项目
SQLite 初始化
数据目录初始化
Workspace
Seed Templates
首页任务入口
```

## Phase 2：任务和资料

```text
Task 创建
Material 添加/编辑
任务详情页
资料范围
```

## Phase 3：助手和 Manual Run

```text
Assistant 模板
Manual Adapter
Prompt 生成
复制/回填
Run 记录
```

## Phase 4：输出

```text
Output 创建
Output 编辑
版本管理
标记最终版
Output 转 Material
```

## Phase 5：流程

```text
Workflow 模板
Workflow Run
waiting_user
暂停/继续/取消
```

## Phase 6：完善可用性

```text
搜索/筛选
空状态
错误状态
导出/复制
部署文档
```

## 12. MVP 必须验收

必须通过：

1. 首次启动可初始化数据目录和 Workspace。
2. 系统自动安装默认模板。
3. 用户从首页选择“做需求调研”。
4. 用户创建任务并添加资料。
5. 系统推荐调研助手和需求调研流程。
6. 用户运行 Manual Assistant。
7. 系统生成 Prompt。
8. 用户复制 Prompt 到外部 AI。
9. 用户粘贴结果回来。
10. 系统保存为 Output。
11. 用户编辑 Output 并标记最终版。
12. 用户把 Output 转成 Material。
13. 用户运行流程并在 waiting_user 后恢复。
14. 用户换电脑访问同一服务器仍能看到任务、资料、输出和运行状态。

## 13. 后续扩展预留

MVP 不实现但架构预留：

```text
HTTP Assistant
MCP Server
ChatGPT Action
CLI Assistant 深度执行
开发者模式
多用户权限
成本统计
偏好记忆
Workflow DAG
```

## 14. 技术风险

### 风险 1：功能对象太多

控制：

- MVP UI 以任务为中心。
- Run 不做一级入口。
- Assistant / Workflow 用模板兜底。

### 风险 2：Manual Run 体验断裂

控制：

- waiting_user 必须可恢复。
- Prompt 和回填必须在同一页面闭环。

### 风险 3：资料过多导致上下文失控

控制：

- 资料范围。
- 重点资料。
- 运行前资料确认。

### 风险 4：服务器数据路径混乱

控制：

- 初始化时明确数据目录。
- SQLite + 文件目录统一放在 dataDir。

## 15. 最终结论

MVP 推荐技术方案：

```text
Next.js + TypeScript + SQLite + 文件系统 + 模块化单体
```

优先实现：

```text
任务类型入口 → 资料 → Manual Assistant → Output → Workflow 恢复
```

不要优先实现：

```text
代码执行
复杂 Workflow
MCP
Action
多用户权限
```

产品主线必须保持：

```text
产品/运营用户从任务开始，添加资料，生成输出。
```
