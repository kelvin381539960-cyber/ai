# AI Dev Hub CLI 命令规格

## 1. CLI 设计目标

CLI 是 MVP 的第一入口，用于验证核心工作流，不依赖 Web UI。

设计原则：

1. 命令稳定、明确、可脚本化。
2. 不绑定任何具体 AI 工具。
3. 所有工具通过 Agent / Adapter 配置接入。
4. Run 可以按能力选择执行器，也可以指定 Agent。
5. 所有执行必须生成日志和事件。

## 2. 全局约定

### 2.1 命令格式

```bash
aihub <resource> <action> [options]
```

例如：

```bash
aihub task create "实现登录"
aihub agent list
aihub run --task task_001 --capability code_edit
```

### 2.2 全局参数

```bash
--project <project_id>
--workspace <path>
--json
--verbose
--dry-run
```

说明：

- `--project` 指定项目。
- `--workspace` 指定工作区路径。
- `--json` 输出机器可读 JSON。
- `--verbose` 输出更多日志。
- `--dry-run` 只展示将执行什么，不真正执行 Adapter。

### 2.3 退出码

```text
0   成功
1   通用失败
2   参数错误
3   项目未初始化
4   Agent 不存在或不可用
5   能力无法匹配
6   Adapter 执行失败
7   安全策略阻止执行
8   Git 状态不允许执行
9   超时
```

## 3. 初始化

### 3.1 命令

```bash
aihub init [--workspace <path>] [--name <name>]
```

### 3.2 行为

在项目目录创建：

```text
.ai/PROJECT.md
.ai/RULES.md
.ai/COMMANDS.md
.ai/AGENTS.yaml
.ai/TASKS/
.ai/RUNS/
.ai/HANDOFF.md
.ai/DECISIONS.md
.gitignore additions
```

同时在数据库中创建 Project 记录。

### 3.3 输出

```text
Initialized AI workspace: <path>
Project id: <project_id>
```

### 3.4 失败场景

- 当前目录不是 Git 仓库：提示用户确认是否继续。
- `.ai/` 已存在：提示已初始化，不覆盖已有文件。

## 4. 项目管理

### 4.1 添加项目

```bash
aihub project add <workspace_path> [--name <name>]
```

行为：

- 校验路径存在。
- 校验或创建 `.ai/`。
- 写入 projects 表。

### 4.2 查看项目

```bash
aihub project list
```

输出字段：

- id。
- name。
- workspacePath。
- defaultBranch。
- status。

### 4.3 项目状态

```bash
aihub project status [--project <project_id>]
```

输出：

- git branch。
- git status。
- 当前任务。
- 可用 Agent 数量。

## 5. Agent 管理

### 5.1 添加 CLI Agent

```bash
aihub agent add \
  --id code-agent \
  --name "Code Agent" \
  --type cli \
  --command "some-agent" \
  --capabilities plan,code_edit,shell_run,test_run \
  --input-mode stdin \
  --timeout 1800
```

### 5.2 添加 HTTP Agent

```bash
aihub agent add \
  --id review-api \
  --name "Review API" \
  --type http \
  --endpoint "https://example.com/review" \
  --capabilities review,security_review \
  --timeout 300
```

### 5.3 添加 Manual Agent

```bash
aihub agent add \
  --id manual-architect \
  --name "Manual Architecture Tool" \
  --type manual \
  --capabilities plan,architecture_review
```

### 5.4 查看 Agent

```bash
aihub agent list [--capability <capability>]
```

输出字段：

- id。
- name。
- type。
- enabled。
- capabilities。
- costLevel。

### 5.5 启用 / 禁用 Agent

```bash
aihub agent enable <agent_id>
aihub agent disable <agent_id>
```

### 5.6 测试 Agent 配置

```bash
aihub agent test <agent_id>
```

行为：

- CLI：检查 command 是否存在。
- HTTP：检查 endpoint 是否可访问。
- Manual：检查配置有效即可。

不执行真实任务。

## 6. 任务管理

### 6.1 创建任务

