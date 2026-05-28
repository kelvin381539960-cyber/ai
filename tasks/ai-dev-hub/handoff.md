# AI Work Hub Handoff

## 当前状态

技术方案和实现级文档已完成，当前已经具备交给开发工具实现 MVP 的输入。

新增：

```text
tasks/ai-dev-hub/database-schema.md
tasks/ai-dev-hub/api-spec.md
tasks/ai-dev-hub/implementation-plan.md
```

已有核心文档：

```text
tasks/ai-dev-hub/brd.md
tasks/ai-dev-hub/prd.md
tasks/ai-dev-hub/prd-detail.md
tasks/ai-dev-hub/ux-optimized-plan.md
tasks/ai-dev-hub/usability-readiness-assessment.md
tasks/ai-dev-hub/technical-design.md
```

## 当前产品定位

```text
产品经理 / 运营的 AI 工作台
```

正式定义：

```text
面向产品、运营、技术型 PM 和个人开发者的 AI 工作流任务中台。
```

## 当前主路径

```text
选择任务类型 → 填写目标 → 添加资料 → 系统推荐助手和流程 → 开始执行 → 查看输出 → 继续优化 / 评审 → 生成最终结论
```

## 当前技术结论

```text
Next.js + TypeScript + SQLite + 文件系统 + 模块化单体
```

不要一开始做微服务。

## 当前核心对象

```text
Workspace
Project / Space
Task
Material / Source
Assistant / Agent
Workflow
Workflow Run
Run
Output
Handoff
```

其中：

- Material 是输入核心。
- Output 是产出核心。
- Assistant 是用户看到的“助手”。
- Workflow 是用户看到的“任务流程”。
- Run 是底层执行记录。
- Handoff 是 Output 的一种。

## 已完成实现级文档

### database-schema.md

定义：

```text
workspaces
projects
tasks
materials
assistants
workflows
workflow_runs
runs
outputs
template_installations
settings
```

### api-spec.md

定义 API：

```text
Onboarding
Workspace
Project
Task
Material
Assistant
Run
Workflow
Workflow Run
Output
Search
Settings
```

### implementation-plan.md

拆分实现阶段：

```text
Phase 0：项目初始化
Phase 1：Onboarding + Seed Templates
Phase 2：Task + Material
Phase 3：Assistant + Manual Run
Phase 4：Output 管理
Phase 5：Workflow Runtime
Phase 6：可用性补齐
```

## MVP 首个 Demo 验收

必须能演示：

```text
初始化系统
创建需求调研任务
添加资料
运行调研助手
复制 prompt
粘贴 AI 输出
生成调研结论 Output
编辑 Output
标记最终版
```

如果这个 Demo 不顺，说明产品还不能交付使用。

## 当前禁止偏离

实现时不要先做：

```text
复杂 DAG
条件分支
多用户权限
成本统计
ChatGPT Action
MCP Server
自动代码执行
自动 push / merge / deploy
```

## 推荐执行提示

```text
请按 tasks/ai-dev-hub/technical-design.md、database-schema.md、api-spec.md、implementation-plan.md 实现 AI Work Hub MVP。

优先实现用户真实闭环，不要先做高级能力。

用户主路径：选择任务类型 → 添加资料 → 推荐助手和流程 → Manual Assistant 生成 prompt → 用户回填外部 AI 输出 → 保存 Output。

Material 和 Output 是核心对象。Assistant 和 Workflow 是支撑对象。Run 是底层记录。Handoff 是 Output 的一种。
```
