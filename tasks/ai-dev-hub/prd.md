# AI Dev Hub MVP PRD

## 1. 文档状态

- 阶段：PRD
- 依据：`brd.md`
- 产品定位：AI 开发任务中台
- MVP 范围：轻量 UI + 多任务 + Agent + Workflow + Run + Handoff

## 2. 产品目标

MVP 要实现一个可用的 AI 开发任务中台，让用户可以：

1. 在 UI 中管理多个任务。
2. 为任务选择 Primary Agent。
3. 创建和复用多个 Agent。
4. 创建和复用多个线性 Workflow。
5. 运行 Agent 或 Workflow。
6. 保存每次执行结果。
7. 生成 Handoff，支持后续接力。
8. 在需要时随时切换任务 Primary Agent。

## 3. 信息架构

MVP 页面：

```text
项目页
任务列表页
任务详情页
Agent 管理页
Workflow 管理页
Run 记录页
Handoff 页
设置页
```

全局导航：

```text
Projects
Tasks
Agents
Workflows
Runs
Handoff
Settings
```

## 4. 核心对象关系

```text
Project 1 ── N Task
Project 1 ── N Agent
Project 1 ── N Workflow
Task 1 ── 1 Primary Agent
Task 1 ── N Run
Task 1 ── N Workflow Run
Agent 1 ── N Run
Workflow 1 ── N Workflow Run
Task 1 ── N Handoff
```

## 5. 页面需求

## 5.1 项目页

### 目标

选择或初始化项目工作区。

### 展示字段

- 项目名称
- 项目路径
- Git 分支
- Git 状态
- Task 数量
- Agent 数量
- Workflow 数量
- 最近更新时间

### 操作

- 添加项目
- 初始化 `.ai/` 工作区
- 进入项目
- 刷新 Git 状态

### 验收

- 用户可以添加一个本地/服务器项目路径。
- 用户可以在该项目下初始化 `.ai/` 工作区。
- UI 能展示项目基础状态。

## 5.2 任务列表页

### 目标

管理多个任务。

### 展示字段

- 任务标题
- 状态
- Primary Agent
- 最近 Run 时间
- 最近 Handoff 时间
- 关联 Workflow Run 数量

### 筛选

- 状态
- Primary Agent
- 是否有 Handoff

### 操作

- 创建任务
- 打开任务详情
- 切换任务状态
- 归档任务

### 验收

- 用户可以创建多个任务。
- 用户可以按状态筛选任务。
- 用户可以看到每个任务的 Primary Agent。

## 5.3 任务详情页

### 目标

围绕单个任务执行 AI 工作。

### 区块

#### 任务信息

字段：

- 标题
- 目标
- 范围
- 非目标
- 验收标准
- 所需能力
- 状态

#### Primary Agent

字段：

- 当前 Primary Agent
- Agent 类型
- Agent 能力
- 默认 Context Mode

操作：

- Run Primary Agent
- Run Another Agent
- Switch Primary Agent
- Generate Handoff

#### Supporting Agent Runs

展示：

- Run ID
- Agent
- 触发原因
- 状态
- 时间

#### Workflow Runs

展示：

- Workflow 名称
- 当前 Step
- 状态
- 时间

#### Handoff 摘要

展示：

- 当前状态
- 剩余事项
- 风险
- 下一步建议

### 验收

- 用户可以在任务详情页运行 Primary Agent。
- 用户可以临时运行另一个 Agent。
- 用户可以正式切换 Primary Agent。
- 用户可以查看任务关联 Run 和 Handoff。

## 5.4 Agent 管理页

### 目标

创建和管理可复用 Agent。

### Agent 类型

- Manual Agent
- Generic CLI Agent

### 字段

- Agent ID
- 名称
- 类型
- 能力
- Prompt 模板
- 默认 Context Mode
- CLI 命令，仅 CLI Agent
- 是否启用

### 操作

- 创建 Agent
- 从模板创建 Agent
- 编辑 Agent
- 启用 / 禁用 Agent
- 测试 Agent
- 删除 Agent

### 内置模板

- Code Agent
- Review Agent
- Security Review Agent
- Architecture Review Agent
- Research Agent
- Handoff Agent

### 验收

