# AI Work Hub MVP BRD

## 1. 项目名称

暂定：AI Work Hub

原代号：AI Dev Hub

## 2. 项目背景

产品经理、运营、技术型 PM 和个人开发者正在同时使用多个 AI 工具完成工作。

常见问题：

- 任务状态分散在多个 AI 对话中。
- 调研、PRD、运营方案、评审、总结等流程无法沉淀。
- 每次都要重新写 prompt。
- 不同 AI 工具输出无法统一管理。
- 同一任务缺少持续上下文。
- 多电脑工作现场不统一。
- 少数开发/技术任务还需要接入 CLI 或代码 Agent。

需要一个私有部署的 AI 工作流任务中台，统一管理任务、Agent、Workflow、Run 和 Handoff。

## 3. 产品定位

AI Work Hub 的定位是：

```text
AI 工作流任务中台
```

核心价值：

```text
以任务为中心，沉淀 AI 工作现场，让产品、运营、技术任务可以持续推进和复用。
```

它不是：

- 不是 IDE。
- 不是代码编辑器。
- 不是单一 AI 工具客户端。
- 不是 Agent 市场。
- 不是复杂 Workflow 平台。
- 不是多 Agent 自动编排平台。
- 不是公网 SaaS。

Agent、Workflow、External AI Control Layer 都是能力组件，不是产品定位本身。

## 4. 目标用户

优先用户：

```text
产品经理 / 运营 / 技术型 PM / 个人开发者
```

典型特征：

- 同时使用多个 AI 工具。
- 经常做调研、PRD、评审、总结、运营方案。
- 希望通过 UI 管理 AI 工作流。
- 希望把重复流程沉淀为 Workflow。
- 希望把常用角色沉淀为 Agent。
- 希望同一任务持续积累上下文和结论。
- 少数场景需要接入开发 CLI 或代码 Agent。

## 5. 业务目标

MVP 目标：

```text
让用户可以在 UI 中管理多个任务、多个 Agent、多个 Workflow，并把每次 AI 输出沉淀为 Run 和 Handoff。
```

核心业务目标：

- 多任务可管理。
- 多 Workflow 可管理。
- 多 Agent 可管理。
- 每次 AI 输出可记录。
- 每个任务可生成结论和交接。
- 换工具、换电脑后任务现场不丢。
- 产品/运营固定流程可以复用。

## 6. 核心业务对象

### 6.1 Workspace

用户工作空间。

一个 Workspace 下可以有：

- 多个 Project。
- 多个 Task。
- 多个 Agent。
- 多个 Workflow。
- 多个 Run。
- 多个 Handoff。

### 6.2 Project

项目或业务主题。

例如：

- 某产品版本。
- 某运营活动。
- 某调研专题。
- 某代码项目。

### 6.3 Task

AI 工作任务。

一个 Task 可以：

- 指定一个 Primary Agent。
- 关联多个 Run。
- 运行多个辅助 Agent。
- 运行多个 Workflow。
- 生成多个阶段性 Handoff。

### 6.4 Primary Agent

任务主 Agent。

定义：

```text
一个任务默认由一个 Primary Agent 持续推进。
```

示例：

- PRD 任务默认由 PRD Agent 负责。
- 调研任务默认由 Research Agent 负责。
- 运营活动任务默认由 Ops Planning Agent 负责。
- 技术评审任务默认由 Tech Review Agent 负责。

### 6.5 Supporting Agent

辅助 Agent。

只在必要时使用，例如：

- Review。
- 数据分析。
- 安全检查。
- 技术追问。
- Handoff 总结。
- 第二意见。

### 6.6 Agent

可复用 AI 角色。

Agent 可以是：

- Manual Agent。
- Generic CLI Agent。
- 后续扩展的 HTTP Agent。

### 6.7 Workflow

可复用流程模板。

MVP 支持多个 Workflow。

MVP Workflow 只支持线性步骤。

Workflow Step 默认优先使用任务 Primary Agent，除非步骤显式指定 Supporting Agent。

