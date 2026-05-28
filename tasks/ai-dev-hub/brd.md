# AI Dev Hub MVP BRD

## 1. 项目名称

AI Dev Hub：AI 开发任务中台

## 2. 项目背景

用户同时使用多个 AI 开发工具，包括 IDE Agent、CLI Agent、模型 API、手动对话工具等。

真实使用场景中：

- 同一任务大概率由同一个 CLI / Agent 完成。
- 不同任务可能选择不同工具。
- 任务执行中切换工具是少数情况。
- 频繁跨工具接力会增加上下文成本和管理成本。

当前问题不是缺少 AI 工具，而是缺少统一任务现场：

- 任务状态分散。
- 上下文分散。
- 执行记录分散。
- 固定流程无法沉淀。
- 不同任务使用不同工具时缺少统一管理。
- 少数切换工具场景缺少交接能力。
- 多电脑工作现场不统一。

需要一个私有部署的 AI 开发任务中台，统一管理任务、主执行 Agent、辅助 Agent、Workflow、Run 和 Handoff。

## 3. 产品定位

AI Dev Hub 的定位是：

```text
AI 开发任务中台
```

核心价值：

```text
以任务为中心，为每个任务选择主 Agent，并沉淀执行现场。
```

它不是：

- 不是 IDE。
- 不是代码编辑器。
- 不是单一 AI 工具客户端。
- 不是 Agent 市场。
- 不是 Workflow 平台。
- 不是多 Agent 自动编排平台。
- 不是公网 SaaS。

Agent、Workflow、External AI Control Layer 都是能力组件，不是产品定位本身。

## 4. 业务目标

MVP 目标：

```text
让用户可以在 UI 中管理多个任务、多个 Agent、多个 Workflow，并为每个任务指定主 Agent，默认由主 Agent 完成任务，少数情况下再切换或调用辅助 Agent。
```

核心业务目标：

- 多任务可管理。
- 每个任务有主 Agent。
- 同一任务内减少不必要的工具切换。
- 不同任务可选择不同 Agent。
- 每次 AI 执行可记录。
- 每个任务可交接。
- 换电脑后任务现场不丢。
- 少数换工具场景有 Handoff 支撑。

## 5. 目标用户

第一阶段用户：个人开发者 / 技术型 PM / 产品经理。

典型特征：

- 同时使用多个 AI 编程工具。
- 有远程服务器或私有工作环境。
- 希望通过 UI 管理 AI 开发任务。
- 同一任务通常希望一个主 CLI / Agent 负责到底。
- 不同任务会根据类型选择不同 Agent。
- 经常需要代码评审、调研、任务拆解、交接总结。

## 6. 核心业务对象

### 6.1 Project

项目工作区。

一个 Project 下可以有：

- 多个 Task。
- 多个 Agent。
- 多个 Workflow。
- 多个 Run。
- 多个 Handoff 记录。

### 6.2 Task

AI 开发任务。

一个 Task 可以：

- 指定一个 Primary Agent。
- 关联多个 Run。
- 运行多个辅助 Agent。
- 运行多个 Workflow。
- 生成多个阶段性 Handoff。

### 6.3 Primary Agent

任务主执行 Agent。

定义：

```text
一个任务默认由一个 Primary Agent 持续执行。
```

作用：

- 降低上下文切换。
- 降低 token 浪费。
- 保持执行连续性。
- 避免多工具反复理解同一任务。

### 6.4 Supporting Agent

辅助 Agent。

只在必要时使用，例如：

- Review。
- Security Review。
- Architecture Review。
- Handoff Summary。
- Primary Agent 失败。
- Primary Agent 能力不足。
- Primary Agent 额度不足。

### 6.5 Agent

可复用执行单元。

Agent 不是产品定位，只是能力组件。

Agent 可以是：

- Manual Agent。
- Generic CLI Agent。
- 后续扩展的 HTTP Agent。

### 6.6 Workflow

可复用流程模板。

Workflow 不是产品定位，只是把固定工作步骤沉淀下来。

MVP 支持多个 Workflow。

MVP Workflow 只支持线性步骤。

