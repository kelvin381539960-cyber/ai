# AI Work Hub MVP PRD

## 1. 文档状态

- 阶段：PRD
- 依据：`brd.md`、`ux-optimized-plan.md`
- 产品定位：产品经理 / 运营的 AI 工作台
- MVP 范围：轻量 UI + 多任务 + 资料 + 助手 + 流程 + 输出 + 执行记录

## 2. 产品目标

MVP 要实现一个可用的 AI 工作任务台，让用户可以：

1. 从任务类型直接开始。
2. 添加任务资料。
3. 使用系统推荐的默认助手和任务流程。
4. 运行流程或助手。
5. 查看和沉淀输出结果。
6. 找其他助手评审或补充。
7. 更换默认助手。
8. 生成最终结论或交接说明。

## 3. 信息架构

主导航：

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

- Run 显示为任务详情中的执行记录。
- Handoff 显示为输出的一种。

## 4. 核心对象关系

```text
Workspace 1 ── N Project / Space
Project 1 ── N Task
Task 1 ── N Material
Task 1 ── 1 Default Assistant
Task 1 ── N Assistant Run
Task 1 ── N Workflow Run
Task 1 ── N Output
Assistant 1 ── N Run
Workflow 1 ── N Workflow Run
```

## 5. 页面需求

## 5.1 首页

### 目标

让用户从“我要完成什么”开始，而不是先配置工具。

### 主入口

展示任务类型卡片：

- 做需求调研。
- 写 PRD。
- 做竞品分析。
- 做运营方案。
- 整理会议纪要。
- 做评审。
- 做数据复盘。
- 技术追问。
- 自定义任务。

### 最近任务

展示：

- 任务名称。
- 任务类型。
- 状态。
- 最近输出。
- 默认助手。

### 验收

- 用户可以从首页任务类型直接创建任务。
- 用户无需先创建 Agent 或 Workflow。

## 5.2 任务创建页

### 目标

用最少问题创建一个可执行任务。

### 字段

- 任务类型。
- 任务标题。
- 任务目标。
- 任务资料。
- 预期输出。
- 默认助手，系统推荐，可修改。
- 推荐流程，系统推荐，可修改。
- 资料范围，默认标准。

### 创建逻辑

用户选择任务类型后，系统自动推荐：

- 默认助手。
- 推荐流程。
- 输出类型。
- 资料范围。

### 验收

- 用户 4 个核心输入内可创建任务：做什么、类型、资料、输出。
- 系统能根据任务类型推荐助手和流程。

## 5.3 任务列表页

### 目标

管理多个任务。

### 展示字段

- 任务标题。
- 任务类型。
- 状态。
- 默认助手。
- 最近输出。
- 最近更新时间。

### 筛选

- 任务类型。
- 状态。
- 默认助手。
- 是否有输出。

### 操作

- 创建任务。
- 打开任务详情。
- 归档任务。

## 5.4 任务详情页

### 目标

围绕单个任务持续推进到结果。

### 区块

#### 任务概览

展示：

- 标题。
- 类型。
- 目标。
- 状态。
- 默认助手。
- 当前流程。
- 资料范围。

#### 任务资料

展示：

- 文本资料。
- 链接。
- 文件。
- 截图。
- 会议纪要。
- 用户反馈。
- 外部 AI 输出。

操作：

- 添加资料。
- 编辑资料。
- 删除资料。
- 将输出转为资料。

#### 当前输出

展示：

- 最新输出。
- 输出类型。
- 版本。
- 生成来源。

操作：

- 继续生成。
- 找其他助手看看。
- 生成最终结论。
- 复制输出。

#### 任务流程

展示：

- 当前流程。
- 步骤列表。
- 当前步骤状态。

操作：

- 运行流程。
- 继续流程。
- 更换流程。

#### 执行记录

展示：

- 执行时间。
- 使用助手。
- 输入摘要。
- 输出摘要。
- 状态。

#### 默认助手

展示：

- 默认助手名称。
- 能力。
- 资料范围。

操作：

- 继续使用默认助手。
- 找其他助手看看。
- 更换默认助手。

### 验收

- 用户可以在任务详情页添加资料。
- 用户可以运行默认助手。
- 用户可以运行流程。
- 用户可以查看输出结果。
- 用户可以找其他助手评审。
- 用户可以更换默认助手。

## 5.5 资料页

### 目标

集中查看任务资料。

### 字段

- 资料标题。
- 类型。
- 所属任务。
- 来源。
- 创建时间。

### 操作

- 添加资料。
- 编辑资料。
- 删除资料。
- 关联到任务。

### 资料类型

- text。
- url。
- file。
- image。
- meeting_note。
- user_feedback。
- competitor_info。
- ai_output。