### 6.8 Run

一次 Agent 或 Workflow Step 的执行记录。

### 6.9 Handoff

任务结论 / 交接文档。

用于让用户、下一个 Agent、下一个 Workflow 或外部 AI 工具继续任务。

## 7. MVP 核心闭环

```text
创建 Workspace/Project
→ 创建多个 Agent
→ 创建多个 Workflow
→ 创建多个 Task
→ 为 Task 选择 Primary Agent
→ 运行 Agent 或 Workflow
→ 必要时调用 Supporting Agent
→ 保存 Run 结果
→ 生成 Handoff / 任务结论
```

## 8. MVP 核心业务能力

### 8.1 Workspace / Project 管理

用户可以创建或选择 Workspace / Project。

Project 可代表：

- 产品项目。
- 运营项目。
- 调研专题。
- 开发项目。

### 8.2 多任务管理

用户可以创建、查看、切换多个任务。

Task 字段：

- 标题。
- 目标。
- 类型。
- 范围。
- 非目标。
- 预期输出。
- 所需能力。
- Primary Agent。
- 当前状态。

Task 类型：

- research。
- prd。
- review。
- ops_plan。
- data_analysis。
- meeting_summary。
- tech_review。
- dev_task。

### 8.3 Agent 管理

用户可以手动创建多个常用 Agent。

MVP 支持 Agent 类型：

- Manual Agent。
- Generic CLI Agent。

MVP 推荐 Agent 模板：

- Research Agent。
- PRD Agent。
- Review Agent。
- Ops Planning Agent。
- Data Analysis Agent。
- Meeting Summary Agent。
- Handoff Agent。
- Tech Review Agent。
- Code Agent。

Agent 字段：

- 名称。
- 类型。
- 能力。
- Prompt 模板。
- 执行方式。
- 是否启用。
- 默认上下文模式。

### 8.4 Workflow 管理

用户可以创建多个固定 Workflow。

MVP 只支持线性 Workflow：

```text
Step 1 → Step 2 → Step 3
```

MVP 推荐 Workflow 模板：

- 需求调研 Workflow。
- PRD 生成 Workflow。
- 竞品分析 Workflow。
- 运营活动 Workflow。
- 评审 Workflow。
- 会议纪要 Workflow。
- 交接总结 Workflow。
- 开发 Pre-work Workflow。

Workflow Step 类型：

- manual_input。
- context_build。
- agent_run。
- review_prompt。
- handoff_build。

### 8.5 Primary Agent 选择

创建任务时，用户可以选择 Primary Agent。

如果用户不选，系统根据任务类型和所需能力推荐候选 Agent。

任务执行中默认继续使用 Primary Agent。

用户可以随时：

- 临时运行其他 Agent。
- 正式切换 Primary Agent。

### 8.6 Context Mode

为控制 token 和提高效率，MVP 支持上下文模式。

Context Mode：

- light。
- standard。
- full。

默认规则：

- Primary Agent 默认 standard。
- Review / Handoff 类 Supporting Agent 默认 light 或 standard。
- 不默认传全量历史。
- 优先传任务目标、当前结论、关键输入、文件路径或摘要。

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
- 关键输入。
- 关键输出。

### 8.8 Handoff / 结论生成

系统基于任务、Run、Workflow Run 和用户备注生成 Handoff。

Handoff 内容：

- 当前任务状态。
- Primary Agent。
- 执行过的 Supporting Agent。
- 执行过的 Workflow。
- 关键结论。
- 风险。
- 剩余事项。
- 下一步建议。

## 9. MVP UI 范围

MVP 必须有轻量 UI。

页面范围：

- Workspace / Project 页。
- 任务列表页。
- 任务详情页。
- Agent 管理页。
- Workflow 管理页。
- Run 记录页。
- Handoff / 结论页。
- 设置页。

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

- 一个 Workspace 支持多个 Project。
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

### 12.1 任务级主 Agent

