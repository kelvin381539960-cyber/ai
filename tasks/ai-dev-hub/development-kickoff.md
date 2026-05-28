# AI Work Hub Development Kickoff

## 1. 当前状态

AI Work Hub 已完成从产品到技术方案的准备文档。

当前可以进入开发实现阶段。

## 2. 产品定位

```text
产品经理 / 运营的 AI 工作台
```

正式定义：

```text
面向产品、运营、技术型 PM 和个人开发者的 AI 工作流任务中台。
```

## 3. 实现原则

开发时必须遵守：

1. 用户从任务类型开始，不从 Agent / Workflow 配置开始。
2. Material 是输入核心。
3. Output 是产出核心。
4. Assistant 和 Workflow 是支撑能力。
5. Run 是底层执行记录。
6. Handoff 是 Output 的一种。
7. Git、Diff、CLI、Code Agent 是高级能力，不进入默认主流程。
8. MVP 先实现 Manual Assistant，不优先实现 CLI / MCP / Action。

## 4. 推荐新应用目录

当前仓库根目录已有其他项目，不建议混入已有目录。

建议新增：

```text
ai-work-hub/
```

目录结构：

```text
ai-work-hub/
  package.json
  next.config.js
  tsconfig.json
  README.md
  app/
    page.tsx
    onboarding/
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
    utils/
  data/
    .gitkeep
```

## 5. 首个开发目标

首个目标不是做完整系统，而是跑通真实用户闭环：

```text
初始化系统
→ 创建需求调研任务
→ 添加资料
→ 运行调研助手
→ 复制 prompt
→ 粘贴外部 AI 输出
→ 生成 Output
→ 编辑 Output
→ 标记最终版
```

## 6. 必读文档顺序

执行工具应按顺序阅读：

```text
1. handoff.md
2. technical-design.md
3. database-schema.md
4. api-spec.md
5. implementation-plan.md
6. onboarding.md
7. seed-templates.md
8. manual-run-flow.md
9. material-rules.md
10. output-rules.md
11. workflow-run-rules.md
```

## 7. 第一批实现范围

第一批只做：

```text
Phase 0：项目初始化
Phase 1：Onboarding + Seed Templates
Phase 2：Task + Material
Phase 3：Assistant + Manual Run
Phase 4：Output 管理的基础能力
```

暂不做：

```text
Workflow Runtime
CLI Assistant
MCP
ChatGPT Action
多用户权限
复杂 DAG
成本统计
```

Workflow Runtime 放到第二批。

## 8. 第一批验收标准

必须能演示：

1. 打开应用。
2. 完成初始化。
3. 进入首页。
4. 选择“做需求调研”。
5. 创建任务。
6. 添加一条文本资料。
7. 使用调研助手生成 prompt。
8. 复制 prompt。
9. 粘贴外部 AI 输出。
10. 系统生成 Output。
11. 编辑 Output。
12. 标记 Output 为最终版。

## 9. 技术选型

建议：

```text
Next.js
TypeScript
SQLite
Drizzle 或 Prisma
React Server Components / Server Actions 均可
本地文件系统
```

为降低复杂度，第一版可以选择：

```text
Next.js App Router + SQLite + Drizzle
```

## 10. 开发优先级

优先实现数据闭环，不优先追求 UI 精美。

优先级：

```text
数据模型 > API > 任务创建 > Manual Run > Output > UI 美化
```

## 11. 不允许偏离

实现中不要改成：

```text
开发者 IDE
Agent 编排平台
Workflow 节点编辑器
代码执行工具
CLI 管理平台
```

如果需要扩展，也必须先保持主线：

```text
产品/运营任务 → 资料 → 助手 → 输出
```

## 12. 给执行工具的启动提示

```text
请在仓库中新建 ai-work-hub/ 应用目录，实现 AI Work Hub MVP 第一批功能。

先阅读 tasks/ai-dev-hub/development-kickoff.md、technical-design.md、database-schema.md、api-spec.md、implementation-plan.md。

第一批只实现：初始化、默认模板、任务创建、资料添加、Manual Assistant prompt 生成、结果回填、Output 创建/编辑/标记最终版。

不要实现 CLI Assistant、MCP、ChatGPT Action、复杂 Workflow、代码执行、多用户权限。

产品主路径必须是：选择任务类型 → 添加资料 → 推荐助手和流程 → Manual Assistant 生成 prompt → 用户回填外部 AI 输出 → 保存 Output。
```