- 用户可以创建多个 Agent。
- 一个 Agent 可以被多个任务复用。
- Manual Agent 可以生成 prompt。
- Generic CLI Agent 可以被测试。

## 5.5 Workflow 管理页

### 目标

创建和管理可复用线性 Workflow。

### Workflow 字段

- Workflow ID
- 名称
- 描述
- Step 列表
- 是否启用

### Step 类型

- manual_input
- context_build
- agent_run
- review_prompt
- handoff_build

### Step 字段

- Step ID
- 标题
- 类型
- Agent 选择方式
- 指定 Agent，可选
- Context Mode
- 是否必填

### Agent 选择规则

- 默认使用任务 Primary Agent。
- Step 可显式指定 Supporting Agent。
- 用户运行 Workflow 时可手动覆盖。

### 操作

- 创建 Workflow
- 从模板创建 Workflow
- 添加 Step
- 删除 Step
- 调整 Step 顺序
- 编辑 Step
- 运行 Workflow

### 内置模板

- Pre-work Workflow
- Research Workflow
- Review Workflow

### 验收

- 用户可以创建多个 Workflow。
- 一个 Workflow 可以被多个任务复用。
- Workflow 支持线性步骤执行。
- Manual Step 可以暂停等待用户输入。

## 5.6 Run 记录页

### 目标

查看和完成 Agent 执行记录。

### 展示字段

- Run ID
- Task
- Agent
- 是否 Primary Agent
- Context Mode
- 状态
- Prompt
- 输出结果
- stdout
- stderr
- 开始时间
- 结束时间
- Git status

### 状态

- pending
- running
- waiting_user
- success
- failed
- cancelled
- timeout

### 操作

- 查看 prompt
- 复制 prompt
- 粘贴外部 AI 输出
- 标记完成
- 标记失败
- 基于 Run 生成 Handoff

### 验收

- Manual Agent Run 可以进入 waiting_user。
- 用户可以粘贴外部 AI 输出完成 Run。
- CLI Agent Run 可以保存 stdout/stderr。

## 5.7 Handoff 页

### 目标

展示和生成任务交接文档。

### 内容

- 当前任务状态
- Primary Agent
- 最近 Run
- Supporting Agent 调用记录
- Workflow Run 记录
- 已完成事项
- 剩余事项
- 风险
- 是否建议切换 Agent
- 下一步建议

### 操作

- 生成 Handoff
- 复制 Handoff
- 查看历史 Handoff

### 验收

- 用户可以为任务生成 Handoff。
- Handoff 能说明当前任务状态。
- Handoff 能支持另一个 Agent 接手。

## 5.8 设置页

### 目标

管理系统基础设置。

### 设置项

- 默认 Context Mode
- 是否允许在 main/master 分支执行
- 敏感文件规则
- 默认项目路径
- UI 访问提示

### MVP 默认值

- 默认 Context Mode：standard
- 默认不允许自动 push
- 默认不允许自动 merge
- 默认不允许自动 deploy
- 默认不提交 `.ai/RUNS/`

## 6. 关键流程

## 6.1 初始化项目流程

```text
进入项目页
→ 添加项目路径
→ 点击初始化 .ai
→ 系统生成 .ai 工作区
→ 显示项目状态
```

生成文件：

```text
.ai/PROJECT.md
.ai/RULES.md
.ai/COMMANDS.md
.ai/AGENTS.yaml
.ai/WORKFLOWS.yaml
.ai/TASKS/
.ai/RUNS/
.ai/WORKFLOW_RUNS/
.ai/HANDOFF.md
```

## 6.2 创建 Agent 流程

```text
进入 Agent 管理页
→ 点击创建 Agent
→ 选择类型 Manual / Generic CLI
→ 填写名称、能力、模板、Context Mode
→ 保存
→ Agent 出现在列表
```

Manual Agent 必填：

- 名称
- 能力
- Prompt 模板

Generic CLI Agent 必填：

- 名称
- 能力
- 命令
- 输入方式

## 6.3 创建任务流程

```text
进入任务列表页
→ 点击创建任务
→ 填写标题、目标、范围、验收标准
→ 选择 required capabilities
→ 选择 Primary Agent
→ 保存
→ 进入任务详情页
```

如果不选择 Primary Agent：

- 系统根据能力推荐候选 Agent。
- 用户可跳过，但首次运行前必须选择。

