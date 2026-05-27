# AI Dev Hub Agent Adapter 规范

## 1. 目标

Agent Adapter 是 AI Dev Hub 接入不同 AI 工具的标准接口。

系统核心不关心具体工具是什么，只关心该 Adapter：

- 能提供哪些能力。
- 如何接收上下文。
- 如何执行任务。
- 如何返回结果。
- 如何记录日志。

## 2. Adapter 类型

MVP 至少支持三类 Adapter 抽象。

### 2.1 CLI Adapter

用于接入命令行工具。

示例：

- 某个代码 Agent CLI。
- 某个 Review CLI。
- 自定义 shell 脚本。

### 2.2 HTTP Adapter

用于接入公司 API 或模型 API。

示例：

- 内部 LLM 服务。
- 总结 API。
- Review API。

### 2.3 Manual Adapter

用于不直接调用工具，只生成 prompt，由用户手动复制给外部工具。

用途：

- 工具暂时没有 CLI 或 API。
- 用户想保留人工确认。
- 某些会员工具只能通过 UI 使用。

## 3. Adapter 配置结构

示例：

```yaml
agents:
  - id: code-agent-local
    name: Code Agent Local
    type: cli
    command: code-agent
    args:
      - run
      - "--workspace"
      - "{{workspace}}"
    input_mode: stdin
    output_mode: stream
    capabilities:
      - plan
      - code_read
      - code_edit
      - shell_run
      - test_run
    timeout_seconds: 1800
    requires_workspace: true
    interactive: true
    enabled: true

  - id: review-api
    name: Review API
    type: http
    endpoint: https://internal.example.com/review
    method: POST
    capabilities:
      - review
      - security_review
    timeout_seconds: 300
    requires_workspace: false
    interactive: false
    enabled: true

  - id: manual-architect
    name: Manual Architecture Agent
    type: manual
    capabilities:
      - architecture_review
      - plan
    enabled: true
```

## 4. 标准输入

所有 Adapter 都应接收统一的 `AgentRunInput`。

```ts
interface AgentRunInput {
  runId: string
  taskId: string
  projectId: string
  workspacePath: string
  capability: string
  prompt: string
  contextFiles: string[]
  task: TaskSnapshot
  handoff?: string
  gitStatus?: string
  gitDiff?: string
  metadata?: Record<string, unknown>
}
```

## 5. 标准输出

所有 Adapter 都应返回统一的 `AgentRunResult`。

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

## 6. CLI Adapter 行为

CLI Adapter 必须支持：

1. 指定工作目录。
2. 通过 stdin、参数或临时文件传入 prompt。
3. 捕获 stdout。
4. 捕获 stderr。
5. 记录 exit code。
6. 支持 timeout。
7. 执行前后记录 git status。

CLI Adapter 不应该默认：

- 自动 push。
- 自动 merge。
- 自动 deploy。
- 自动删除大量文件。

## 7. HTTP Adapter 行为

HTTP Adapter 必须支持：

1. endpoint 配置。
2. header 配置。
3. request body 模板。
4. timeout。
5. 错误码记录。
6. 响应解析。

HTTP Adapter 不应该默认发送完整代码库，除非用户明确配置。

## 8. Manual Adapter 行为

Manual Adapter 不执行工具，只生成：

- 标准 prompt。
- 上下文摘要。
- 需要用户复制的内容。
- 等待用户粘贴结果的入口。

适合外部 UI 工具。

## 9. Adapter 生命周期

```text
registered → enabled → selected → running → completed / failed / disabled
```

## 10. 执行记录

每次 Adapter 执行都必须记录：

- agent_id。
- adapter_type。
- capability。
- prompt。
- 开始时间。
- 结束时间。
- 输入摘要。
- 输出摘要。
- stdout / stderr。
- git status before / after。
- 错误信息。

## 11. 插件边界

系统核心只调用 Adapter 标准接口。

Adapter 负责处理工具差异：

- 命令格式差异。
- prompt 输入方式差异。
- 输出格式差异。
- 交互方式差异。
- API 鉴权差异。

## 12. MVP 实现建议

MVP 不需要一开始支持所有工具。

但代码结构必须从第一天支持 Adapter 扩展：

```text
src/
  adapters/
    types.ts
    registry.ts
    cli-adapter.ts
    http-adapter.ts
    manual-adapter.ts
  services/
    capability-router.ts
    context-builder.ts
    run-service.ts
```

第一批可以只实现：

- Generic CLI Adapter。
- Manual Adapter。

这样用户可以自己接任何 CLI 工具，而不是系统写死某个工具。
