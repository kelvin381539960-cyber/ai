# AI Work Hub Handoff

## 当前状态

已进入技术方案设计阶段，并新增：

```text
tasks/ai-dev-hub/technical-design.md
```

当前技术方案已给出 MVP 推荐架构：

```text
Next.js + TypeScript + SQLite + 文件系统 + 模块化单体
```

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

## 技术方案核心结论

### 架构

```text
模块化单体
```

不要一开始做微服务。

### 技术栈

```text
Next.js
React
TypeScript
SQLite
Prisma 或 Drizzle
本地/服务器文件系统
```

### 存储原则

```text
SQLite 存结构化状态
文件系统存资料、输出、prompt、run 结果
数据库保存路径和摘要
```

### 数据目录

```text
.ai-work-hub/
  db.sqlite
  materials/
  outputs/
  runs/
  workflow-runs/
  exports/
  templates/
```

### MVP 优先实现

```text
任务类型入口
资料管理
Manual Assistant
Prompt 复制/回填
Output 管理
Workflow 暂停/继续/恢复
```

### MVP 不优先实现

```text
复杂 DAG
代码执行
MCP
ChatGPT Action
多用户权限
成本统计
```

## 当前技术模块

```text
Onboarding Service
Template Service
Task Service
Material Service
Assistant Service
Assistant Runtime
Manual Adapter
Workflow Service
Workflow Runtime
Context Builder
Output Service
```

## 下一步建议

技术方案主干已完成。

下一步建议补实现级细节：

```text
database-schema.md       数据库 schema
api-spec.md              API 详细规格
implementation-plan.md   MVP 实现任务拆解
```

然后可以交给开发工具开始实现。

## 给下一个 AI 工具的接力提示

```text
请先阅读 tasks/ai-dev-hub/technical-design.md、brd.md、prd.md、prd-detail.md、onboarding.md、seed-templates.md、manual-run-flow.md、output-rules.md、material-rules.md、workflow-run-rules.md、handoff.md。

当前技术方案主干已完成。下一步应补 database-schema.md、api-spec.md、implementation-plan.md。

技术实现必须保持产品/运营用户主路径，不要回退到开发者工具视角。

优先实现：任务类型入口、资料管理、Manual Assistant、Output、Workflow 恢复。

不要优先实现：代码执行、复杂 DAG、MCP、ChatGPT Action、多用户权限。
```