## 6.4 运行 Primary Agent 流程

```text
任务详情页
→ 点击 Run Primary Agent
→ 系统生成 context
→ 根据 Agent 类型执行
→ 保存 Run
→ 更新任务状态
```

Manual Agent：

```text
生成 prompt
→ Run 状态 waiting_user
→ 用户复制 prompt 到外部 AI
→ 用户粘贴结果
→ Run 状态 success
```

Generic CLI Agent：

```text
生成 prompt
→ 执行 CLI
→ 保存 stdout/stderr
→ Run 状态 success / failed
```

## 6.5 临时运行其他 Agent 流程

```text
任务详情页
→ 点击 Run Another Agent
→ 选择 Agent
→ 选择原因
→ 执行 Run
→ 保存为 Supporting Agent Run
```

原因选项：

- review
- security_review
- architecture_review
- primary_failed
- quota_low
- capability_missing
- second_opinion
- user_requested

## 6.6 切换 Primary Agent 流程

```text
任务详情页
→ 点击 Switch Primary Agent
→ 选择新 Agent
→ 填写切换原因
→ 选择是否生成 Handoff
→ 保存切换记录
→ 新 Agent 成为 Primary Agent
```

切换后：

- 旧 Primary Agent 保留在历史记录。
- 后续默认使用新 Primary Agent。
- 系统记录切换原因。
- 建议生成 Handoff。

## 6.7 创建 Workflow 流程

```text
进入 Workflow 管理页
→ 点击创建 Workflow
→ 选择从模板创建或空白创建
→ 添加 Step
→ 配置 Step 类型和 Agent 规则
→ 保存
```

## 6.8 运行 Workflow 流程

```text
任务详情页
→ 点击 Run Workflow
→ 选择 Workflow
→ 系统按 Step 顺序执行
→ 遇到 waiting_user 暂停
→ 用户补充结果后继续
→ 结束后生成 Workflow Run
```

Step 执行规则：

- 未指定 Agent：使用任务 Primary Agent。
- 指定 Agent：使用该 Supporting Agent。
- Manual Step：等待用户输入。

## 6.9 生成 Handoff 流程

```text
任务详情页
→ 点击 Generate Handoff
→ 系统读取任务、Run、Workflow Run、Git 状态
→ 生成 Handoff
→ 展示并保存
```

## 7. 字段定义

## 7.1 Task

| 字段 | 类型 | 必填 | 说明 |
|---|---|---:|---|
| id | string | 是 | 任务 ID |
| title | string | 是 | 标题 |
| goal | string | 是 | 目标 |
| scope | string[] | 否 | 范围 |
| nonGoals | string[] | 否 | 非目标 |
| acceptanceCriteria | string[] | 否 | 验收标准 |
| requiredCapabilities | string[] | 否 | 所需能力 |
| primaryAgentId | string | 否 | 主 Agent |
| status | enum | 是 | 状态 |
| createdAt | datetime | 是 | 创建时间 |
| updatedAt | datetime | 是 | 更新时间 |

## 7.2 Agent

| 字段 | 类型 | 必填 | 说明 |
|---|---|---:|---|
| id | string | 是 | Agent ID |
| name | string | 是 | 名称 |
| type | enum | 是 | manual / cli |
| capabilities | string[] | 是 | 能力 |
| promptTemplate | string | 否 | Prompt 模板 |
| contextMode | enum | 是 | light / standard / full |
| command | string | CLI 必填 | CLI 命令 |
| enabled | boolean | 是 | 是否启用 |

## 7.3 Workflow

| 字段 | 类型 | 必填 | 说明 |
|---|---|---:|---|
| id | string | 是 | Workflow ID |
| name | string | 是 | 名称 |
| description | string | 否 | 描述 |
| steps | Step[] | 是 | 步骤 |
| enabled | boolean | 是 | 是否启用 |

## 7.4 Workflow Step

| 字段 | 类型 | 必填 | 说明 |
|---|---|---:|---|
| id | string | 是 | Step ID |
| title | string | 是 | 标题 |
| type | enum | 是 | manual_input / context_build / agent_run / review_prompt / handoff_build |
| agentId | string | 否 | 指定 Agent |
| usePrimaryAgent | boolean | 否 | 是否默认使用 Primary Agent |
| contextMode | enum | 否 | light / standard / full |
| required | boolean | 是 | 是否必填 |