## 5.6 助手管理页

### 目标

管理可复用 AI 助手。

### 用户可见名称

使用“助手”，不使用 Agent 作为主表达。

### 助手类型

- Manual Assistant。
- Generic CLI Assistant，高级。

### 字段

- 助手名称。
- 适用任务类型。
- 能力。
- Prompt 模板。
- 默认资料范围。
- 执行方式。
- 是否启用。

### 内置助手模板

- 调研助手。
- PRD 助手。
- 竞品分析助手。
- 运营方案助手。
- 数据分析助手。
- 会议纪要助手。
- 评审助手。
- 技术追问助手。
- 代码助手，高级。

### 验收

- 用户可以使用内置助手。
- 用户可以创建自定义助手。
- 一个助手可以被多个任务复用。

## 5.7 流程管理页

### 目标

管理可复用任务流程。

### 用户可见名称

使用“任务流程”，不强调 Workflow Builder。

### 字段

- 流程名称。
- 适用任务类型。
- 步骤列表。
- 默认助手规则。
- 是否启用。

### Step 类型

- manual_input。
- add_material。
- context_build。
- assistant_run。
- review_prompt。
- output_build。

### 内置流程模板

- 需求调研流程。
- PRD 生成流程。
- 竞品分析流程。
- 运营活动流程。
- 评审流程。
- 会议纪要流程。
- 交接总结流程。
- 开发前准备流程，高级。

### 验收

- 用户可以从模板创建流程。
- 用户可以编辑线性步骤。
- 流程可以被多个任务复用。

## 5.8 输出页

### 目标

管理任务生成的结果。

### 输出类型

- research_report。
- prd_draft。
- competitive_analysis。
- ops_plan。
- meeting_summary。
- review_result。
- action_items。
- handoff。
- custom。

### 字段

- 输出标题。
- 输出类型。
- 所属任务。
- 来源助手。
- 来源流程。
- 版本。
- 创建时间。

### 操作

- 查看输出。
- 复制输出。
- 标记为最终版本。
- 转为任务资料。
- 基于输出创建新任务。

## 5.9 设置页

### 目标

管理系统基础设置。

### 设置项

- 默认资料范围。
- 默认任务类型。
- 高级模式开关。
- CLI Assistant 配置，高级。
- 安全规则。

## 6. 关键流程

## 6.1 从任务类型创建任务

```text
首页
→ 选择任务类型
→ 填写目标
→ 添加资料
→ 系统推荐助手和流程
→ 用户确认
→ 创建任务
```

## 6.2 添加任务资料

```text
任务详情页
→ 添加资料
→ 选择资料类型
→ 填写或上传内容
→ 保存
→ 资料进入任务上下文
```

## 6.3 运行默认助手

```text
任务详情页
→ 点击继续生成
→ 系统按资料范围构建上下文
→ 调用默认助手
→ 生成输出
→ 保存执行记录
```

## 6.4 找其他助手看看

```text
任务详情页
→ 点击找其他助手看看
→ 选择助手
→ 选择原因
→ 生成 prompt 或执行
→ 保存输出
```

原因选项：

- 评审。
- 数据分析。
- 技术追问。
- 第二意见。
- 用户主动。

## 6.5 更换默认助手

```text
任务详情页
→ 点击更换默认助手
→ 选择新助手
→ 填写原因
→ 系统建议生成交接说明
→ 保存
```

## 6.6 运行任务流程

```text
任务详情页
→ 选择流程
→ 按步骤执行
→ 遇到用户输入步骤则暂停
→ 用户补充后继续
→ 生成输出
```

## 6.7 生成最终结论

```text
任务详情页
→ 点击生成最终结论
→ 系统读取任务、资料、输出、执行记录
→ 生成 Output
→ 可标记为最终版本
```

## 7. 字段定义

## 7.1 Task

| 字段 | 类型 | 必填 | 说明 |
|---|---|---:|---|
| id | string | 是 | 任务 ID |
| title | string | 是 | 标题 |
| type | enum | 是 | 任务类型 |
| goal | string | 是 | 目标 |
| expectedOutput | string | 否 | 预期输出 |
| defaultAssistantId | string | 否 | 默认助手 |
| workflowId | string | 否 | 推荐流程 |
| contextScope | enum | 是 | 简洁 / 标准 / 完整 |
| status | enum | 是 | 状态 |
| createdAt | datetime | 是 | 创建时间 |
| updatedAt | datetime | 是 | 更新时间 |

## 7.2 Material

| 字段 | 类型 | 必填 | 说明 |
|---|---|---:|---|
| id | string | 是 | 资料 ID |
| taskId | string | 是 | 任务 ID |
| type | enum | 是 | text / url / file / image / meeting_note / user_feedback / competitor_info / ai_output |
| title | string | 是 | 标题 |
| content | string | 否 | 内容 |
| filePath | string | 否 | 文件路径 |
| sourceUrl | string | 否 | 链接 |
| createdAt | datetime | 是 | 创建时间 |

