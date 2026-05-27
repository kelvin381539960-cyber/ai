# AI Dev Hub Handoff

## 当前状态

任务资料已进入“方案完善阶段”，目录位于：

```text
tasks/ai-dev-hub/
```

本阶段新增了更完整的产品与落地方案文档，用于后续 Cursor CLI / Codex CLI / Claude Code 接力。

## 已完成

- 明确产品方向：AI 开发任务中台，而不是自研完整 IDE。
- 明确部署位置：腾讯云服务器优先。
- 明确第一执行器：Cursor CLI。
- 明确多电脑场景：公司电脑和个人电脑访问同一个远程 AI 开发现场。
- 明确 MVP 范围：任务、上下文、执行、日志、handoff、review。
- 创建任务资料目录。
- 新增方案总览：`solution-overview.md`。
- 新增 MVP 需求清单：`mvp-requirements.md`。
- 新增用户流程：`user-flows.md`。
- 新增 UI 页面方案：`screen-spec.md`。
- 新增安全与部署方案：`security-and-deployment.md`。

## 当前关键结论

1. 不要从自研 IDE 开始。
2. 先做 AI Dev Hub，即 AI 开发任务中台。
3. 第一版只接 Cursor CLI。
4. 部署在腾讯云服务器，作为远程 AI 工作站。
5. 公司电脑和个人电脑只作为访问终端。
6. 通过任务文档、`.ai/` 工作区、执行日志和 handoff 解决工具接力问题。
7. 后续再扩展 Codex CLI、Claude Code、公司 API。

## 当前推荐 MVP

MVP 闭环：

```text
创建任务 → 生成上下文 → 调用 Cursor CLI → 记录执行 → 读取 git diff → 生成 handoff → 支持下一个工具接力
```

第一批命令：

```bash
aihub init
aihub project add
aihub task create
aihub context
aihub run --agent cursor
aihub handoff
aihub review
aihub done
```

## 下一步建议

继续完善方案时，建议优先补充：

1. 数据模型设计。
2. CLI 命令详细规格。
3. Cursor CLI Adapter 设计。
4. `.ai/` 项目工作区文件规范。
5. 第一版技术选型确认。

如果进入实现阶段，建议让 Cursor CLI 接手：

1. 阅读本目录全部文档。
2. 根据 `mvp-requirements.md` 和 `implementation-plan.md` 设计 CLI 原型目录结构。
3. 选择 TypeScript + Node.js。
4. 实现最小 CLI 骨架。
5. 暂不做 Web UI。
6. 暂不接入 Codex / Claude。
7. 暂不自动 push / deploy。

## 给下一个 AI 工具的接力提示

```text
请先阅读 tasks/ai-dev-hub/README.md、solution-overview.md、mvp-requirements.md、user-flows.md、screen-spec.md、security-and-deployment.md、architecture.md、implementation-plan.md、decisions.md、handoff.md。

当前任务还处在方案完善阶段。你的任务不是写代码，而是继续完善数据模型、CLI 命令规格、Cursor CLI Adapter 设计和 .ai 工作区规范。

请不要重新讨论是否要做 IDE；该决策已确定为不做完整 IDE，而是先做 AI 开发任务中台。
```

## 风险提醒

- 如果涉及公司代码，必须确认公司是否允许代码部署到个人腾讯云服务器。
- Web UI 不应直接裸露公网。
- 不要用 root 运行 AI 执行器。
- 不要自动 push main、merge 或 deploy。
- 密钥不能进入 Git 仓库。
- 执行日志可能包含代码和敏感路径，不能随意公开。
