# AI Dev Hub Handoff

## 当前状态

任务资料已完成“工程执行级方案补充”，目录位于：

```text
tasks/ai-dev-hub/
```

本阶段补齐了后续实现必须依赖的 4 份文档：

- `data-model.md`
- `cli-spec.md`
- `workspace-spec.md`
- `adapter-runtime.md`

方案当前已从产品概念进入工程可执行阶段。

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
- 更新 README，使接手路径更清晰。

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
10. 数据库保存结构化状态，`.ai/` 保存 AI 可读上下文。

## 当前推荐 MVP 闭环

```text
创建项目 → 初始化 .ai 工作区 → 注册 Agent → 创建任务 → 声明能力 → 生成上下文 → 选择执行器 → 执行并记录日志 → 读取 git diff → 生成 handoff → 下一个执行器接力
```

第一批命令：

```bash
aihub init
aihub project add
aihub agent add
aihub agent list
aihub agent test
aihub task create
aihub task list
aihub task show
aihub context
aihub run --capability code_edit
aihub run --agent <agent_id>
aihub handoff
aihub review
aihub done
```

## 新增文档摘要

### `data-model.md`

定义了：

- projects
- tasks
- capabilities
- task_capabilities
- agents
- agent_capabilities
- agent_runs
- task_events
- handoffs
- preferences

结论：SQLite 起步，长文本日志落文件，数据库存索引和摘要。

### `cli-spec.md`

定义了 CLI 命令、参数、行为和退出码。

重点：

- `run` 可以按 `--capability` 执行。
- `run` 也可以按 `--agent` 指定执行器。
- 不自动 push / merge / deploy。

### `workspace-spec.md`

定义了项目 `.ai/` 结构。

重点：

```text
.ai/PROJECT.md
.ai/RULES.md
.ai/COMMANDS.md
.ai/AGENTS.yaml
.ai/TASKS/
.ai/RUNS/
.ai/HANDOFF.md
.ai/DECISIONS.md
```

### `adapter-runtime.md`

定义了 Adapter Runtime 的执行流程。

重点：

- 标准 AgentRunInput。
- 标准 AgentRunResult。
- CLI Adapter。
- HTTP Adapter。
- Manual Adapter。
- Capability Router。
- Run Store。
- 安全检查。

## 下一步建议

进入实现前，建议先做一次方案评审：

1. 是否还存在单一工具绑定表达。
2. MVP 是否过大。
3. Generic CLI Adapter 和 Manual Adapter 是否足够作为第一版。
4. SQLite + `.ai/` 双存储是否合适。
5. 是否需要先做 CLI，暂缓 Web UI。

如果进入实现阶段，建议第一批实现：

```text
packages/cli
  src/index.ts
  src/commands/init.ts
  src/commands/project.ts
  src/commands/agent.ts
  src/commands/task.ts
  src/commands/context.ts
  src/commands/run.ts
  src/commands/handoff.ts
  src/commands/review.ts
  src/adapters/types.ts
  src/adapters/registry.ts
  src/adapters/cli-adapter.ts
  src/adapters/manual-adapter.ts
  src/services/capability-router.ts
  src/services/context-builder.ts
  src/services/run-store.ts
  src/services/git-service.ts
```

## 给下一个 AI 工具的接力提示

```text
请先阅读 tasks/ai-dev-hub/README.md、solution-overview.md、capability-model.md、agent-adapter-spec.md、data-model.md、cli-spec.md、workspace-spec.md、adapter-runtime.md、mvp-requirements.md、architecture.md、implementation-plan.md、decisions.md、handoff.md。

当前方案已进入工程可执行阶段。你的任务是先做方案评审，再决定是否开始 CLI 原型实现。

请不要把 Cursor CLI、Codex CLI、Claude Code 或任何单一工具写死为第一版绑定对象。系统应该定义能力和 Adapter 机制，具体工具通过配置接入。

如开始实现，优先实现 Generic CLI Adapter 和 Manual Adapter，不要实现完整 Web UI，不要自动 push / merge / deploy。
```

## 风险提醒

- 如果涉及公司代码，必须确认公司是否允许代码部署到个人服务器。
- Web UI 不应直接裸露公网。
- 不要用 root 运行 AI 执行器。
- 不要自动 push main、merge 或 deploy。
- 密钥不能进入 Git 仓库。
- 执行日志可能包含代码和敏感路径，不能随意公开。
