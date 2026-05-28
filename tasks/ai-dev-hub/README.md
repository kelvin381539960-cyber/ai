# AI Dev Hub 任务工作区

## 任务一句话

建设一个部署在私有环境中的 AI 开发任务中台，用来统一管理不同 AI 编程工具的任务、上下文、执行记录、交接文档、能力路由、Agent 预设和固定 Workflow。

## 核心原则

本方案不绑定任何单一 AI 工具。

正确产品抽象是：

```text
AI Dev Hub 定义任务、上下文、能力、Agent、Workflow、交接和执行协议。
具体工具通过 Adapter 接入。
```

因此，Cursor CLI、Codex CLI、Claude Code、公司 API、本地脚本、云端模型 API 都只是可接入的执行器，不是系统架构的硬编码前提。

## 背景

当前存在多个 AI 开发工具和额度来源。问题不是额度不够，而是工具之间上下文、任务进度、能力边界、执行记录和固定流程不统一，导致切换工具时容易重复解释、重复分析、重复执行。

本任务的目标是沉淀一套可扩展的 AI 开发任务中台方案，后续可以由任意 AI 工具接力实现。

## 部署设想

- 推荐部署位置：腾讯云服务器或其他私有服务器。
- 使用入口：公司电脑 / 个人电脑通过浏览器、SSH、VPN 或安全隧道访问。
- V0 必须有轻量 UI。
- 执行器接入方式：Adapter 插件机制。
- 可接入执行器：CLI 工具、模型 API、脚本、远程服务、手动复制 prompt 的外部工具。
- 代码与任务状态：统一保存在服务器工作区和项目 `.ai/` 工作区中。

## 产品定位

这不是一个新的 IDE，而是一个 AI 开发任务中台。

它负责：

- 管理任务。
- 管理 Agent。
- 管理 Workflow。
- 管理上下文。
- 管理工具能力。
- 管理执行器接入。
- 管理执行记录。
- 管理交接信息。
- 管理成本和额度感知。

## V0 范围

V0 做轻量 UI + 最小闭环：

1. 项目初始化。
2. 创建任务。
3. 创建 Agent。
4. 创建 Workflow。
5. 生成标准上下文。
6. 调用 Manual Agent 或 Generic CLI Agent。
7. 保存执行日志。
8. Workflow Step 支持等待用户输入。
9. 生成 handoff 交接文档。
10. 归档任务状态。

V0 不做：

- 不做完整 IDE。
- 不做复杂多用户协作。
- 不做插件市场。
- 不做公网 SaaS。
- 不做复杂 DAG Workflow。
- 不做多 Agent 自动智能编排。
- 不做无确认自动发布。
- 不把某个 AI 工具写死为唯一执行器。

## 当前状态

- 状态：V0 方案更新为轻量 UI + Workflow。
- 当前负责人：ChatGPT。
- 后续执行工具：任意符合 Adapter 协议的工具。
- 下一步：更新 BRD/PRD，确认 V0 产品范围后进入技术方案。

## 目录说明

- `README.md`：任务总览。
- `solution-overview.md`：方案总览。
- `capability-model.md`：能力模型。
- `agent-adapter-spec.md`：执行器 Adapter 规范。
- `agent-presets.md`：Agent 预设方案。
- `workflow-spec.md`：Workflow 方案。
- `v0-scope.md`：V0 范围。
- `data-model.md`：数据模型。
- `cli-spec.md`：CLI 命令规格。
- `workspace-spec.md`：`.ai/` 工作区规范。
- `adapter-runtime.md`：Adapter Runtime 设计。
- `product-spec.md`：产品需求说明。
- `mvp-requirements.md`：MVP 需求清单。
- `architecture.md`：技术架构设想。
- `implementation-plan.md`：分阶段实现计划。
- `user-flows.md`：用户流程。
- `screen-spec.md`：UI 页面方案。
- `security-and-deployment.md`：安全与部署方案。
- `handoff.md`：给下一个 AI 工具的交接说明。
- `decisions.md`：关键决策记录。
- `prompts.md`：可复制给不同 AI 工具的提示词。

## 后续接力建议

接手工具应先阅读：

```text
tasks/ai-dev-hub/README.md
tasks/ai-dev-hub/v0-scope.md
tasks/ai-dev-hub/agent-presets.md
tasks/ai-dev-hub/workflow-spec.md
tasks/ai-dev-hub/screen-spec.md
tasks/ai-dev-hub/handoff.md
```

优先任务：

1. 更新 BRD。
2. 输出 PRD。
3. 输出技术方案。
4. 进入 V0 实现。
