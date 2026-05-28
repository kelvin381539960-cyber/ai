# Implementation Handoff

## 1. 当前状态

AI Work Hub 已完成实现前准备。

现在可以交给 Cursor / Codex / Claude Code / 其他 CLI 工具执行开发。

## 2. 不要重新讨论产品方向

当前方向已经确定：

```text
产品经理 / 运营的 AI 工作台
```

不要回退成：

```text
AI 开发工具
IDE
Agent 编排平台
Workflow 自动化平台
CLI 工具管理器
```

## 3. 首要实现目标

第一批只实现真实用户闭环：

```text
初始化 → 任务类型入口 → 创建任务 → 添加资料 → Manual Assistant 生成 Prompt → 回填外部 AI 输出 → 生成 Output → 编辑 Output → 标记最终版
```

## 4. 推荐应用目录

在仓库根目录新增：

```text
ai-work-hub/
```

不要修改已有项目：

```text
feishu-message-bridge/
rootops-mcp/
```

## 5. 必读文档

```text
tasks/ai-dev-hub/development-kickoff.md
tasks/ai-dev-hub/first-demo-task.md
tasks/ai-dev-hub/technical-design.md
tasks/ai-dev-hub/database-schema.md
tasks/ai-dev-hub/api-spec.md
tasks/ai-dev-hub/implementation-plan.md
tasks/ai-dev-hub/onboarding.md
tasks/ai-dev-hub/seed-templates.md
tasks/ai-dev-hub/manual-run-flow.md
tasks/ai-dev-hub/output-rules.md
tasks/ai-dev-hub/material-rules.md
```

## 6. 第一批开发任务

按顺序实现：

```text
1. 创建 ai-work-hub/ Next.js 应用骨架
2. 实现 SQLite schema
3. 实现数据目录初始化
4. 实现默认模板 seed
5. 实现首页任务类型入口
6. 实现任务创建
7. 实现资料添加
8. 实现助手模板读取
9. 实现 Manual Assistant prompt 生成
10. 实现 Run waiting_user
11. 实现 Run complete 回填
12. 实现 Output 创建
13. 实现 Output 编辑
14. 实现 Output 标记最终版
15. 实现任务详情页展示资料、输出、执行记录
```

## 7. 第一批不要做

```text
Workflow Runtime 完整执行
CLI Assistant
MCP
ChatGPT Action
复杂 DAG
多用户权限
成本统计
自动代码执行
自动 push / merge / deploy
```

## 8. 技术约束

建议：

```text
Next.js + TypeScript + SQLite + Drizzle
```

也可以使用 Prisma，但不要引入复杂后端框架。

## 9. 验收标准

必须跑通 `first-demo-task.md`。

如果 Demo 不通过，不要扩展新功能。

## 10. 给执行 AI 的提示

```text
你现在要实现 AI Work Hub MVP 第一批功能。

请不要重新设计产品。请严格按 tasks/ai-dev-hub/implementation-handoff.md、development-kickoff.md、first-demo-task.md、technical-design.md、database-schema.md、api-spec.md、implementation-plan.md 执行。

请在仓库根目录新建 ai-work-hub/，不要修改 feishu-message-bridge 或 rootops-mcp。

第一目标是跑通需求调研任务闭环 Demo：初始化 → 创建需求调研任务 → 添加资料 → 运行调研助手 → 复制 prompt → 回填外部 AI 输出 → 生成 Output → 编辑 Output → 标记最终版。

不要实现 CLI Assistant、MCP、ChatGPT Action、多用户、复杂 Workflow。
```
