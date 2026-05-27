# AI Dev Hub 实现计划

## 阶段 0：任务资料初始化

目标：在 `kelvin381539960-cyber/ai` 仓库中建立任务资料目录，方便后续 Cursor CLI / Codex CLI / Claude Code 接力。

产出：

- `README.md`
- `product-spec.md`
- `architecture.md`
- `implementation-plan.md`
- `handoff.md`
- `decisions.md`
- `prompts.md`

验收：

- 任务目录存在。
- 后续工具能根据文档理解任务目标、范围、架构和下一步。

## 阶段 1：本地 CLI 原型

目标：先不做 UI，验证任务工作流。

命令设计：

```bash
aihub init
aihub task "实现 xxx"
aihub context
aihub run --agent cursor
aihub handoff
aihub review
aihub done
```

功能：

1. 初始化 `.ai/` 目录。
2. 创建任务文件。
3. 生成上下文 prompt。
4. 调用 Cursor CLI。
5. 保存执行日志。
6. 读取 git diff。
7. 生成 handoff。

验收：

- 可在一个测试项目中完成从建任务到生成 handoff 的完整流程。

## 阶段 2：腾讯云部署

目标：让公司电脑和个人电脑都能访问同一个 AI 开发现场。

部署内容：

- AI Dev Hub CLI。
- Cursor CLI。
- 项目工作区。
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

## 阶段 3：本地 Web UI

目标：减少命令行使用成本。

页面：

1. 项目列表。
2. 任务列表。
3. 当前任务详情。
4. Agent 执行面板。
5. 日志面板。
6. Git diff 面板。
7. Handoff 面板。

验收：

- 可以在页面创建任务。
- 可以在页面触发 Cursor CLI 执行。
- 可以查看日志和 diff。
- 可以生成 handoff。

## 阶段 4：Cursor CLI Adapter 完善

目标：把 Cursor CLI 从简单 shell 调用变成稳定执行器。

能力：

- 传入标准 prompt。
- 指定工作目录。
- 捕获 stdout/stderr。
- 超时控制。
- 错误记录。
- 运行前后读取 git 状态。

验收：

- 失败可复盘。
- 中断可继续。
- 不会丢失执行日志。

## 阶段 5：Review 与交接能力

目标：让工具接力变得稳定。

功能：

- 基于 git diff 生成 review prompt。
- 基于执行日志生成 handoff。
- 生成给下一个工具的接力 prompt。

验收：

- Cursor CLI 执行后，Codex / Claude 能根据 handoff 继续。
- 用户不需要重新解释项目背景。

## 阶段 6：记忆系统

目标：让系统逐步理解用户偏好。

记忆类型：

- 用户偏好。
- 项目规则。
- 技术决策。
- 工具效果记录。

原则：

- 可查看。
- 可编辑。
- 可删除。
- 重要记忆需要用户确认。

验收：

- 系统能生成更符合用户习惯的 prompt。
- 用户能管理记忆内容。

## 阶段 7：多工具扩展

目标：从 Cursor CLI 扩展到更多工具。

Adapter：

- Codex CLI。
- Claude Code。
- 公司 API。

路由策略：

- 写代码：Cursor CLI。
- 深度分析：Claude Code。
- Review：Codex。
- 总结/归档：API。

验收：

- 同一个任务可以被不同工具接力。
- 每次切换都基于统一上下文和 handoff。

## 推荐当前下一步

下一步先实现阶段 1：CLI 原型。

最小代码目标：

```text
packages/cli
  src/index.ts
  src/commands/init.ts
  src/commands/task.ts
  src/commands/context.ts
  src/commands/handoff.ts
  src/adapters/cursor-cli.ts
```

第一版可以只支持一个项目、一个当前任务，不需要多用户和复杂数据库。
