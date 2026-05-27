# AI Dev Hub V0 范围

## 1. V0 目标

V0 只验证最小闭环，不做完整平台。

核心闭环：

```text
初始化项目 → 创建/配置 Agent → 创建任务 → 生成上下文 → 调用 Agent → 保存结果 → 生成 Handoff
```

## 2. V0 核心原则

1. 不做 IDE。
2. 不做 Web UI。
3. 不绑定具体 AI 工具。
4. 不做复杂 Agent 编排。
5. 不自动 push / merge / deploy。
6. 优先支持手动 Agent 和通用 CLI Agent。
7. 让用户可以手动创建常用 Agent，用的时候直接调用。

## 3. V0 必须支持的 Agent 能力

### 3.1 Manual Agent

用户可以创建一个手动 Agent，例如：

- Review Agent。
- Architecture Review Agent。
- Security Review Agent。
- Handoff Agent。

调用时：

1. 系统生成 prompt。
2. 用户复制到外部 AI 工具。
3. 用户粘贴结果。
4. 系统保存 run。

### 3.2 Generic CLI Agent

用户可以配置一个命令行 Agent。

调用时：

1. 系统生成 prompt。
2. 通过 stdin 或文件传给 CLI。
3. 捕获输出。
4. 保存 run。

## 4. V0 必须支持的命令

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

## 5. V0 推荐内置 Agent 模板

V0 可以内置模板，但不绑定具体工具。

### 5.1 review-basic

用途：代码评审。

能力：

```text
review
```

### 5.2 security-review

用途：安全评审。

能力：

```text
security_review
```

### 5.3 architecture-review

用途：架构评审。

能力：

```text
architecture_review
```

### 5.4 handoff-summary

用途：交接总结。

能力：

```text
handoff_generate
summarize
```

## 6. V0 不做

```text
Web UI
HTTP Adapter
多用户权限
成本统计
偏好记忆
Agent 市场
多 Agent 自动编排
多 Agent 并行评审
自动 commit
自动 push
自动 merge
自动 deploy
```

## 7. V0 数据存储

V0 可以简化：

- `.ai/` 文件系统作为主要状态。
- SQLite 作为可选增强。
- 如果实现成本高，第一轮可以先不做完整数据库。

最低要求：

```text
.ai/AGENTS.yaml
.ai/TASKS/<task_id>.md
.ai/RUNS/<run_id>/
.ai/HANDOFF.md
```

## 8. V0 成功标准

V0 完成后必须能演示：

1. 初始化 `.ai/` 工作区。
2. 创建一个 Review Manual Agent。
3. 创建一个任务。
4. 生成 review prompt。
5. 用户把 prompt 复制给外部工具。
6. 用户用 `run complete` 粘贴结果。
7. 系统保存结果到 `.ai/RUNS/`。
8. 系统生成 handoff。
9. 另一个工具能根据 handoff 接手。

额外演示：

1. 创建一个 Generic CLI Agent。
2. 用该 Agent 执行一次简单命令。
3. 捕获 stdout/stderr。
4. 生成 run result。

## 9. 进入 V1 的条件

只有当 V0 跑通后，才进入 V1。

V1 可以考虑：

- HTTP Adapter。
- Web UI 只读版。
- Review prompt 自动归档。
- 更完整 SQLite。
- 安全策略增强。
- Agent 使用统计。

## 10. V0 实现判断

V0 的重点不是智能程度，而是可复用工作流：

```text
常用 Agent 可以保存
需要时可以直接调用
结果可以进入 run 记录
后续工具可以接力
```