Workflow Step 默认优先使用任务 Primary Agent，除非步骤显式指定 Supporting Agent。

### 6.7 Run

一次 Agent 或 Workflow Step 的执行记录。

### 6.8 Handoff

任务交接文档。

用于让用户、Primary Agent、Supporting Agent 或后续替换 Agent 继续任务。

### 6.9 External AI Control Layer

外部 AI 控制层。

用于后续让 ChatGPT、Claude、Cursor、Codex 等工具通过 Action、MCP 或 API 受控访问 AI Dev Hub。

该能力不进入 MVP 主线，实现阶段可作为扩展预留。

## 7. MVP 核心闭环

```text
初始化项目
→ 创建多个 Agent
→ 创建多个 Workflow
→ 创建多个任务
→ 为任务选择 Primary Agent
→ 在任务中运行 Primary Agent 或 Workflow
→ 必要时调用 Supporting Agent
→ 保存 Run 结果
→ 生成 Handoff
→ 后续继续接力
```

## 8. MVP 核心业务能力

### 8.1 项目管理

用户可以在 UI 中选择或初始化一个项目工作区。

项目工作区包含：

```text
.ai/
  PROJECT.md
  RULES.md
  COMMANDS.md
  AGENTS.yaml
  WORKFLOWS.yaml
  TASKS/
  RUNS/
  WORKFLOW_RUNS/
  HANDOFF.md
```

### 8.2 多任务管理

用户可以创建、查看、切换多个任务。

Task 字段：

- 标题。
- 目标。
- 范围。
- 非目标。
- 验收标准。
- 所需能力。
- Primary Agent。
- 当前状态。

Task 状态：

- draft。
- ready。
- running。
- blocked。
- reviewing。
- done。
- archived。

### 8.3 Agent 管理

用户可以手动创建多个常用 Agent。

MVP 支持 Agent 类型：

- Manual Agent。
- Generic CLI Agent。

MVP 推荐 Agent 模板：

- Code Agent。
- Review Agent。
- Security Review Agent。
- Architecture Review Agent。
- Research Agent。
- Handoff Agent。

Agent 字段：

- 名称。
- 类型。
- 能力。
- Prompt 模板。
- 执行方式。
- 是否启用。
- 默认上下文模式。

### 8.4 Primary Agent 选择

创建任务时，用户可以选择 Primary Agent。

如果用户不选，系统根据任务所需能力推荐候选 Agent。

任务执行中默认继续使用 Primary Agent。

只有以下情况建议切换或调用其他 Agent：

- 用户手动切换。
- Primary Agent 失败。
- Primary Agent 额度不足。
- 当前步骤需要特殊能力，如 review / security_review。
- 任务进入评审阶段。
- 用户明确要求第二意见。

### 8.5 Workflow 管理

用户可以创建多个固定 Workflow。

MVP 只支持线性 Workflow：

```text
Step 1 → Step 2 → Step 3
```

MVP 推荐 Workflow 模板：

- Pre-work Workflow。
- Research Workflow。
- Review Workflow。

Workflow Step 类型：

- manual_input。
- context_build。
- agent_run。
- review_prompt。
- handoff_build。

Workflow 执行规则：

- 默认使用任务 Primary Agent。
- Step 可以显式指定 Supporting Agent。
- Step 可以指定 context mode。
- Manual Step 可以等待用户输入。

### 8.6 Context Mode

为控制 token 和保持执行效率，MVP 必须支持上下文模式。

Context Mode：

- light。
- standard。
- full。

默认规则：

- Primary Agent 默认 standard。
- Review / Handoff 类 Supporting Agent 默认 light 或 standard。
- 不默认传全量历史。
- 不默认传完整代码。
- 优先传文件路径、摘要、当前任务、当前 handoff。

### 8.7 Run 记录

每次 Agent 执行都生成 Run。

Run 记录：

- Agent。
- Task。
- 是否 Primary Agent。
- Prompt。
- Context Mode。
- 用户回填结果。
- stdout / stderr。
- 执行状态。
- 时间。
- git status。

### 8.8 Handoff 生成

