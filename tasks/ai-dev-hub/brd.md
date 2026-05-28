# AI Dev Hub V0 BRD

## 1. 项目名称

AI Dev Hub：AI 开发任务中台

## 2. 项目背景

用户同时使用多个 AI 开发工具，包括 IDE Agent、CLI Agent、模型 API、手动对话工具等。

当前问题不是缺少 AI 工具，而是缺少统一工作流：

- 任务状态分散。
- 上下文分散。
- 执行记录分散。
- 固定流程无法沉淀。
- 工具切换时需要重复解释。
- 多电脑工作现场不统一。

需要一个私有部署的 AI 开发任务中台，统一管理任务、上下文、执行过程和交接状态。

## 3. 产品定位

AI Dev Hub 的定位是：

```text
AI 开发任务中台
```

核心价值：

```text
统一任务现场，支撑不同 AI 工具接力完成工作。
```

它不是：

- 不是 IDE。
- 不是代码编辑器。
- 不是单一 AI 工具客户端。
- 不是 Agent 市场。
- 不是 Workflow 平台。
- 不是多 Agent 自动编排平台。
- 不是公网 SaaS。

Agent 和 Workflow 是产品能力组件，不是产品定位本身。

## 4. 业务目标

V0 目标：

```text
让用户可以在 UI 中管理多个任务、多个 Agent、多个 Workflow，并把每次执行结果沉淀为 Run 和 Handoff。
```

核心业务目标：

- 多任务可管理。
- 多 Workflow 可管理。
- 多 Agent 可管理。
- 每次 AI 执行可记录。
- 每个任务可交接。
- 换工具、换电脑后任务现场不丢。

## 5. 目标用户

第一阶段用户：个人开发者 / 技术型 PM / 产品经理。

典型特征：

- 同时使用多个 AI 编程工具。
- 有远程服务器或私有工作环境。
- 希望通过 UI 管理 AI 开发任务。
- 经常需要代码评审、调研、任务拆解、交接总结。
- 希望把重复工作流沉淀下来。

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

- 关联多个 Run。
- 运行多个 Agent。
- 运行多个 Workflow。
- 生成多个阶段性 Handoff。

### 6.3 Agent

可复用执行单元。

Agent 不是产品定位，只是能力组件。

Agent 可以是：

- Manual Agent。
- Generic CLI Agent。
- 后续扩展的 HTTP Agent。

### 6.4 Workflow

可复用流程模板。

Workflow 不是产品定位，只是把固定工作步骤沉淀下来。

V0 支持多个 Workflow。

V0 Workflow 只支持线性步骤。

### 6.5 Run

一次 Agent 或 Workflow Step 的执行记录。

### 6.6 Handoff

任务交接文档。

用于让下一个工具、下一个 Agent、下一个 Workflow 或用户自己继续任务。

## 7. V0 核心闭环

```text
初始化项目
→ 创建多个 Agent
→ 创建多个 Workflow
→ 创建多个任务
→ 在任务中运行 Agent 或 Workflow
→ 保存 Run 结果
→ 生成 Handoff
→ 后续继续接力
```

## 8. V0 核心业务能力

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

V0 支持 Agent 类型：

- Manual Agent。
- Generic CLI Agent。

V0 推荐 Agent 模板：

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

### 8.4 Workflow 管理

用户可以创建多个固定 Workflow。

V0 只支持线性 Workflow：

```text
Step 1 → Step 2 → Step 3
```

V0 推荐 Workflow 模板：

- Pre-work Workflow。
- Research Workflow。
- Review Workflow。

Workflow Step 类型：

- manual_input。
- context_build。
- agent_run。
- review_prompt。
- handoff_build。

### 8.5 Run 记录

每次 Agent 执行都生成 Run。

Run 记录：

- Agent。
- Task。
- Prompt。
- 用户回填结果。
- stdout / stderr。
- 执行状态。
- 时间。
- git status。

### 8.6 Handoff 生成

系统基于任务、Run、Workflow Run 和用户备注生成 Handoff。