## 7.5 Run

| 字段 | 类型 | 必填 | 说明 |
|---|---|---:|---|
| id | string | 是 | Run ID |
| taskId | string | 是 | 任务 ID |
| agentId | string | 是 | Agent ID |
| isPrimaryAgent | boolean | 是 | 是否主 Agent 执行 |
| reason | string | 否 | 调用原因 |
| contextMode | enum | 是 | 上下文模式 |
| prompt | string | 是 | 输入 prompt |
| result | string | 否 | 输出结果 |
| stdout | string | 否 | 标准输出 |
| stderr | string | 否 | 标准错误 |
| status | enum | 是 | 状态 |
| createdAt | datetime | 是 | 创建时间 |
| completedAt | datetime | 否 | 完成时间 |

## 7.6 Handoff

| 字段 | 类型 | 必填 | 说明 |
|---|---|---:|---|
| id | string | 是 | Handoff ID |
| taskId | string | 是 | 任务 ID |
| content | string | 是 | 内容 |
| sourceRunIds | string[] | 否 | 来源 Run |
| createdAt | datetime | 是 | 创建时间 |

## 8. Context Mode 规则

### light

包含：

- 任务标题
- 任务目标
- 当前 Handoff 摘要
- 必要 Run 摘要

适合：

- Handoff Agent
- 简单 Review
- 状态总结

### standard

包含：

- 项目摘要
- 任务详情
- 规则
- 当前 Handoff
- Git status
- 关键 Run 摘要

适合：

- Primary Agent 默认执行
- Workflow 常规步骤

### full

包含：

- 完整任务上下文
- 完整 Handoff
- 更完整 diff
- 相关文件路径或内容
- 关键历史记录

适合：

- 复杂架构分析
- 用户主动要求

默认不使用 full。

## 9. 状态定义

## 9.1 Task 状态

```text
draft
ready
running
blocked
reviewing
done
archived
```

## 9.2 Run 状态

```text
pending
running
waiting_user
success
failed
cancelled
timeout
```

## 9.3 Workflow Run 状态

```text
pending
running
waiting_user
success
failed
cancelled
```

## 9.4 Step 状态

```text
pending
running
waiting_user
success
failed
skipped
```

## 10. 安全规则

MVP 必须遵守：

- 不自动 push。
- 不自动 merge。
- 不自动 deploy。
- 不直接修改密钥文件。
- `.ai/RUNS/` 默认不进 Git。
- Web UI 不建议直接公网暴露。
- CLI Agent 执行前后记录 Git 状态。
- 切换 Primary Agent 必须记录原因。

## 11. 验收标准

MVP 完成后必须通过以下验收：

1. UI 可以初始化项目。
2. UI 可以创建多个任务。
3. UI 可以创建多个 Agent。
4. UI 可以创建多个 Workflow。
5. 任务可以选择 Primary Agent。
6. 任务可以运行 Primary Agent。
7. 任务可以临时运行 Supporting Agent。
8. 任务可以切换 Primary Agent。
9. Workflow 可以被多个任务复用。
10. Workflow Step 默认可使用 Primary Agent。
11. Manual Agent 可以生成 prompt 并等待用户回填。
12. 用户回填后 Run 变为 success。
13. Generic CLI Agent 可以执行命令并保存 stdout/stderr。
14. 系统可以生成 Handoff。
15. Handoff 能说明当前任务状态和下一步。
16. 系统不绑定任何具体 AI 工具。

## 12. MVP 不做

- 完整 IDE。
- 在线代码编辑器。
- 复杂 DAG Workflow。
- Workflow 条件分支。
- Workflow 并行步骤。
- 多 Agent 自动智能编排。
- 自动 commit。
- 自动 push。
- 自动 merge。
- 自动 deploy。
- 成本统计。
- 偏好记忆。
- 多用户权限。
- 公网 SaaS。
- ChatGPT Action。
- MCP Server。

## 13. 后续预留

MVP 数据模型和服务设计需预留：

- REST API。
- ChatGPT Action。
- MCP Server。
- HTTP Agent。
- Workflow 条件分支。
- Workflow DAG。
- 成本统计。
- 偏好记忆。
