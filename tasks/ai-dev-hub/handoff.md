# AI Dev Hub Handoff

## 当前状态

任务资料已完成“V0 范围收敛 + Agent 预设能力补充”，目录位于：

```text
tasks/ai-dev-hub/
```

本阶段确认：AI Dev Hub 应支持用户手动创建常用 Agent，例如评审 Agent、架构评审 Agent、安全评审 Agent、Handoff Agent。该能力属于 V0 合理范围，不属于复杂自动编排。

## 已完成

- 明确产品方向：AI 开发任务中台，而不是自研完整 IDE。
- 明确部署位置：私有服务器优先，可使用腾讯云服务器。
- 明确多电脑场景：公司电脑和个人电脑访问同一个远程 AI 开发现场。
- 明确不绑定任何单一 AI 工具。
- 明确 MVP 范围：任务、上下文、Agent 注册、能力路由、执行日志、handoff、review。
- 新增能力模型：`capability-model.md`。
- 新增 Agent Adapter 规范：`agent-adapter-spec.md`。
- 新增数据模型：`data-model.md`。
- 新增 CLI 命令规格：`cli-spec.md`。
- 新增 `.ai/` 工作区规范：`workspace-spec.md`。
- 新增 Adapter Runtime 设计：`adapter-runtime.md`。
- 新增评审记录：`review-2026-05-28.md`。
- 新增 Agent 预设方案：`agent-presets.md`。
- 新增 V0 范围：`v0-scope.md`。

## 当前关键结论

1. 不要从自研 IDE 开始。
2. 先做 AI Dev Hub，即 AI 开发任务中台。
3. 不绑定任何单一 AI 工具。
4. 任务声明所需能力，Agent 声明可提供能力。
5. 具体工具通过 Adapter 接入。
6. V0 必须支持 Manual Agent 和 Generic CLI Agent。
7. 用户可以手动创建常用 Agent，用的时候直接调用。
8. 评审 Agent 是 V0 应支持的典型用例。
9. 部署在私有服务器，作为远程 AI 工作站。
10. 数据库保存结构化状态，`.ai/` 保存 AI 可读上下文；V0 可先以 `.ai/` 文件系统为主。

## 当前推荐 V0 闭环

```text
初始化项目 → 创建/配置 Agent → 创建任务 → 生成上下文 → 调用 Agent → 保存结果 → 生成 Handoff
```

第一批命令：

```bash
aihub init
aihub agent add
aihub agent list
aihub agent show <agent_id>
aihub agent test <agent_id>
aihub task create
aihub task show <task_id>
aihub context --task <task_id>
aihub run --agent <agent_id> --task <task_id>
aihub run --capability <capability> --task <task_id>
aihub run complete <run_id>
aihub handoff --task <task_id>
```

## V0 推荐内置 Agent 模板

```text
review-basic
security-review
architecture-review
handoff-summary
```

这些模板只是 prompt 模板，不绑定具体 AI 工具。

## 下一步建议

可以进入 V0 CLI 原型实现。

建议第一批实现：

```text
packages/cli
  src/index.ts
  src/commands/init.ts
  src/commands/agent.ts
  src/commands/task.ts
  src/commands/context.ts
  src/commands/run.ts
  src/commands/handoff.ts
  src/adapters/types.ts
  src/adapters/manual-adapter.ts
  src/adapters/cli-adapter.ts
  src/services/context-builder.ts
  src/services/run-store.ts
  src/services/template-service.ts
```

实现顺序：

1. `.ai/` 初始化。
2. Agent 配置文件读写。
3. 内置 Agent 模板。
4. Task 文件创建。
5. Context 生成。
6. Manual Adapter。
7. `run complete`。
8. Generic CLI Adapter。
9. Handoff 生成。

## 给下一个 AI 工具的接力提示

```text
请先阅读 tasks/ai-dev-hub/README.md、v0-scope.md、agent-presets.md、capability-model.md、agent-adapter-spec.md、workspace-spec.md、adapter-runtime.md、cli-spec.md、handoff.md。

当前任务可以进入 V0 CLI 原型实现。请不要实现 Web UI、HTTP Adapter、多用户权限、成本统计、自动部署或复杂 Agent 编排。

V0 的核心是：用户可以手动创建常用 Agent，例如 Review Agent；调用时生成 prompt 或执行通用 CLI；结果保存为 run；最后生成 handoff。

请不要把 Cursor CLI、Codex CLI、Claude Code 或任何单一工具写死为第一版绑定对象。系统应该定义能力和 Adapter 机制，具体工具通过配置接入。
```

## 风险提醒

- 如果涉及公司代码，必须确认公司是否允许代码部署到个人服务器。
- Web UI 不应直接裸露公网。
- 不要用 root 运行 AI 执行器。
- 不要自动 push main、merge 或 deploy。
- 密钥不能进入 Git 仓库。
- 执行日志可能包含代码和敏感路径，不能随意公开。
