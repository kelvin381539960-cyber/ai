# AI Dev Hub V0 范围

## 1. V0 目标

V0 不再是纯 CLI，而是一个轻量 UI + 最小执行闭环。

核心闭环：

```text
初始化项目 → 创建 Agent → 创建 Workflow → 创建任务 → 运行 Workflow/Agent → 保存结果 → 生成 Handoff
```

V0 目标不是做复杂平台，而是让用户能通过 UI 管理常用 Agent 和固定工作流。

## 2. V0 核心原则

1. 不做 IDE。
2. 要有轻量 UI。
3. 不绑定具体 AI 工具。
4. 支持用户手动创建 Agent。
5. 支持用户创建简单 Workflow。
6. Workflow 只做线性步骤，不做复杂 DAG。
7. 不做多 Agent 自动智能编排。
8. 不自动 push / merge / deploy。
9. 优先支持 Manual Agent 和 Generic CLI Agent。

## 3. V0 必须支持的 UI

V0 UI 是任务操作台，不是代码编辑器。

必须支持页面：

```text
项目页
Agent 管理页
Workflow 管理页
任务页
Run 记录页
Handoff 页
```

## 4. V0 必须支持的 Agent 能力

### 4.1 Manual Agent

用户可以创建一个手动 Agent，例如：

- Review Agent。
- Architecture Review Agent。
- Security Review Agent。
- Handoff Agent。
- Research Agent。

调用时：

1. 系统生成 prompt。
2. UI 展示 prompt。
3. 用户复制到外部 AI 工具。
4. 用户把结果粘贴回 UI。
5. 系统保存 run。

### 4.2 Generic CLI Agent

用户可以配置一个命令行 Agent。

调用时：

1. 系统生成 prompt。
2. 通过 stdin 或文件传给 CLI。
3. 捕获输出。
4. 保存 run。
5. UI 展示执行结果。

## 5. V0 必须支持的 Workflow 能力

Workflow 是一组固定步骤。

V0 只支持线性 Workflow：

```text
Step 1 → Step 2 → Step 3
```

每个 Step 可以是：

```text
agent_run       调用某个 Agent
manual_input    用户填写信息
context_build   生成上下文
handoff_build   生成 Handoff
review_prompt   生成评审 prompt
```

## 6. V0 推荐内置 Workflow 模板

### 6.1 Pre-work Workflow

用途：正式开发前准备。

步骤：

1. 读取项目背景。
2. 创建/确认任务目标。
3. 拆解范围和非目标。
4. 生成执行上下文。
5. 生成开发前 handoff。

### 6.2 Research Workflow

用途：调研类任务。

步骤：

1. 用户输入调研问题。
2. Research Agent 生成调研计划。
3. 用户补充信息或粘贴外部结果。
4. Summary Agent 总结结论。
5. 生成 research handoff。

### 6.3 Review Workflow

用途：代码评审。

步骤：

1. 读取当前 task。
2. 读取 git diff。
3. 调用 Review Agent。
4. 用户回填评审结果。
5. 生成 review handoff。

## 7. V0 必须支持的命令

即使有 UI，CLI 也保留为底层能力。

```bash
aihub init
aihub ui
aihub agent add
aihub agent list
aihub workflow create
aihub workflow list
aihub workflow run <workflow_id> --task <task_id>
aihub task create
aihub task show <task_id>
aihub run --agent <agent_id> --task <task_id>
aihub run --capability <capability> --task <task_id>
aihub run complete <run_id>
aihub handoff --task <task_id>
```

## 8. V0 UI 必须支持的操作

### 8.1 Agent

- 创建 Agent。
- 查看 Agent。
- 启用/禁用 Agent。
- 选择 Agent 模板。
- 测试 Agent。

### 8.2 Workflow

- 创建 Workflow。
- 查看 Workflow。
- 编辑 Workflow 步骤。
- 从模板创建 Workflow。
- 运行 Workflow。
- 查看 Workflow 执行记录。

### 8.3 Task

- 创建任务。
- 查看任务。
- 选择任务要运行的 Agent 或 Workflow。
- 查看任务关联的 Run。
- 查看任务 Handoff。

### 8.4 Run

- 查看 prompt。
- 复制 prompt。
- 粘贴外部 AI 输出。
- 查看 CLI 输出。
- 标记 run 完成。

## 9. V0 推荐内置 Agent 模板

```text
review-basic
security-review
architecture-review
research-basic
handoff-summary
```

这些模板只是 prompt 模板，不绑定具体 AI 工具。

## 10. V0 不做

```text
完整 IDE
在线代码编辑器
HTTP Adapter
多用户权限
成本统计
偏好记忆
Agent 市场
复杂 DAG Workflow
多 Agent 自动智能编排
多 Agent 并行评审
自动 commit
自动 push
自动 merge
自动 deploy
```

## 11. V0 数据存储

V0 可以简化：

- `.ai/` 文件系统作为 AI 可读状态。
- SQLite 用于 UI 查询和结构化状态。
- 如果实现成本高，先以文件系统为准，SQLite 做索引。

最低要求：

```text
.ai/AGENTS.yaml
.ai/WORKFLOWS.yaml
.ai/TASKS/<task_id>.md
.ai/RUNS/<run_id>/
.ai/HANDOFF.md
```

## 12. V0 成功标准

V0 完成后必须能演示：

1. 通过 UI 初始化/选择一个项目。
2. 通过 UI 创建一个 Review Agent。
3. 通过 UI 创建一个 Pre-work Workflow。
4. 通过 UI 创建一个任务。
5. 通过 UI 运行 Pre-work Workflow。
6. UI 展示生成的 prompt。
7. 用户复制 prompt 到外部 AI 工具。
8. 用户把结果粘贴回 UI。
9. 系统保存 run 到 `.ai/RUNS/`。
10. 系统生成 handoff。
11. 另一个 Agent 或 Workflow 可以基于 handoff 接手。

额外演示：

1. 创建一个 Generic CLI Agent。
2. 在 UI 中运行该 Agent。
3. 捕获 stdout/stderr。
4. UI 展示 run result。

## 13. 进入 V1 的条件

只有当 V0 跑通后，才进入 V1。

V1 可以考虑：

- HTTP Adapter。
- 更完整 Workflow 条件分支。
- Agent 使用统计。
- 成本统计。
- 更完整权限控制。
- Web UI 触发更多自动化能力。

## 14. V0 实现判断

V0 的重点不是智能程度，而是可复用工作流：

```text
常用 Agent 可以保存
常用 Workflow 可以保存
需要时可以在 UI 直接调用
结果可以进入 run 记录
后续工具可以接力
```
