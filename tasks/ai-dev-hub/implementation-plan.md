# AI Work Hub MVP Implementation Plan

## 1. 目标

本文件将 MVP 实现拆成可执行开发阶段。

优先级原则：

```text
先跑通真实用户闭环，再做高级能力。
```

真实用户闭环：

```text
首次启动 → 创建任务 → 添加资料 → 运行手动助手 → 回填外部 AI 输出 → 保存 Output → 编辑最终版 → 继续流程
```

## 2. 技术栈

推荐：

```text
Next.js
TypeScript
React
SQLite
Prisma 或 Drizzle
本地文件系统
```

## 3. 目录建议

```text
apps/web/
  app/
    page.tsx
    tasks/
    assistants/
    workflows/
    outputs/
    settings/
    api/
  src/
    services/
    repositories/
    runtime/
    templates/
    storage/
    types/
```

服务层建议：

```text
src/services/onboarding-service.ts
src/services/template-service.ts
src/services/task-service.ts
src/services/material-service.ts
src/services/assistant-service.ts
src/services/workflow-service.ts
src/services/run-service.ts
src/services/output-service.ts
src/services/context-builder.ts
```

运行时：

```text
src/runtime/manual-adapter.ts
src/runtime/workflow-runtime.ts
```

## 4. Phase 0：项目初始化

### 目标

创建可运行工程。

### 任务

```text
初始化 Next.js + TypeScript
接入 SQLite
建立基础 UI layout
建立 API 返回格式
建立数据目录配置
```

### 验收

```text
本地可以启动 Web UI
API health check 正常
SQLite 可连接
```

## 5. Phase 1：Onboarding + Seed Templates

### 目标

用户第一次打开能完成初始化。

### 任务

```text
实现 onboarding 状态检查
实现初始化数据目录
实现 Workspace 创建
实现默认助手模板安装
实现默认流程模板安装
实现首页任务类型入口
```

### 页面

```text
初始化页
首页
```

### API

```text
GET /api/onboarding/status
POST /api/onboarding/init
```

### 验收

```text
首次启动显示初始化向导
初始化后首页显示任务类型卡片
默认助手和流程已存在
```

## 6. Phase 2：Task + Material

### 目标

用户能创建任务并添加资料。

### 任务

```text
实现任务创建
实现任务类型推荐逻辑
实现默认助手/流程推荐
实现资料添加
实现资料状态 active/key/excluded
实现任务详情页
```

### 页面

```text
任务创建页
任务列表页
任务详情页
资料区
```

### API

```text
POST /api/tasks
GET /api/tasks
GET /api/tasks/:id
POST /api/tasks/:taskId/materials
PATCH /api/materials/:id
```

### 验收

```text
用户可以从首页选择“做需求调研”创建任务
用户可以添加资料
任务详情能显示资料和推荐助手
```

## 7. Phase 3：Assistant + Manual Run

### 目标

用户能运行手动助手，复制 prompt，回填外部 AI 输出。

### 任务

```text
实现助手列表
实现 Context Builder
实现 Manual Adapter
实现 Run 创建
实现 prompt 文件保存
实现 waiting_user 状态
实现回填结果
```

### 页面

```text
助手管理页
Manual Run 页面
任务详情执行记录区
```

### API

```text
GET /api/assistants
POST /api/assistants/:id/run
GET /api/runs/:id
POST /api/runs/:id/complete
POST /api/runs/:id/cancel
```

### 验收

```text
用户点击继续生成后看到 prompt
用户可以复制 prompt
用户可以粘贴外部 AI 输出
系统保存 Run 和 Output
关闭页面后 waiting_user Run 可恢复
```

## 8. Phase 4：Output 管理

### 目标

用户能管理 AI 输出。

### 任务

```text
实现 Output 列表
实现 Output 详情
实现编辑 Output
实现另存为新版本
实现标记最终版
实现复制 Markdown
实现 Output 转 Material
实现基于 Output 创建新任务
```

### 页面

```text
任务详情输出区
输出页
输出详情页
```

### API

```text
GET /api/tasks/:taskId/outputs
GET /api/outputs/:id
PATCH /api/outputs/:id
POST /api/outputs/:id/new-version
POST /api/outputs/:id/mark-final
POST /api/outputs/:id/convert-to-material
POST /api/outputs/:id/create-task
```

### 验收

```text
用户可以编辑 AI 输出
用户可以保存新版本
用户可以标记最终版
用户可以把输出转为资料
```

## 9. Phase 5：Workflow Runtime

### 目标

用户能运行线性任务流程，并支持暂停/继续。

### 任务

```text
实现流程列表
实现流程详情
实现 Workflow Run
实现 Step 状态
实现 waiting_user
实现继续流程
实现取消流程
实现失败重试
```

### 页面

```text
流程管理页
任务详情流程区
Workflow Run 状态展示
```

### API

```text
GET /api/workflows
POST /api/workflows/:id/run
GET /api/workflow-runs/:id
POST /api/workflow-runs/:id/continue
POST /api/workflow-runs/:id/cancel
POST /api/workflow-runs/:id/retry-step
```

### 验收

```text
用户可以运行需求调研流程
流程遇到 Manual Assistant 时进入 waiting_user
用户回填后流程继续
页面关闭后流程可恢复
```

## 10. Phase 6：可用性补齐

### 目标

达到可真实使用状态。

### 任务

```text
空状态
错误状态
搜索任务/资料/输出
任务完成
最终输出检查
复制纯文本/Markdown
隐私提示
部署说明
```

### 验收

```text
首次用户不会遇到空白页
用户能搜索历史任务和输出
用户能完成任务并保留最终输出
```

## 11. 暂不实现

```text
复杂 DAG
条件分支
多用户权限
成本统计
ChatGPT Action
MCP Server
自动代码执行
自动 push / merge / deploy
```

## 12. 开发顺序建议

严格按顺序：

```text
Phase 0 → Phase 1 → Phase 2 → Phase 3 → Phase 4 → Phase 5 → Phase 6
```

不要先做：

```text
CLI Agent
MCP
Action
复杂 Workflow
权限系统
```

## 13. 最小可验收 Demo

第一个可验收 Demo 必须展示：

```text
初始化系统
创建需求调研任务
添加资料
运行调研助手
复制 prompt
粘贴 AI 输出
生成调研结论 Output
编辑 Output
标记最终版
```

如果这个 Demo 不顺，说明产品还不能交付使用。

## 14. 给执行工具的任务提示

```text
请按 tasks/ai-dev-hub/technical-design.md、database-schema.md、api-spec.md、implementation-plan.md 实现 AI Work Hub MVP。

优先实现用户真实闭环，不要先做高级能力。

用户主路径：选择任务类型 → 添加资料 → 推荐助手和流程 → Manual Assistant 生成 prompt → 用户回填外部 AI 输出 → 保存 Output。

Material 和 Output 是核心对象。Assistant 和 Workflow 是支撑对象。Run 是底层记录。Handoff 是 Output 的一种。
```
