# AI Dev Hub V0 BRD

## 1. 项目名称

AI Dev Hub：AI 开发任务中台

## 2. 项目背景

用户同时使用多个 AI 开发工具，包括 IDE Agent、CLI Agent、模型 API、手动对话工具等。

当前问题不是缺少 AI 工具，而是缺少统一工作流：

- 任务状态分散。
- 上下文分散。
- 执行记录分散。
- 常用 Agent prompt 无法复用。
- 固定工作流无法沉淀。
- 工具切换时需要重复解释。
- 上班和下班使用不同电脑，工作现场不统一。

需要一个私有部署的 AI 开发任务中台，统一管理任务、Agent、Workflow、执行记录和交接文档。

## 3. 业务目标

V0 目标：

```text
让用户可以在 UI 中创建 Agent、创建 Workflow、运行任务、保存结果、生成 Handoff。
```

核心业务目标：

- 常用 Agent 可复用。
- 固定 Workflow 可复用。
- 每次 AI 执行可记录。
- 每个任务可交接。
- 换工具、换电脑后任务现场不丢。

## 4. 目标用户

第一阶段用户：个人开发者 / 技术型 PM / 产品经理。

典型特征：

- 同时使用多个 AI 编程工具。
- 有远程服务器或私有工作环境。
- 希望通过 UI 管理 AI 工作流。
- 经常需要代码评审、调研、任务拆解、交接总结。
- 希望把重复 prompt 和固定流程沉淀下来。

## 5. 产品定位

AI Dev Hub 不是：

- 不是 IDE。
- 不是代码编辑器。
- 不是单一 AI 工具客户端。
- 不是多 Agent 自动编排平台。
- 不是公网 SaaS。

AI Dev Hub 是：

- AI 任务中台。
- Agent 预设管理器。
- Workflow 管理器。
- AI 执行记录中心。
- Handoff 交接中心。

## 6. V0 核心闭环

```text
初始化项目
→ 创建 Agent
→ 创建 Workflow
→ 创建任务
→ 运行 Workflow / Agent
→ 保存 Run 结果
→ 生成 Handoff
```

## 7. V0 核心业务能力

### 7.1 项目管理

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

### 7.2 Agent 管理

用户可以手动创建常用 Agent。

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

### 7.3 Workflow 管理

用户可以创建固定 Workflow。

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

### 7.4 任务管理

用户可以创建任务。

任务字段：

- 标题。
- 目标。
- 范围。
- 非目标。
- 验收标准。
- 所需能力。
- 当前状态。

### 7.5 Run 记录

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

### 7.6 Handoff 生成

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

## 8. V0 UI 范围

V0 必须有轻量 UI。

页面范围：

- 项目页。
- Agent 管理页。
- Workflow 管理页。
- 任务页。
- Run 记录页。
- Handoff 页。

UI 不做：

- 不做代码编辑器。
- 不做复杂 diff viewer。
- 不做权限系统。
- 不做多用户协作。
- 不做 Agent 市场。

## 9. V0 不做范围

V0 不做：

- 完整 IDE。
- 在线代码编辑器。
- 复杂 DAG Workflow。
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

## 10. 核心原则

### 10.1 不绑定工具

系统不写死 Cursor、Codex、Claude 或任何单一工具。

正确抽象：

```text
Task 需要能力
Agent 提供能力
Adapter 执行能力
Run 记录结果
Handoff 支持接力
```

### 10.2 用户可控

Agent 和 Workflow 由用户创建、启用、禁用和调用。

### 10.3 先线性，后复杂

V0 Workflow 只做线性流程。

复杂 DAG、分支、并行放到后续版本。

### 10.4 先记录，后自动化

V0 的重点是沉淀任务现场，不追求自动完成所有工作。

## 11. V0 典型场景

### 11.1 创建 Review Agent

用户在 UI 中创建 Review Agent。

后续可在任务中直接调用，生成评审 prompt 或调用 CLI 执行。

### 11.2 创建 Pre-work Workflow

用户创建开发前流程：

```text
确认任务目标 → 生成上下文 → 调用规划 Agent → 生成 Handoff
```

### 11.3 创建 Research Workflow

用户创建调研流程：

```text
输入调研问题 → 调用 Research Agent → 用户补充结果 → 调用 Summary Agent → 生成 Handoff
```

### 11.4 多工具接力

用户用一个 Agent 生成结果，再用另一个 Agent 基于 Handoff 继续。

系统不依赖某个工具的聊天记录。

## 12. V0 成功标准

V0 完成后必须能演示：

1. 通过 UI 初始化项目。
2. 通过 UI 创建 Agent。
3. 通过 UI 创建 Workflow。
4. 通过 UI 创建任务。
5. 通过 UI 运行 Workflow。
6. Manual Agent Step 可以生成 prompt 并等待用户回填结果。
7. 用户回填结果后 Workflow 可继续。
8. 系统保存 Run 记录。
9. 系统生成 Handoff。
10. 后续 Agent 能基于 Handoff 接力。

## 13. 业务指标

V0 关注：

- Agent 创建数量。
- Workflow 创建数量。
- Workflow 运行次数。
- Run 记录数量。
- Handoff 生成数量。
- 用户重复解释任务背景次数下降。

## 14. 关键风险

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

## 15. 下一步

BRD 确认后进入 PRD。

PRD 需要明确：

- 页面流程。
- 字段定义。
- Agent 创建流程。
- Workflow 创建流程。
- Workflow Run 流程。
- Manual Agent 回填流程。
- Handoff 生成规则。
- V0 验收标准。
