# AI Work Hub API Spec

## 1. 目标

本文件定义 MVP 内部 API。

MVP API 首先服务 Web UI，后续可复用给 REST API、ChatGPT Action、MCP Server。

## 2. 通用约定

### 2.1 返回格式

成功：

```json
{
  "ok": true,
  "data": {}
}
```

失败：

```json
{
  "ok": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "错误说明"
  }
}
```

### 2.2 时间格式

全部使用 ISO string。

### 2.3 分页参数

```text
?page=1&pageSize=20
```

## 3. Onboarding API

## 3.1 检查初始化状态

```text
GET /api/onboarding/status
```

返回：

```json
{
  "initialized": true,
  "workspaceId": "workspace_xxx"
}
```

## 3.2 初始化 Workspace

```text
POST /api/onboarding/init
```

请求：

```json
{
  "workspaceName": "我的工作台",
  "dataDir": "/srv/ai-work-hub"
}
```

行为：

- 创建数据目录。
- 初始化 SQLite。
- 创建 Workspace。
- 安装默认模板。

## 4. Workspace API

```text
GET /api/workspaces
POST /api/workspaces
GET /api/workspaces/:id
PATCH /api/workspaces/:id
```

## 5. Project API

```text
GET /api/projects?workspaceId=xxx
POST /api/projects
GET /api/projects/:id
PATCH /api/projects/:id
DELETE /api/projects/:id
```

创建 Project 请求：

```json
{
  "workspaceId": "workspace_xxx",
  "name": "AIX 产品",
  "description": "AI 工作台项目"
}
```

## 6. Task API

## 6.1 创建任务

```text
POST /api/tasks
```

请求：

```json
{
  "projectId": "project_xxx",
  "type": "research",
  "title": "调研 AI Workflow 工具",
  "goal": "比较适合产品经理和运营使用的 AI 工作流工具",
  "expectedOutput": "调研结论和建议",
  "materialInputs": [
    {
      "type": "text",
      "title": "背景",
      "content": "希望做一个 AI 工作台"
    }
  ]
}
```

行为：

- 创建 Task。
- 根据 type 推荐默认助手。
- 根据 type 推荐默认流程。
- 创建初始 Material。

## 6.2 查询任务列表

```text
GET /api/tasks?projectId=xxx&type=research&status=running
```

返回字段：

```text
id
title
type
status
defaultAssistant
latestOutput
updatedAt
```

## 6.3 查询任务详情

```text
GET /api/tasks/:id
```

返回：

```text
task
materials
outputs
runs
workflowRuns
defaultAssistant
workflow
nextActions
```

## 6.4 更新任务

```text
PATCH /api/tasks/:id
```

可更新：

```text
title
goal
expectedOutput
defaultAssistantId
workflowId
contextScope
status
```

## 6.5 完成任务

```text
POST /api/tasks/:id/complete
```

规则：

- 如果没有 final Output，返回提示。
- 用户可强制完成。

请求：

```json
{
  "force": false,
  "note": "已确认最终调研结论"
}
```

## 7. Material API

## 7.1 查询任务资料

```text
GET /api/tasks/:taskId/materials
```

## 7.2 创建资料

```text
POST /api/tasks/:taskId/materials
```

请求：

```json
{
  "type": "text",
  "title": "用户反馈",
  "content": "用户反馈内容",
  "usageStatus": "active"
}
```

## 7.3 更新资料

```text
PATCH /api/materials/:id
```

可更新：

```text
title
content
sourceUrl
usageStatus
```

## 7.4 删除资料

```text
DELETE /api/materials/:id
```

MVP 可做软删除或直接删除。

## 8. Assistant API

## 8.1 查询助手

```text
GET /api/assistants?workspaceId=xxx&type=manual&enabled=true
```

## 8.2 创建助手

```text
POST /api/assistants
```

请求：

```json
{
  "workspaceId": "workspace_xxx",
  "name": "调研助手",
  "type": "manual",
  "applicableTaskTypes": ["research"],
  "capabilities": ["research", "summarize"],
  "promptTemplate": "...",
  "defaultContextScope": "standard"
}
```

## 8.3 更新助手

```text
PATCH /api/assistants/:id
```

