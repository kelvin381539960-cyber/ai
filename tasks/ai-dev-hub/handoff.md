# AI Work Hub Handoff

## 当前状态

已根据两条核心反馈完成方案优化：

1. 产品要更适合产品经理、运营使用。
2. 用户体验要从“管理 Agent / Workflow”改为“完成任务”。

新增：

```text
tasks/ai-dev-hub/ux-optimized-plan.md
```

更新：

```text
tasks/ai-dev-hub/brd.md
tasks/ai-dev-hub/prd.md
```

## 当前定位

产品定位已调整为：

```text
产品经理 / 运营的 AI 工作台
```

正式定义：

```text
面向产品、运营、技术型 PM 和个人开发者的 AI 工作流任务中台。
```

## 核心变化

### 1. 用户主路径调整

旧路径：

```text
创建 Agent → 创建 Workflow → 创建 Task → Run → Handoff
```

新路径：

```text
选择任务类型 → 填写目标 → 添加资料 → 系统推荐助手和流程 → 开始执行 → 查看输出 → 继续优化 / 评审 → 生成最终结论
```

### 2. 用户表达调整

| 底层对象 | UI 名称 |
|---|---|
| Agent | 助手 |
| Primary Agent | 默认助手 |
| Supporting Agent | 其他助手 |
| Workflow | 任务流程 |
| Run | 执行记录 |
| Handoff | 任务结论 / 交接说明 |
| Context Mode | 资料范围 |
| Source / Material | 任务资料 |
| Output | 输出结果 |

### 3. 新增核心对象

新增：

```text
Material / Source
Output
```

Material 是产品/运营任务的核心输入。

Output 是产品/运营用户真正关心的产出。

Handoff 是 Output 的一种。

### 4. 导航调整

推荐主导航：

```text
首页
任务
资料
助手
流程
输出
设置
```

Run 和 Handoff 不作为一级导航。

### 5. 开发能力降级

Git / Diff / CLI / Code Agent 保留，但降级为高级能力，不作为默认主流程。

## 当前推荐 MVP 闭环

```text
选任务类型
→ 填目标
→ 加资料
→ 系统推荐默认助手和任务流程
→ 点击开始
→ 查看输出
→ 添加资料或找其他助手评审
→ 生成最终结论 / 交接说明
```

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
评审流程
会议纪要流程
交接总结流程
开发前准备流程（高级）
```

## 下一步建议

当前 PRD 已按优化方案更新。

建议下一步进入技术方案设计，但技术方案必须遵守：

1. 用户主路径从任务类型开始。
2. Material 和 Output 是核心对象。
3. Agent / Workflow 是底层能力组件。
4. Run / Handoff 不作为用户主导航。
5. 开发者能力作为高级能力。
6. 默认服务产品/运营场景。

## 给下一个 AI 工具的接力提示

```text
请先阅读 tasks/ai-dev-hub/ux-optimized-plan.md、brd.md、prd.md、handoff.md。

当前方案已经从“AI 开发任务中台”调整为“产品经理 / 运营的 AI 工作台”。

不要再把用户主路径设计成创建 Agent / 创建 Workflow。用户主路径必须是：选择任务类型 → 添加资料 → 推荐助手和流程 → 生成输出。

Material / Source 和 Output 是核心对象。Agent / Workflow / Run / Handoff 是支撑对象。

Git、Diff、CLI、Code Agent 是高级能力，不是默认主流程。
```
