# AI Work Hub Handoff

## 当前状态

用户明确希望产品更适合产品经理、运营使用。

因此产品定位已从：

```text
AI 开发任务中台
```

调整为：

```text
AI 工作流任务中台
```

原 `AI Dev Hub` 作为代号保留，产品名建议改为：

```text
AI Work Hub
```

已新增：

```text
tasks/ai-dev-hub/positioning-pm-ops.md
```

已更新：

```text
tasks/ai-dev-hub/brd.md
```

## 已完成

- 明确产品不应只服务开发者。
- 明确优先用户是产品经理、运营、技术型 PM、个人开发者。
- 明确产品定位为 AI 工作流任务中台。
- 明确开发任务只是重要扩展场景，不是唯一主线。
- 明确 UI 不应默认围绕 Git、Diff、CLI。
- 明确 Agent 模板要增加 Research、PRD、Ops、Data、Meeting 等产品/运营向模板。
- 明确 Workflow 模板要增加需求调研、PRD 生成、竞品分析、运营活动、会议纪要等模板。

## 当前关键结论

1. 产品定位：AI 工作流任务中台。
2. 首要用户：产品经理 / 运营 / 技术型 PM。
3. 开发者是重要用户，但不再是唯一主线。
4. Primary Agent 策略仍然成立。
5. Workflow 仍然只做线性步骤。
6. Agent / Workflow 仍然只是能力组件。
7. External AI Control Layer 仍然作为扩展预留。
8. MVP 仍然是轻量 UI + 多任务 + 多 Agent + 多 Workflow + Run + Handoff。

## 新默认 Agent 模板

```text
Research Agent
PRD Agent
Review Agent
Ops Planning Agent
Data Analysis Agent
Meeting Summary Agent
Handoff Agent
Tech Review Agent
Code Agent
```

## 新默认 Workflow 模板

```text
需求调研 Workflow
PRD 生成 Workflow
竞品分析 Workflow
运营活动 Workflow
评审 Workflow
会议纪要 Workflow
交接总结 Workflow
开发 Pre-work Workflow
```

## 当前需要调整

PRD 需要同步从开发者视角调整到产品/运营视角。

重点调整：

1. 页面命名从 Project/Git 导向改为 Workspace/Project/Task 导向。
2. Task 类型增加 research、prd、ops_plan、data_analysis、meeting_summary。
3. Agent 模板改成产品/运营优先。
4. Workflow 模板改成产品/运营优先。
5. Git、CLI、Diff 降级为开发者模式或高级能力。
6. Handoff 可以叫 Handoff / 任务结论。

## 给下一个 AI 工具的接力提示

```text
请先阅读 tasks/ai-dev-hub/positioning-pm-ops.md、brd.md、handoff.md。

当前用户已明确：产品要更适合产品经理、运营使用，不应只围绕开发者和 CLI。请把产品定位从 AI 开发任务中台调整为 AI 工作流任务中台。

PRD 需要同步更新为产品/运营优先：调研、PRD、竞品分析、运营活动、会议纪要、评审、交接总结是默认场景。代码、CLI、Git、Diff 应作为高级/扩展场景。

不要把产品做成 IDE、代码编辑器、Agent 市场、复杂 Workflow 平台或多 Agent 自动编排平台。
```
