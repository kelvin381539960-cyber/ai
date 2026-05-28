# 产品经理/运营向定位调整

## 1. 结论

AI Dev Hub 不应只定位为 AI 开发任务中台。

更适合的定位是：

```text
AI 工作流任务中台
```

核心用户优先级调整为：

```text
产品经理 / 运营 / 技术型 PM / 个人开发者
```

开发者仍然是重要用户，但不再是唯一主场景。

## 2. 为什么调整

产品经理和运营的实际痛点不是“让 AI 写代码”，而是：

- 多个 AI 工具分散。
- 调研、竞品、PRD、评审、数据分析、运营方案等流程无法沉淀。
- 每次都要重新写 prompt。
- 不同工具输出无法统一管理。
- 任务进度和结论散落在聊天记录中。
- 需要固定 workflow，但不想搭复杂自动化平台。
- 希望一个任务可以持续沉淀上下文、结果和交接。

## 3. 新产品定位

AI Dev Hub 是面向产品经理、运营、技术型 PM 和个人开发者的 AI 工作流任务中台。

它帮助用户：

- 管理多个 AI 工作任务。
- 创建可复用 Agent。
- 创建固定 Workflow。
- 保存每次 AI 输出。
- 生成任务结论和 Handoff。
- 在不同 AI 工具之间保持任务现场。

## 4. 新核心场景

### 4.1 产品经理场景

- 需求调研。
- 竞品分析。
- 用户反馈整理。
- PRD 初稿生成。
- PRD 评审。
- 需求拆解。
- 版本规划。
- 会议纪要总结。
- 技术方案追问。

### 4.2 运营场景

- 活动方案策划。
- 内容选题。
- 文案生成。
- 数据复盘。
- 用户分层分析。
- 社群运营 SOP。
- 增长实验设计。
- 投放素材评审。

### 4.3 技术型 PM 场景

- 开发前需求澄清。
- 技术方案评审。
- 接口文档理解。
- Bug 复盘。
- 跨工具任务交接。
- AI 辅助验收。

### 4.4 开发者场景

- 代码任务管理。
- CLI Agent 执行。
- Review。
- Handoff。
- Context 管理。

## 5. Agent 模板调整

MVP 推荐内置 Agent 模板应调整为：

```text
Research Agent
PRD Agent
Review Agent
Ops Planning Agent
Data Analysis Agent
Meeting Summary Agent
Handoff Agent
Tech Review Agent
```

开发类 Agent 作为可选模板：

```text
Code Agent
Security Review Agent
Architecture Review Agent
```

## 6. Workflow 模板调整

MVP 推荐 Workflow 模板：

```text
需求调研 Workflow
PRD 生成 Workflow
竞品分析 Workflow
运营活动 Workflow
评审 Workflow
会议纪要 Workflow
交接总结 Workflow
```

开发类 Workflow 作为扩展模板：

```text
Pre-work Workflow
Code Review Workflow
Research for Engineering Workflow
```

## 7. Primary Agent 策略仍然成立

产品/运营任务也适用 Primary Agent 策略。

例如：

- 一个 PRD 任务默认由 PRD Agent 负责。
- 一个运营方案任务默认由 Ops Planning Agent 负责。
- 一个调研任务默认由 Research Agent 负责。
- Review Agent 作为 Supporting Agent 介入。

## 8. UI 调整方向

UI 不应显得像开发工具。

推荐信息架构：

```text
任务
Agent
Workflow
运行记录
结论/Handoff
项目/空间
设置
```

避免首屏强调：

- Git。
- CLI。
- 代码。
- Diff。

这些应放到高级能力或开发者模式。

## 9. MVP 不变的核心

MVP 仍然是：

```text
轻量 UI + 多任务 + 多 Agent + 多 Workflow + Run + Handoff
```

变化是默认场景：

```text
从开发任务优先
调整为产品/运营工作流优先
```

## 10. 产品命名建议

如果继续叫 AI Dev Hub，容易偏开发者。

可考虑后续改名：

```text
AI Work Hub
AI Task Hub
AI Workflow Hub
AIX Hub
```

暂时文档目录仍保留 `ai-dev-hub`，但产品定位改为 AI 工作流任务中台。
