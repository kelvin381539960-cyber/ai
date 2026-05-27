# AI Dev Hub Adapter Runtime 设计

## 1. 目标

Adapter Runtime 是执行器运行层，负责把标准任务上下文交给具体 Agent，并把结果统一收回来。

核心要求：

1. 不绑定具体 AI 工具。
2. 支持 CLI / HTTP / Manual / Custom Adapter。
3. 统一输入输出。
4. 完整记录日志。
5. 安全策略可控。
6. 失败可复盘。

## 2. Runtime 流程

```text
Task + Capability
  ↓
Capability Router
  ↓
Agent Selection
  ↓
Context Builder
  ↓
AgentRunInput
  ↓
Adapter Runtime
  ↓
AgentRunResult
  ↓
Run Store + Handoff Generator
```

## 3. 标准输入

```ts
interface AgentRunInput {
  runId: string
  taskId: string
  projectId: string
  workspacePath: string
  capability: string
  prompt: string
  contextFiles: string[]
  task: {
    id: string
    title: string
    goal: string
    scope: string[]
    nonGoals: string[]
    acceptanceCriteria: string[]
    requiredCapabilities: string[]
  }
  handoff?: string
  gitStatus?: string
  gitDiff?: string
  metadata?: Record<string, unknown>
}
```

## 4. 标准输出

```ts
interface AgentRunResult {
  runId: string
  agentId: string
  status: 'success' | 'failed' | 'cancelled' | 'timeout' | 'manual_pending'
  startedAt: string
  endedAt?: string
  exitCode?: number
  stdout?: string
  stderr?: string
  summary?: string
  changedFiles?: string[]
  suggestedNextStep?: string
  raw?: unknown
}
```

## 5. Adapter 接口

```ts
interface Adapter {
  type: 'cli' | 'http' | 'manual' | 'custom'
  validate(config: AgentConfig): Promise<ValidationResult>
  run(input: AgentRunInput, config: AgentConfig): Promise<AgentRunResult>
}
```

## 6. Agent 配置

```ts
interface AgentConfig {
  id: string
  name: string
  type: 'cli' | 'http' | 'manual' | 'custom'
  enabled: boolean
  capabilities: string[]
  timeoutSeconds?: number
  requiresWorkspace?: boolean
  interactive?: boolean
  config: Record<string, unknown>
}
```

## 7. CLI Adapter Runtime

### 7.1 配置

```yaml
id: generic-code-cli
name: Generic Code CLI
type: cli
command: some-agent
args:
  - run
input_mode: stdin
output_mode: stream
timeout_seconds: 1800
capabilities:
  - plan
  - code_edit
  - shell_run
```

### 7.2 输入方式

支持三种输入方式：

```text
stdin       将 prompt 写入 stdin
arg         将 prompt 作为参数传入
file        将 prompt 写入临时文件，把文件路径传给命令
```

MVP 优先实现：

```text
stdin
file
```

### 7.3 执行步骤

1. 创建 run 目录：`.ai/RUNS/<run_id>/`。
2. 写入 `input.json`。
3. 写入 `prompt.md`。
4. 记录 `git-before.txt`。
5. 启动子进程。
6. 捕获 stdout/stderr。
7. 超时则 kill 子进程。
8. 记录 exit code。
9. 记录 `git-after.txt`。
10. 写入 `result.json`。

### 7.4 禁止行为

CLI Adapter 默认不允许：

- 自动 push。
- 自动 merge。
- 自动 deploy。
- 修改密钥文件。
- 删除大量文件。

这些不是靠完全拦截实现，而是通过 prompt 约束、安全检查、执行后 diff 检测和人工确认实现。

## 8. HTTP Adapter Runtime

### 8.1 配置

```yaml
id: review-api
name: Review API
type: http
endpoint: https://example.com/review
method: POST
headers:
  Authorization: Bearer ${REVIEW_API_TOKEN}
body_template: default
capabilities:
  - review
  - security_review
```

