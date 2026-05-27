# AI Dev Hub Handoff

## 当前状态

任务资料已进入“方案纠偏和扩展性增强阶段”，目录位于：

```text
tasks/ai-dev-hub/
```

本阶段对方案做了关键调整：不再把 Cursor CLI 或任何单一工具写死为第一版绑定对象，而是改为“能力驱动 + Agent Adapter 扩展架构”。

## 已完成

- 明确产品方向：AI 开发任务中台，而不是自研完整 IDE。
- 明确部署位置：私有服务器优先，可使用腾讯云服务器。
- 明确多电脑场景：公司电脑和个人电脑访问同一个远程 AI 开发现场。
- 明确 MVP 范围：任务、上下文、Agent 注册、能力路由、执行日志、handoff、review。
- 创建任务资料目录。
- 新增方案总览：`solution-overview.md`。
- 新增 MVP 需求清单：`mvp-requirements.md`。
- 新增用户流程：`user-flows.md`。
- 新增 UI 页面方案：`screen-spec.md`。
- 新增安全与部署方案：`security-and-deployment.md`。
- 新增能力模型：`capability-model.md`。
- 新增 Agent Adapter 规范：`agent-adapter-spec.md`。
- 更新架构、实现计划、决策记录，移除单一工具绑定表达。

## 当前关键结论

1. 不要从自研 IDE 开始。
2. 先做 AI Dev Hub，即 AI 开发任务中台。
3. 不绑定任何单一 AI 工具。
4. 任务声明所需能力，Agent 声明可提供能力。
5. 具体工具通过 Adapter 接入。
6. MVP 至少支持 Generic CLI Adapter 和 Manual Adapter。
7. 部署在私有服务器，作为远程 AI 工作站。
8. 公司电脑和个人电脑只作为访问终端。
9. 通过任务文档、`.ai/` 工作区、执行日志和 handoff 解决工具接力问题。

## 当前推荐 MVP

MVP 闭环：

```text
创建任务 → 声明所需能力 → 生成上下文 → 选择已配置执行器 → 记录执行 → 读取 git diff → 生成 handoff → 支持下一个执行器接力
```

第一批命令：

```bash
aihub init
aihub project add
aihub agent add
aihub agent list
aihub task create
aihub context
aihub run --capability code_edit
aihub run --agent <agent_id>
aihub handoff
aihub review
aihub done
```

## 下一步建议

继续完善方案时，建议优先补充：

1. 数据模型设计：`data-model.md`。
2. CLI 命令详细规格：`cli-spec.md`。
3. `.ai/` 项目工作区文件规范：`workspace-spec.md`。
4. Adapter Runtime 细节：`adapter-runtime.md`。

如果进入实现阶段，建议让任意 AI 工具接手：

1. 阅读本目录全部文档。
2. 根据 `capability-model.md` 和 `agent-adapter-spec.md` 设计 CLI 原型目录结构。
3. 选择 TypeScript + Node.js。
4. 实现最小 CLI 骨架。
5. 先实现 Generic CLI Adapter 和 Manual Adapter。
6. 暂不做 Web UI。
7. 暂不自动 push / deploy。
8. 暂不把任意具体工具写死进核心流程。

## 给下一个 AI 工具的接力提示

```text
请先阅读 tasks/ai-dev-hub/README.md、solution-overview.md、capability-model.md、agent-adapter-spec.md、mvp-requirements.md、architecture.md、implementation-plan.md、decisions.md、handoff.md。

当前任务还处在方案完善阶段。你的任务不是写代码，而是继续完善数据模型、CLI 命令规格、Adapter Runtime 和 .ai 工作区规范。

请不要重新讨论是否要做 IDE；该决策已确定为不做完整 IDE，而是先做 AI 开发任务中台。

请不要把 Cursor CLI、Codex CLI、Claude Code 或任何单一工具写死为第一版绑定对象。系统应该定义能力和 Adapter 机制，具体工具通过配置接入。
```

## 风险提醒

- 如果涉及公司代码，必须确认公司是否允许代码部署到个人服务器。
- Web UI 不应直接裸露公网。
- 不要用 root 运行 AI 执行器。
- 不要自动 push main、merge 或 deploy。
- 密钥不能进入 Git 仓库。
- 执行日志可能包含代码和敏感路径，不能随意公开。