系统基于任务、Run、Workflow Run 和用户备注生成 Handoff。

Handoff 内容：

- 当前状态。
- Primary Agent。
- 执行过的 Supporting Agent。
- 执行过的 Workflow。
- 关键输出。
- 风险。
- 剩余事项。
- 是否建议切换 Agent。
- 下一步建议。

## 9. MVP UI 范围

MVP 必须有轻量 UI。

页面范围：

- 项目页。
- 任务列表页。
- 任务详情页。
- Agent 管理页。
- Workflow 管理页。
- Run 记录页。
- Handoff 页。

UI 不做：

- 不做代码编辑器。
- 不做复杂 diff viewer。
- 不做权限系统。
- 不做多用户协作。
- 不做 Agent 市场。

## 10. MVP 不做范围

MVP 明确不做：

- 完整 IDE。
- 在线代码编辑器。
- 复杂 DAG Workflow。
- Workflow 条件分支。
- Workflow 并行步骤。
- 多 Agent 自动智能编排。
- 任务内频繁自动切换 Agent。
- 自动 commit。
- 自动 push。
- 自动 merge。
- 自动 deploy。
- 成本统计。
- 偏好记忆。
- 多用户权限。
- 公网 SaaS。
- 绑定具体 AI 工具。
- ChatGPT Action。
- MCP Server。

MVP 可以保留扩展接口，但不实现上述能力。

## 11. 扩展性要求

MVP 虽然做轻量版本，但数据结构和产品模型必须支持扩展。

必须满足：

- 一个 Project 支持多个 Task。
- 一个 Project 支持多个 Agent。
- 一个 Project 支持多个 Workflow。
- 一个 Task 支持一个 Primary Agent。
- 一个 Task 支持多个 Supporting Agent Run。
- 一个 Task 支持多个 Workflow Run。
- 一个 Agent 可被多个 Task 复用。
- 一个 Workflow 可被多个 Task 复用。
- Workflow 后续可扩展条件分支和 DAG，但 MVP 不实现。
- Agent 后续可扩展 HTTP Adapter，但 MVP 不实现。
- 后续可暴露 REST API 给 ChatGPT Action 使用。
- 后续可暴露 MCP Server 给外部 AI 工具使用。

## 12. 核心原则

### 12.1 任务级主执行器

系统默认不是频繁换工具，而是任务级选择主执行器。

```text
一个任务，一个 Primary Agent，持续执行。
```

### 12.2 少数场景才切换

切换 Agent 是例外，不是默认路径。

常见切换原因：

- review。
- 安全检查。
- 架构检查。
- primary agent 失败。
- 额度不足。
- 用户要第二意见。

### 12.3 不绑定工具

系统不写死 Cursor、Codex、Claude 或任何单一工具。

正确抽象：

```text
Task 选择 Primary Agent
Agent 提供能力
Adapter 执行能力
Run 记录结果
Handoff 支持少数切换场景
```

### 12.4 用户可控

Agent 和 Workflow 由用户创建、启用、禁用和调用。

### 12.5 MVP 简单，模型可扩展

MVP 不做复杂功能，但模型不能写死成单任务、单 Agent、单 Workflow。

### 12.6 外部 AI 受控接入

后续允许 ChatGPT、Claude、Cursor 等外部 AI 通过 API / Action / MCP 管理任务和 Workflow，但不能绕过 AI Dev Hub 的安全策略直接操作代码、shell、密钥或部署。

## 13. MVP 典型场景

### 13.1 多任务管理

用户同时维护多个 AI 开发任务，并可在 UI 中切换。

每个任务有自己的 Primary Agent。

### 13.2 为任务选择主 Agent

用户创建任务时选择一个最适合的 Agent 作为主执行器。

任务内默认继续使用该 Agent。

### 13.3 创建 Review Agent

用户在 UI 中创建 Review Agent。

Review Agent 作为 Supporting Agent，可被多个任务在评审阶段调用。

### 13.4 创建 Pre-work Workflow

用户创建开发前流程：

```text
确认任务目标 → 生成上下文 → 调用 Primary Agent 规划 → 生成 Handoff
```

