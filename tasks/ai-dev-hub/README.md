# AI Dev Hub 任务工作区

## 任务一句话

建设一个部署在腾讯云服务器上的 AI 开发任务中台，用来统一管理 Cursor CLI、后续 Codex CLI / Claude Code 等工具的任务、上下文、执行记录、交接文档和成本记录。

## 背景

当前存在多个 AI 开发工具和额度来源：Cursor、Codex、Claude Code、公司 API 等。问题不是额度不够，而是工具之间上下文、任务进度和执行记录不统一，导致切换工具时容易重复解释、重复分析、重复执行。

本任务的目标是先在 `kelvin381539960-cyber/ai` 仓库中沉淀一套可接力执行的任务资料，后续可由 Cursor CLI、Codex CLI、Claude Code 或其他工具继续实现。

## 部署设想

- 主部署位置：腾讯云服务器。
- 使用入口：公司电脑 / 个人电脑通过浏览器、SSH、VPN 或安全隧道访问。
- 第一阶段执行器：Cursor CLI。
- 后续扩展执行器：Codex CLI、Claude Code、公司 API。
- 代码与任务状态：统一保存在服务器工作区和本仓库文档中。

## 产品定位

这不是一个新的 IDE，而是一个 AI 开发任务中台。

它负责：

- 管理任务。
- 管理上下文。
- 管理工具切换。
- 管理执行记录。
- 管理交接信息。
- 管理成本和额度感知。

## MVP 范围

第一版只做：

1. 项目初始化。
2. 创建任务。
3. 生成标准上下文。
4. 调用 Cursor CLI 执行。
5. 保存执行日志。
6. 读取 git diff。
7. 生成 handoff 交接文档。
8. 生成 review prompt。
9. 归档任务。

第一版不做：

- 不做完整 IDE。
- 不做复杂多用户协作。
- 不做插件市场。
- 不做云端公网 SaaS。
- 不做无确认自动发布。
- 不一开始接入所有 AI 工具。

## 当前状态

- 状态：任务资料初始化。
- 当前负责人：ChatGPT。
- 后续执行工具：Cursor CLI 优先。
- 下一步：根据 `implementation-plan.md` 进入技术设计和项目骨架实现。

## 目录说明

- `README.md`：任务总览。
- `product-spec.md`：产品需求说明。
- `architecture.md`：技术架构设想。
- `implementation-plan.md`：分阶段实现计划。
- `handoff.md`：给下一个 AI 工具的交接说明。
- `decisions.md`：关键决策记录。
- `prompts.md`：可复制给 Cursor / Codex / Claude 的提示词。