```bash
aihub task create "实现 AI Dev Hub CLI 原型" \
  --goal "跑通任务到 handoff 的闭环" \
  --capabilities plan,code_edit,test_run \
  --acceptance "可以创建任务" \
  --acceptance "可以生成 handoff"
```

行为：

- 生成 task_id。
- 写入 tasks 表。
- 写入 task_capabilities。
- 创建 `.ai/TASKS/<task_id>.md`。
- 记录 TaskEvent。

### 6.2 查看任务

```bash
aihub task list [--status running]
aihub task show <task_id>
```

### 6.3 更新任务状态

```bash
aihub task status <task_id> ready
aihub task status <task_id> blocked
```

### 6.4 添加备注

```bash
aihub task note <task_id> "当前卡在测试失败"
```

写入 TaskEvent，不覆盖任务说明。

## 7. 上下文生成

### 7.1 命令

```bash
aihub context --task <task_id> [--capability <capability>] [--agent <agent_id>] [--output <path>]
```

### 7.2 行为

读取：

- `.ai/PROJECT.md`
- `.ai/RULES.md`
- `.ai/COMMANDS.md`
- `.ai/TASKS/<task_id>.md`
- `.ai/HANDOFF.md`
- `.ai/DECISIONS.md`
- git status
- git diff 摘要

生成：

```text
.ai/context.md
```

### 7.3 输出

默认输出 prompt 摘要和文件路径。

使用 `--json` 时输出：

```json
{
  "taskId": "task_001",
  "contextPath": ".ai/context.md",
  "estimatedLength": 12000
}
```

## 8. 执行任务

### 8.1 按能力执行

```bash
aihub run --task <task_id> --capability code_edit
```

行为：

1. 查找具备 `code_edit` 的 enabled Agent。
2. 如果多个候选，输出推荐并要求用户选择，除非指定 `--yes`。
3. 生成 AgentRunInput。
4. 调用 Adapter。
5. 记录 AgentRun。
6. 记录 TaskEvent。
7. 执行后读取 git status。

### 8.2 指定 Agent 执行

```bash
aihub run --task <task_id> --agent <agent_id>
```

行为：

- 跳过能力推荐。
- 校验 Agent enabled。
- 校验 Agent 至少具备任务 required_capabilities 中的一项，或用户使用 `--force`。

### 8.3 参数

```bash
--capability <capability>
--agent <agent_id>
--yes
--force
--timeout <seconds>
--dry-run
```

### 8.4 安全检查

执行前检查：

- 是否在危险分支。
- 是否有未保存 handoff。
- 是否有敏感文件变更。
- 是否 Agent 被禁用。
- 是否命令在安全策略黑名单中。

## 9. Handoff

### 9.1 生成交接

```bash
aihub handoff --task <task_id> [--from-run <run_id>]
```

生成：

```text
.ai/HANDOFF.md
```

内容必须包括：

- 当前状态。
- 已完成事项。
- 修改文件。
- 执行命令。
- 测试结果。
- 风险。
- 剩余问题。
- 下一个执行器建议。

### 9.2 查看交接

```bash
aihub handoff show --task <task_id>
```

## 10. Review Prompt

```bash
aihub review --task <task_id> [--capability review] [--output <path>]
```

行为：

- 读取 git diff。
- 读取任务说明。
- 读取 handoff。
- 生成 review prompt。
- 可以推荐具备 review 能力的 Agent。

MVP 默认只生成 prompt，不自动调用 Review Agent。

## 11. 完成任务

```bash
aihub done --task <task_id>
```

行为：

1. 检查是否有 handoff。
2. 生成最终总结。
3. 更新任务状态为 done。
4. 写入 TaskEvent。
5. 提醒用户手动 commit。

不自动 push，不自动 merge。

## 12. 配置文件

### 12.1 `.ai/AGENTS.yaml`

保存项目级 Agent 配置。

### 12.2 全局配置

```text
~/.aihub/config.yaml
```

用于保存用户级偏好和默认 Agent。

## 13. MVP 命令优先级

必须实现：

```text
init
project add/list/status
agent add/list/test
task create/list/show/status
context
run
handoff
review
done
```

可以延后：

```text
agent metrics
cost report
memory suggest
ui serve
```
