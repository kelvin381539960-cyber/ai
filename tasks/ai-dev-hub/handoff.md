# AI Work Hub Handoff

## 当前状态

PRD 已完成细化，可以进入技术方案设计阶段。

已新增：

```text
tasks/ai-dev-hub/prd-detail.md
```

当前产品定位：

```text
产品经理 / 运营的 AI 工作台
```

正式定义：

```text
面向产品、运营、技术型 PM 和个人开发者的 AI 工作流任务中台。
```

## 已完成文档

核心文档：

```text
brd.md
prd.md
prd-detail.md
ux-optimized-plan.md
positioning-pm-ops.md
```

支撑文档：

```text
agent-presets.md
workflow-spec.md
task-agent-strategy.md
external-ai-control.md
data-model.md
adapter-runtime.md
workspace-spec.md
```

## 当前方案主线

用户主路径：

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
Run
Output
Handoff
```

其中：

- Material 是任务输入核心。
- Output 是任务产出核心。
- Handoff 是 Output 的一种。
- Run 是底层执行记录。
- Agent 在 UI 中叫助手。
- Workflow 在 UI 中叫任务流程。

## 当前默认任务类型

```text
需求调研
PRD 生成
竞品分析
运营方案
会议纪要
评审
数据复盘
技术追问
自定义任务
```

## 当前默认助手模板

```text
调研助手
PRD 助手
竞品分析助手
运营方案助手
数据分析助手
会议纪要助手
评审助手
技术追问助手
代码助手（高级）
```

## 当前默认流程模板

```text
需求调研流程
PRD 生成流程
竞品分析流程
运营活动流程
会议纪要流程
评审流程
数据复盘流程
技术追问流程
开发前准备流程（高级）
```

## 当前关键产品原则

1. 用户从任务类型开始，不从 Agent / Workflow 配置开始。
2. 产品/运营优先。
3. 资料和输出是核心对象。
4. 助手和流程是支撑能力。
5. Run 和 Handoff 不作为一级导航。
6. Git、Diff、CLI、Code Agent 是高级能力。
7. 默认一个任务由一个默认助手持续推进。
8. 用户可以随时找其他助手看看，也可以更换默认助手。
9. 资料范围默认标准，避免 token 失控。

## 下一步建议

进入技术方案设计。

技术方案需要输出：

1. 总体架构。
2. 前后端技术栈。
3. 数据模型。
4. 文件存储结构。
5. Assistant Runtime。
6. Workflow Runtime。
7. Context Builder。
8. Output Generator。
9. Material 管理。
10. 安全策略。
11. MVP 实现计划。

## 给下一个 AI 工具的接力提示

```text
请先阅读 tasks/ai-dev-hub/brd.md、prd.md、prd-detail.md、ux-optimized-plan.md、handoff.md。

当前 PRD 已完成，可以进入技术方案设计。

技术方案必须围绕产品/运营用户体验展开，不要回退到开发者工具视角。

用户主路径必须是：选择任务类型 → 添加资料 → 推荐助手和流程 → 生成输出。

Material / Source 和 Output 是核心对象。Assistant / Workflow / Run / Handoff 是支撑对象。

Git、Diff、CLI、Code Agent 是高级能力，不是默认主流程。
```