系统默认不是频繁换工具，而是任务级选择主 Agent。

```text
一个任务，一个 Primary Agent，持续推进。
```

### 12.2 少数场景才切换

切换 Agent 是例外，不是默认路径。

常见切换原因：

- review。
- 数据分析。
- 技术追问。
- primary agent 失败。
- 额度不足。
- 用户要第二意见。

### 12.3 不绑定工具

系统不写死 ChatGPT、Cursor、Codex、Claude 或任何单一工具。

正确抽象：

```text
Task 选择 Primary Agent
Agent 提供能力
Adapter 执行能力
Run 记录结果
Handoff 支持少数切换场景
```

### 12.4 产品/运营优先

默认场景优先服务产品、运营、技术型 PM 的日常 AI 工作流。

开发任务是重要扩展场景，但不是唯一主线。

## 13. MVP 典型场景

### 13.1 产品需求调研

用户创建调研任务，选择 Research Agent，运行需求调研 Workflow，最终生成调研结论。

### 13.2 PRD 生成

用户创建 PRD 任务，选择 PRD Agent，运行 PRD Workflow，最终生成 PRD 草稿和评审结论。

### 13.3 运营活动策划

用户创建运营活动任务，选择 Ops Planning Agent，运行运营活动 Workflow，沉淀活动方案。

### 13.4 竞品分析

用户创建竞品分析任务，运行竞品分析 Workflow，生成结论和后续建议。

### 13.5 技术方案评审

用户创建技术评审任务，选择 Tech Review Agent 或 Review Agent，生成评审结论。

### 13.6 开发前准备

用户创建开发任务，选择 Code Agent 或 CLI Agent，运行 Pre-work Workflow，生成开发前上下文和 handoff。

## 14. 外部 AI 扩展方向

### REST API + ChatGPT Action

目标：让 ChatGPT 可以通过受控 API 管理 AI Work Hub。

能力：

- 创建任务。
- 查询任务。
- 创建 Agent。
- 创建 Workflow。
- 回填 Run。
- 获取 Handoff。

### MCP Server

目标：让支持 MCP 的 AI 工具通过 tools 调用 AI Work Hub。

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

1. 通过 UI 创建 Workspace / Project。
2. 通过 UI 创建多个任务。
3. 通过 UI 创建多个 Agent。
4. 通过 UI 创建多个 Workflow。
5. 创建任务时选择 Primary Agent。
6. 一个任务默认由 Primary Agent 推进。
7. Supporting Agent 可被临时调用。
8. 一个 Agent 可被多个任务复用。
9. 一个 Workflow 可被多个任务复用。
10. 通过 UI 运行 Workflow。
11. Manual Agent Step 可以生成 prompt 并等待用户回填结果。
12. 用户回填结果后 Workflow 可继续。
13. 系统保存 Run 记录。
14. 系统生成 Handoff / 任务结论。
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

控制：

- UI 只做操作台。
- Workflow 只做线性步骤。
- 不做 DAG。
- 不做自动多 Agent 编排。

### 风险 2：误做成开发者工具

控制：

- 默认信息架构不围绕 Git、Diff、CLI。
- 产品/运营任务作为默认场景。
- 开发能力放到高级场景。

### 风险 3：过早绑定工具

控制：

- 只定义 Agent / Adapter 协议。
- 具体工具通过配置接入。

### 风险 4：任务内频繁切换 Agent 造成效率下降

控制：

- 引入 Primary Agent。
- Supporting Agent 只在必要场景调用。

### 风险 5：Token 成本增加

控制：

- 引入 Context Mode。
- 默认不传全量历史。
- 优先传摘要、任务目标、关键结论。

## 18. 下一步

BRD 更新后，需要同步调整 PRD。

PRD 应重点围绕产品/运营场景展开：

- Workspace / Project。
- Task 类型。
- Agent 模板。
- Workflow 模板。
- Run 和 Handoff。
- 产品/运营默认 UI。
- 开发者能力作为扩展。
