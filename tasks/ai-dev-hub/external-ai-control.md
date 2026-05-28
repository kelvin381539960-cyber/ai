# External AI Control Layer 方案

## 1. 定义

External AI Control Layer 是 AI Dev Hub 面向外部 AI 工具开放的受控入口。

目标：让 ChatGPT、Claude、Cursor、Codex 或其他 AI 工具，可以通过 Action、MCP 或 API 操作 AI Dev Hub 的任务、Agent、Workflow、Run 和 Handoff。

它不是 V0 核心功能，而是 V1/V2 扩展能力。

## 2. 产品定位

AI Dev Hub 的主定位仍然是：

```text
AI 开发任务中台
```

External AI Control Layer 是扩展入口，不改变产品定位。

它解决的问题：

- 用户不一定只通过 AI Dev Hub UI 操作。
- 用户可能希望直接在 ChatGPT 中创建任务。
- 用户可能希望让 Claude/Cursor 读取 handoff。
- 用户可能希望外部 AI 帮忙创建 Workflow 或回填 Run 结果。

## 3. 接入方式

### 3.1 REST API

AI Dev Hub 后端提供 REST API。

用途：

- Web UI 调用。
- ChatGPT Action 调用。
- 外部脚本调用。

建议阶段：V1。

### 3.2 ChatGPT Action

通过 OpenAPI schema 暴露部分 REST API 给 ChatGPT。

用途：

- 在 ChatGPT 中创建任务。
- 查询任务状态。
- 创建 Agent。
- 创建 Workflow。
- 回填 Run 结果。
- 获取 Handoff。

建议阶段：V1。

### 3.3 MCP Server

AI Dev Hub 提供 MCP Server，把核心能力暴露为 tools。

用途：

- 让支持 MCP 的 AI 工具直接调用 AI Dev Hub。
- 统一 ChatGPT / Claude / Cursor / Codex 等工具的外部访问方式。

建议阶段：V2。

## 4. 推荐路线

```text
V0：轻量 UI + Agent + Workflow + Run + Handoff
V1：REST API + ChatGPT Action
V2：MCP Server
```

原因：

- V0 先跑通内部任务模型。
- REST API 是 UI 和 Action 的基础。
- MCP 适合作为长期外部工具协议。

## 5. 可开放能力

### 5.1 Task Tools

```text
list_tasks
get_task
create_task
update_task_status
add_task_note
```

### 5.2 Agent Tools

```text
list_agents
get_agent
create_agent
enable_agent
disable_agent
```

### 5.3 Workflow Tools

```text
list_workflows
get_workflow
create_workflow
run_workflow
get_workflow_run
```

### 5.4 Run Tools

```text
list_runs
get_run
complete_run
```

### 5.5 Handoff Tools

```text
get_handoff
generate_handoff
```

## 6. 权限分级

### 6.1 低风险，只读

默认可允许：

```text
list_tasks
get_task
list_agents
get_agent
list_workflows
get_workflow
get_handoff
```

### 6.2 中风险，需要确认

需要用户确认：

```text
create_task
create_agent
create_workflow
run_workflow
complete_run
generate_handoff
update_task_status
```

### 6.3 高风险，禁止开放

V1/V2 不开放：

```text
自动 push
自动 merge
自动 deploy
删除任务
删除文件
直接执行任意 shell
修改密钥
修改服务器配置
```

## 7. ChatGPT Action 使用场景

### 7.1 创建任务

用户说：

```text
帮我在 AI Dev Hub 创建一个任务：调研 MCP 接入方案
```

Action 调用：

```text
create_task
```

### 7.2 创建 Workflow

用户说：

```text
帮我创建一个调研 workflow，步骤包括输入问题、调研 Agent、总结 Agent、生成 handoff
```

Action 调用：

```text
create_workflow
```

### 7.3 回填 Run 结果

用户说：

```text
把下面这段评审结果写回刚才的 run
```

Action 调用：

```text
complete_run
```

### 7.4 获取 Handoff

用户说：

```text
读取当前任务 handoff，继续下一步
```

Action 调用：

```text
get_handoff
```

## 8. MCP Server Tools 设计草案

### 8.1 task.create

输入：

```json
{
  "projectId": "string",
  "title": "string",
  "goal": "string",
  "capabilities": ["review"]
}
```

输出：

```json
{
  "taskId": "string",
  "status": "draft"
}
```

### 8.2 workflow.run

输入：

```json
{
  "projectId": "string",
  "workflowId": "string",
  "taskId": "string"
}
```

输出：

```json
{
  "workflowRunId": "string",
  "status": "running"
}
```

### 8.3 run.complete

输入：

```json
{
  "runId": "string",
  "result": "string"
}
```

输出：

```json
{
  "runId": "string",
  "status": "success"
}
```

### 8.4 handoff.get

输入：

```json
{
  "taskId": "string"
}
```

输出：

```json
{
  "taskId": "string",
  "handoff": "string"
}
```

## 9. 安全边界

外部 AI 不能直接操作代码和 shell。

外部 AI 只能通过 AI Dev Hub 的受控接口：

```text
创建任务
查询任务
创建 Agent
创建 Workflow
触发 Workflow
回填结果
生成 Handoff
```

真正执行命令、读取项目、保存日志，仍由 AI Dev Hub 后端控制。

## 10. 对 V0 的影响

V0 不实现 External AI Control Layer。

但 V0 的数据模型和 API 设计要预留：

- Task Service。
- Agent Service。
- Workflow Service。
- Run Service。
- Handoff Service。

这样 V1/V2 可以自然暴露 REST API 和 MCP Tools。

## 11. 成功标准

V1 成功标准：

- ChatGPT Action 可以创建任务。
- ChatGPT Action 可以查询任务。
- ChatGPT Action 可以创建 Workflow。
- ChatGPT Action 可以回填 Run。
- ChatGPT Action 可以获取 Handoff。

V2 成功标准：

- MCP Client 可以调用 task tools。
- MCP Client 可以调用 workflow tools。
- MCP Client 可以调用 run tools。
- MCP Client 可以调用 handoff tools。
- 所有高风险操作仍受 AI Dev Hub 安全策略限制。