## 8.4 运行助手

```text
POST /api/assistants/:id/run
```

请求：

```json
{
  "taskId": "task_xxx",
  "reason": "continue",
  "contextScope": "standard",
  "materialMode": "standard",
  "selectedMaterialIds": []
}
```

返回 Manual Assistant：

```json
{
  "runId": "run_xxx",
  "status": "waiting_user",
  "prompt": "...",
  "usedMaterialIds": ["material_xxx"]
}
```

## 9. Run API

## 9.1 查询 Run

```text
GET /api/runs/:id
```

## 9.2 查询任务 Run

```text
GET /api/tasks/:taskId/runs
```

## 9.3 完成 Manual Run

```text
POST /api/runs/:id/complete
```

请求：

```json
{
  "result": "外部 AI 输出内容",
  "outputType": "research_report",
  "outputTitle": "调研结论 v1",
  "continueWorkflow": true
}
```

行为：

- 保存 result。
- Run 状态变为 success。
- 创建 Output。
- 如果关联 Workflow Run 且 continueWorkflow=true，继续流程。

## 9.4 取消 Run

```text
POST /api/runs/:id/cancel
```

## 10. Workflow API

## 10.1 查询流程

```text
GET /api/workflows?workspaceId=xxx&enabled=true
```

## 10.2 创建流程

```text
POST /api/workflows
```

## 10.3 更新流程

```text
PATCH /api/workflows/:id
```

## 10.4 运行流程

```text
POST /api/workflows/:id/run
```

请求：

```json
{
  "taskId": "task_xxx"
}
```

返回：

```json
{
  "workflowRunId": "workflow_run_xxx",
  "status": "waiting_user",
  "currentStepId": "step_xxx"
}
```

## 11. Workflow Run API

## 11.1 查询流程运行

```text
GET /api/workflow-runs/:id
```

## 11.2 继续流程

```text
POST /api/workflow-runs/:id/continue
```

## 11.3 取消流程

```text
POST /api/workflow-runs/:id/cancel
```

## 11.4 重试当前步骤

```text
POST /api/workflow-runs/:id/retry-step
```

## 12. Output API

## 12.1 查询任务输出

```text
GET /api/tasks/:taskId/outputs
```

## 12.2 查询输出详情

```text
GET /api/outputs/:id
```

## 12.3 创建输出

```text
POST /api/tasks/:taskId/outputs
```

## 12.4 编辑输出

```text
PATCH /api/outputs/:id
```

请求：

```json
{
  "title": "调研结论 v2",
  "content": "新的内容"
}
```

## 12.5 另存为新版本

```text
POST /api/outputs/:id/new-version
```

## 12.6 标记最终版

```text
POST /api/outputs/:id/mark-final
```

## 12.7 转为资料

```text
POST /api/outputs/:id/convert-to-material
```

请求：

```json
{
  "targetTaskId": "task_xxx"
}
```

## 12.8 基于输出创建任务

```text
POST /api/outputs/:id/create-task
```

请求：

```json
{
  "projectId": "project_xxx",
  "type": "prd",
  "title": "基于调研结论写 PRD",
  "goal": "把调研结论转为 PRD"
}
```

## 13. Search API

MVP 简单搜索：

```text
GET /api/search?q=关键词&type=task|material|output
```

返回：

```text
tasks
materials
outputs
```

## 14. Settings API

```text
GET /api/settings?workspaceId=xxx
PATCH /api/settings/:id
```

## 15. 必须错误码

```text
NOT_INITIALIZED
WORKSPACE_NOT_FOUND
TASK_NOT_FOUND
MATERIAL_NOT_FOUND
ASSISTANT_NOT_FOUND
WORKFLOW_NOT_FOUND
RUN_NOT_FOUND
OUTPUT_NOT_FOUND
INVALID_STATE
WAITING_USER_REQUIRED
NO_FINAL_OUTPUT
VALIDATION_ERROR
```

## 16. MVP API 验收

必须能串起：

```text
初始化 → 创建任务 → 添加资料 → 运行助手 → 复制 Prompt → 回填结果 → 创建 Output → 编辑 Output → 标记最终版 → 运行 Workflow → 恢复 waiting_user
```
