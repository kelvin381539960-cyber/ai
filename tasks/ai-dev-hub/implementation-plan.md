# AI Dev Hub 实现计划

## 阶段 0：任务资料初始化与方案纠偏

目标：在 `kelvin381539960-cyber/ai` 仓库中建立任务资料目录，并将方案从“绑定某个工具”纠偏为“能力驱动 + Adapter 扩展架构”。

产出：

- `README.md`
- `solution-overview.md`
- `capability-model.md`
- `agent-adapter-spec.md`
- `product-spec.md`
- `architecture.md`
- `implementation-plan.md`
- `handoff.md`
- `decisions.md`
- `prompts.md`

验收：

- 任务目录存在。
- 文档不再把任意工具写死为唯一执行器。
- 后续工具能根据文档理解任务目标、范围、架构和下一步。

## 阶段 1：本地 CLI 原型

目标：先不做 UI，验证任务工作流和 Adapter 扩展机制。

命令设计：

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

功能：

1. 初始化 `.ai/` 目录。
2. 创建任务文件。
3. 注册 Agent / Adapter。
4. 声明 Agent 能力。
5. 生成上下文 prompt。
6. 通过 Generic CLI Adapter 或 Manual Adapter 执行。
7. 保存执行日志。
8. 读取 git diff。
9. 生成 handoff。

验收：

- 可在一个测试项目中完成从建任务到生成 handoff 的完整流程。
- 至少支持 Generic CLI Adapter。
- 至少支持 Manual Adapter。
- 不需要为某个具体工具写特殊逻辑即可接入一个 CLI 工具。

## 阶段 2：私有服务器部署

目标：让公司电脑和个人电脑都能访问同一个 AI 开发现场。

部署内容：

- AI Dev Hub CLI。
- 项目工作区。
- Adapter 配置。
- SQLite 数据库。
- 日志目录。

建议目录：

```text
/opt/ai-dev-hub/
/srv/ai-workspaces/
/srv/ai-data/
/srv/ai-secrets/
```

验收：

- 公司电脑通过 SSH 或安全隧道可使用。
- 个人电脑通过 SSH 或安全隧道可使用。
- 两台电脑看到同一个任务状态。
- 任意已注册 Agent 可以被调用或生成手动 prompt。

## 阶段 3：本地 Web UI

目标：减少命令行使用成本。

页面：

1. 项目列表。
2. 任务列表。
3. Agent / Adapter 列表。
4. 当前任务详情。
5. 能力选择面板。
6. 执行日志面板。
7. Git diff 面板。
8. Handoff 面板。

验收：

- 可以在页面创建任务。
- 可以在页面注册 Agent。
- 可以在页面选择能力或执行器。
- 可以查看日志和 diff。
- 可以生成 handoff。

## 阶段 4：Adapter 稳定化

目标：把执行器接入从临时 shell 调用变成稳定能力。

能力：

- 传入标准 `AgentRunInput`。
- 指定工作目录。
- 捕获 stdout/stderr。
- 超时控制。
- 错误记录。
- 运行前后读取 git 状态。
- 支持 CLI / HTTP / Manual 三类 Adapter。

验收：

- 失败可复盘。
- 中断可继续。
- 不会丢失执行日志。
- 新增一个 CLI 工具只需要配置，不需要改核心代码。

## 阶段 5：Review 与交接能力

目标：让工具接力变得稳定。

功能：

- 基于 git diff 生成 review prompt。
- 基于执行日志生成 handoff。
- 生成给下一个工具的接力 prompt。
- 根据所需能力推荐 review / architecture_review / summarize 类型 Agent。

验收：

- 一个执行器完成初步改动后，另一个执行器能根据 handoff 继续。
- 用户不需要重新解释项目背景。

## 阶段 6：记忆系统

目标：让系统逐步理解用户偏好。

记忆类型：

- 用户偏好。
- 项目规则。
- 技术决策。
- 工具效果记录。
- 能力路由效果记录。

原则：

- 可查看。
- 可编辑。
- 可删除。
- 重要记忆需要用户确认。

验收：

- 系统能生成更符合用户习惯的 prompt。
- 用户能管理记忆内容。

## 阶段 7：多工具扩展

目标：从通用 Adapter 扩展到更多具体工具。

可选 Adapter：

- Codex CLI Adapter。
- Claude Code Adapter。
- Cursor CLI Adapter。
- 公司 API Adapter。
- 本地脚本 Adapter。

注意：

这些都属于扩展，不是核心系统的硬编码前提。

## 推荐当前下一步

下一步继续完善方案，不急着写业务代码。

最该补的文档：

```text
data-model.md
cli-spec.md
workspace-spec.md
adapter-runtime.md
```

第一版代码目标：

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
  src/adapters/registry.ts
  src/adapters/cli-adapter.ts
  src/adapters/manual-adapter.ts
  src/services/capability-router.ts
```

第一版可以只支持一个项目、一个当前任务，不需要多用户和复杂数据库。