### 8.2 执行步骤

1. 构造请求 body。
2. 注入必要上下文。
3. 读取环境变量中的密钥。
4. 发送请求。
5. 记录响应状态。
6. 解析响应。
7. 写入 `result.json`。

### 8.3 安全要求

- 不在配置文件中保存明文 token。
- 不默认发送完整代码库。
- 大 diff 需要摘要或用户确认。

## 9. Manual Adapter Runtime

### 9.1 用途

Manual Adapter 用于不能直接自动调用的工具。

### 9.2 行为

1. 生成标准 prompt。
2. 保存到 `.ai/context.md` 或 `.ai/review-prompt.md`。
3. 输出复制说明。
4. 创建 status 为 `manual_pending` 的 AgentRun。
5. 用户后续可粘贴结果并关闭 run。

### 9.3 后续命令

```bash
aihub run complete <run_id> --summary <file>
```

或：

```bash
aihub run complete <run_id>
```

进入交互模式粘贴结果。

## 10. Capability Router

### 10.1 输入

- task_id。
- required capability。
- enabled agents。
- 用户偏好。
- 成本等级。
- 最近成功率。

### 10.2 MVP 规则

1. 找出 enabled Agents。
2. 过滤具备指定 capability 的 Agents。
3. 如果用户指定 `--agent`，直接校验该 Agent。
4. 如果只有一个候选，直接使用。
5. 如果多个候选，列出并要求用户选择。
6. 如果没有候选，建议创建 Manual Agent。

### 10.3 后续增强

- 成本排序。
- 成功率排序。
- 额度状态。
- 上下文窗口大小。
- 任务类型偏好。

## 11. Run Store

执行过程中必须实时写入：

```text
.ai/RUNS/<run_id>/input.json
.ai/RUNS/<run_id>/prompt.md
.ai/RUNS/<run_id>/stdout.log
.ai/RUNS/<run_id>/stderr.log
.ai/RUNS/<run_id>/result.json
.ai/RUNS/<run_id>/git-before.txt
.ai/RUNS/<run_id>/git-after.txt
```

数据库记录只保存索引和摘要。

## 12. 安全检查

### 12.1 执行前

检查：

- Agent 是否 enabled。
- workspace 是否存在。
- 是否在 Git 仓库。
- 是否存在敏感未提交变更。
- 是否在禁止分支执行。

### 12.2 执行后

检查：

- 是否修改 `.env`、证书、密钥。
- 是否删除大量文件。
- 是否生成异常大 diff。
- 是否测试失败。

如发现高风险，run 仍可记录，但 handoff 必须标红风险。

## 13. 错误处理

### 13.1 Adapter 配置错误

返回：

```text
Agent config invalid
```

并指出缺失字段。

### 13.2 执行超时

- kill 子进程。
- status = timeout。
- 保留已有 stdout/stderr。
- 生成失败摘要。

### 13.3 命令不存在

- status = failed。
- stderr 记录 command not found。
- 建议运行 `aihub agent test <agent_id>`。

### 13.4 HTTP 失败

- 记录 status code。
- 记录响应摘要。
- 不打印敏感 header。

## 14. 并发策略

MVP 不支持同一项目多 run 并发执行。

规则：

- 同一 project 同一时间只能有一个 running AgentRun。
- Manual pending 不阻塞新的 run，但会提醒用户。

后续可支持锁粒度细化。

## 15. Runtime 最小实现清单

MVP 必须实现：

1. AgentConfig 解析。
2. Adapter Registry。
3. Generic CLI Adapter。
4. Manual Adapter。
5. Capability Router。
6. Run 目录创建。
7. stdout/stderr 捕获。
8. timeout。
9. git before/after 记录。
10. AgentRunResult 标准化。

可以延后：

1. HTTP Adapter。
2. 成本统计。
3. 成功率排序。
4. 多 run 并发。
5. Web UI 实时日志。