## 7.3 Assistant

| 字段 | 类型 | 必填 | 说明 |
|---|---|---:|---|
| id | string | 是 | 助手 ID |
| name | string | 是 | 名称 |
| type | enum | 是 | manual / cli |
| applicableTaskTypes | string[] | 否 | 适用任务类型 |
| capabilities | string[] | 是 | 能力 |
| promptTemplate | string | 否 | Prompt 模板 |
| defaultContextScope | enum | 是 | 简洁 / 标准 / 完整 |
| enabled | boolean | 是 | 是否启用 |

## 7.4 Workflow

| 字段 | 类型 | 必填 | 说明 |
|---|---|---:|---|
| id | string | 是 | 流程 ID |
| name | string | 是 | 名称 |
| applicableTaskTypes | string[] | 否 | 适用任务类型 |
| description | string | 否 | 描述 |
| steps | Step[] | 是 | 步骤 |
| enabled | boolean | 是 | 是否启用 |

## 7.5 Output

| 字段 | 类型 | 必填 | 说明 |
|---|---|---:|---|
| id | string | 是 | 输出 ID |
| taskId | string | 是 | 任务 ID |
| type | enum | 是 | 输出类型 |
| title | string | 是 | 标题 |
| content | string | 是 | 内容 |
| sourceRunIds | string[] | 否 | 来源执行记录 |
| version | number | 是 | 版本 |
| isFinal | boolean | 是 | 是否最终版本 |
| createdAt | datetime | 是 | 创建时间 |

## 7.6 Run

| 字段 | 类型 | 必填 | 说明 |
|---|---|---:|---|
| id | string | 是 | 执行记录 ID |
| taskId | string | 是 | 任务 ID |
| assistantId | string | 是 | 助手 ID |
| reason | string | 否 | 调用原因 |
| contextScope | enum | 是 | 资料范围 |
| prompt | string | 是 | 输入 prompt |
| result | string | 否 | 输出结果 |
| status | enum | 是 | 状态 |
| createdAt | datetime | 是 | 创建时间 |
| completedAt | datetime | 否 | 完成时间 |

## 8. 资料范围规则

### 简洁

包含：

- 任务目标。
- 最新输出。
- 用户本次输入。

### 标准

包含：

- 任务目标。
- 任务资料摘要。
- 最近输出。
- 当前流程步骤。

### 完整

包含：

- 全部任务资料。
- 历史输出。
- 关键执行记录。
- 相关文件。

默认：标准。

## 9. 状态定义

## 9.1 Task 状态

```text
draft
ready
running
blocked
reviewing
done
archived
```

## 9.2 Run 状态

```text
pending
running
waiting_user
success
failed
cancelled
timeout
```

## 9.3 Workflow Run 状态

```text
pending
running
waiting_user
success
failed
cancelled
```

## 10. 安全规则

MVP 必须遵守：

- 不自动 push。
- 不自动 merge。
- 不自动 deploy。
- 不直接修改密钥文件。
- CLI 助手属于高级能力。
- Web UI 不建议直接公网暴露。
- 用户资料和输出需要本地/私有保存。

## 11. 验收标准

MVP 完成后必须通过以下验收：

1. 用户可以从首页选择任务类型开始。
2. 用户可以创建任务并添加资料。
3. 系统可以推荐默认助手和流程。
4. 用户可以运行默认助手。
5. 用户可以运行任务流程。
6. 用户可以查看输出结果。
7. 用户可以将输出转为资料。
8. 用户可以找其他助手评审。
9. 用户可以更换默认助手。
10. 系统保存执行记录。
11. 系统可以生成最终结论 / 交接说明。
12. 用户无需先理解 Agent / Workflow 才能开始。
13. Git / CLI / Code Agent 不出现在默认主流程中。

## 12. MVP 不做

- 完整 IDE。
- 在线代码编辑器。
- 复杂 DAG Workflow。
- Workflow 条件分支。
- Workflow 并行步骤。
- 多 Agent 自动智能编排。
- 自动 commit。
- 自动 push。
- 自动 merge。
- 自动 deploy。
- 成本统计。
- 偏好记忆。
- 多用户权限。
- 公网 SaaS。
- ChatGPT Action。
- MCP Server。

## 13. 后续预留

MVP 数据模型和服务设计需预留：

- REST API。
- ChatGPT Action。
- MCP Server。
- HTTP Assistant。
- Workflow 条件分支。
- Workflow DAG。
- 成本统计。
- 偏好记忆。
- 开发者模式。
