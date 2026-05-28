# AI Work Hub Handoff

## 当前状态

AI Work Hub 已完成实现准备阶段。

已新增开发开工包：

```text
tasks/ai-dev-hub/development-kickoff.md
tasks/ai-dev-hub/first-demo-task.md
tasks/ai-dev-hub/implementation-handoff.md
```

当前已经可以交给执行工具开始实现。

## 当前产品定位

```text
产品经理 / 运营的 AI 工作台
```

正式定义：

```text
面向产品、运营、技术型 PM 和个人开发者的 AI 工作流任务中台。
```

## 当前主路径

```text
选择任务类型 → 填写目标 → 添加资料 → 系统推荐助手和流程 → 开始执行 → 查看输出 → 继续优化 / 评审 → 生成最终结论
```

## 当前技术结论

```text
Next.js + TypeScript + SQLite + 文件系统 + 模块化单体
```

## 推荐应用目录

在仓库根目录新增：

```text
ai-work-hub/
```

不要修改已有项目：

```text
feishu-message-bridge/
rootops-mcp/
```

## 第一批开发范围

只实现：

```text
初始化系统
默认模板
首页任务类型入口
创建任务
添加资料
Manual Assistant prompt 生成
复制 prompt
回填外部 AI 输出
Output 创建
Output 编辑
Output 标记最终版
任务详情展示资料、输出、执行记录
```

## 第一批不要实现

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

## 首个 Demo 验收

必须跑通：

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

## 必读文档顺序

```text
1. implementation-handoff.md
2. development-kickoff.md
3. first-demo-task.md
4. technical-design.md
5. database-schema.md
6. api-spec.md
7. implementation-plan.md
8. onboarding.md
9. seed-templates.md
10. manual-run-flow.md
11. output-rules.md
12. material-rules.md
```

## 当前核心对象

```text
Workspace
Project / Space
Task
Material / Source
Assistant / Agent
Workflow
Workflow Run
Run
Output
Handoff
```

其中：

- Material 是输入核心。
- Output 是产出核心。
- Assistant 是用户看到的“助手”。
- Workflow 是用户看到的“任务流程”。
- Run 是底层执行记录。
- Handoff 是 Output 的一种。

## 推荐执行提示

```text
请按 tasks/ai-dev-hub/implementation-handoff.md 实现 AI Work Hub MVP 第一批功能。

请在仓库根目录新建 ai-work-hub/，不要修改 feishu-message-bridge 或 rootops-mcp。

第一目标是跑通需求调研任务闭环 Demo：初始化 → 创建需求调研任务 → 添加资料 → 运行调研助手 → 复制 prompt → 回填外部 AI 输出 → 生成 Output → 编辑 Output → 标记最终版。

不要实现 CLI Assistant、MCP、ChatGPT Action、多用户、复杂 Workflow。
```