Handoff 内容：

- 当前状态。
- 已完成事项。
- 执行过的 Agent。
- 执行过的 Workflow。
- 关键输出。
- 风险。
- 剩余事项。
- 下一步建议。

## 9. V0 UI 范围

V0 必须有轻量 UI。

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

## 10. V0 不做范围

V0 明确不做：

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
- 绑定具体 AI 工具。

V0 可以保留扩展接口，但不实现上述能力。

## 11. 扩展性要求

V0 虽然做轻量版本，但数据结构和产品模型必须支持扩展。

必须满足：

- 一个 Project 支持多个 Task。
- 一个 Project 支持多个 Agent。
- 一个 Project 支持多个 Workflow。
- 一个 Task 支持多个 Run。
- 一个 Task 支持多个 Workflow Run。
- 一个 Agent 可被多个 Task 复用。
- 一个 Workflow 可被多个 Task 复用。
- Workflow 后续可扩展条件分支和 DAG，但 V0 不实现。
- Agent 后续可扩展 HTTP Adapter，但 V0 不实现。

## 12. 核心原则

### 12.1 不绑定工具

系统不写死 Cursor、Codex、Claude 或任何单一工具。

正确抽象：

```text
Task 需要能力
Agent 提供能力
Adapter 执行能力
Run 记录结果
Handoff 支持接力
```

### 12.2 用户可控

Agent 和 Workflow 由用户创建、启用、禁用和调用。

### 12.3 V0 简单，模型可扩展

V0 不做复杂功能，但模型不能写死成单任务、单 Agent、单 Workflow。

### 12.4 先记录，后自动化

V0 的重点是沉淀任务现场，不追求自动完成所有工作。

## 13. V0 典型场景

### 13.1 多任务管理

用户同时维护多个 AI 开发任务，并可在 UI 中切换。

### 13.2 创建 Review Agent

用户在 UI 中创建 Review Agent。

后续可在多个任务中复用。

### 13.3 创建 Pre-work Workflow

用户创建开发前流程：

```text
确认任务目标 → 生成上下文 → 调用规划 Agent → 生成 Handoff
```

该 Workflow 可用于多个任务。

### 13.4 创建 Research Workflow

用户创建调研流程：

```text
输入调研问题 → 调用 Research Agent → 用户补充结果 → 调用 Summary Agent → 生成 Handoff
```

该 Workflow 可用于多个调研任务。

### 13.5 多工具接力

用户用一个 Agent 生成结果，再用另一个 Agent 或 Workflow 基于 Handoff 继续。

系统不依赖某个工具的聊天记录。

## 14. V0 成功标准

V0 完成后必须能演示：

1. 通过 UI 初始化项目。
2. 通过 UI 创建多个任务。
3. 通过 UI 创建多个 Agent。
4. 通过 UI 创建多个 Workflow。
5. 一个 Agent 可被多个任务复用。
6. 一个 Workflow 可被多个任务复用。
7. 通过 UI 运行 Workflow。
8. Manual Agent Step 可以生成 prompt 并等待用户回填结果。
9. 用户回填结果后 Workflow 可继续。
10. 系统保存 Run 记录。
11. 系统生成 Handoff。
12. 后续 Agent 或 Workflow 能基于 Handoff 接力。

## 15. 业务指标

V0 关注：

- Task 创建数量。
- Agent 创建数量。
- Workflow 创建数量。
- Workflow 运行次数。
- Run 记录数量。
- Handoff 生成数量。
- 用户重复解释任务背景次数下降。

## 16. 关键风险

### 风险 1：范围膨胀

V0 加入 UI 和 Workflow 后容易膨胀。

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

## 17. 下一步

BRD 确认后进入 PRD。

PRD 需要明确：

- 页面流程。
- 字段定义。
- 多任务关系。
- 多 Agent 关系。
- 多 Workflow 关系。
- Agent 创建流程。
- Workflow 创建流程。
- Workflow Run 流程。
- Manual Agent 回填流程。
- Handoff 生成规则。
- V0 验收标准。