该 Workflow 可用于多个任务。

### 13.5 创建 Research Workflow

用户创建调研流程：

```text
输入调研问题 → 调用 Research Agent → 用户补充结果 → 调用 Summary Agent → 生成 Handoff
```

该 Workflow 可用于多个调研任务。

### 13.6 少数场景切换 Agent

任务由 Primary Agent 执行，Review Agent 只在评审阶段介入。

系统通过 Handoff 支持切换，但不鼓励频繁切换。

## 14. 外部 AI 扩展方向

### REST API + ChatGPT Action

目标：让 ChatGPT 可以通过受控 API 管理 AI Dev Hub。

能力：

- 创建任务。
- 查询任务。
- 创建 Agent。
- 创建 Workflow。
- 回填 Run。
- 获取 Handoff。

### MCP Server

目标：让支持 MCP 的 AI 工具通过 tools 调用 AI Dev Hub。

能力：

- task tools。
- agent tools。
- workflow tools。
- run tools。
- handoff tools。

限制：

- 不开放直接 shell。
- 不开放自动 push / merge / deploy。
- 高风险操作必须用户确认。

## 15. MVP 成功标准

MVP 完成后必须能演示：

1. 通过 UI 初始化项目。
2. 通过 UI 创建多个任务。
3. 通过 UI 创建多个 Agent。
4. 通过 UI 创建多个 Workflow。
5. 创建任务时选择 Primary Agent。
6. 一个任务默认由 Primary Agent 执行。
7. Review Agent 可作为 Supporting Agent 被调用。
8. 一个 Agent 可被多个任务复用。
9. 一个 Workflow 可被多个任务复用。
10. 通过 UI 运行 Workflow。
11. Manual Agent Step 可以生成 prompt 并等待用户回填结果。
12. 用户回填结果后 Workflow 可继续。
13. 系统保存 Run 记录。
14. 系统生成 Handoff。
15. 后续 Agent 或 Workflow 能基于 Handoff 接力。

## 16. 业务指标

MVP 关注：

- Task 创建数量。
- Task 配置 Primary Agent 比例。
- Agent 创建数量。
- Workflow 创建数量。
- Workflow 运行次数。
- Run 记录数量。
- Handoff 生成数量。
- 同一任务内 Agent 切换次数下降。
- 用户重复解释任务背景次数下降。

## 17. 关键风险

### 风险 1：范围膨胀

MVP 加入 UI 和 Workflow 后容易膨胀。

控制：

- UI 只做操作台。
- Workflow 只做线性步骤。
- 不做 DAG。
- 不做自动多 Agent 编排。

### 风险 2：误做成 IDE

控制：

- 不做代码编辑器。
- 不做插件市场。
- 不做项目文件浏览器的复杂编辑能力。

### 风险 3：过早绑定工具

控制：

- 只定义 Agent / Adapter 协议。
- 具体工具通过配置接入。

### 风险 4：执行安全风险

控制：

- 不自动 push / merge / deploy。
- CLI Agent 需要执行记录。
- 敏感文件变更需要提示。
- Web UI 不直接公网裸露。

### 风险 5：任务内频繁切换 Agent 造成效率下降

控制：

- 引入 Primary Agent。
- 任务内默认使用 Primary Agent。
- Supporting Agent 只在必要场景调用。
- Handoff 用于少数切换，而不是每一步都切换。

### 风险 6：Token 成本增加

控制：

- 引入 Context Mode。
- 默认不传全量历史。
- 默认不传完整代码。
- 优先传摘要、文件路径、当前任务、当前 handoff。

## 18. 下一步

BRD 确认后进入 PRD。

PRD 需要明确：

- 页面流程。
- 字段定义。
- 多任务关系。
- Primary Agent 字段和流程。
- Supporting Agent 调用规则。
- 多 Agent 关系。
- 多 Workflow 关系。
- Context Mode 规则。
- Agent 创建流程。
- Workflow 创建流程。
- Workflow Run 流程。
- Manual Agent 回填流程。
- Handoff 生成规则。
- 外部 AI 接入预留点。
- MVP 验收标准。
