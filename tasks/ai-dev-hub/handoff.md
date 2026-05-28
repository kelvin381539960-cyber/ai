# AI Dev Hub Handoff

## 当前状态

任务资料处于 BRD 调整阶段，目录位于：

```text
tasks/ai-dev-hub/
```

已根据用户最新反馈更新任务执行策略：

```text
同一任务大概率由同一个 CLI / Agent 完成。
不同任务可能选择不同工具。
任务执行中切换工具是少数情况。
```

因此 BRD 已引入：

```text
Primary Agent / Supporting Agent
```

并新增：

```text
tasks/ai-dev-hub/task-agent-strategy.md
```

## 已完成

- 明确产品方向：AI 开发任务中台，而不是自研完整 IDE。
- 明确 Agent 和 Workflow 是能力组件，不是产品定位。
- 明确 External AI Control Layer 是扩展入口，不进入 MVP 主线。
- 明确部署位置：私有服务器优先，可使用腾讯云服务器。
- 明确不绑定任何单一 AI 工具。
- 明确 MVP 必须有 UI。
- 明确 MVP 支持多任务管理。
- 明确 MVP 支持多个 Agent。
- 明确 MVP 支持多个 Workflow。
- 明确 MVP 支持简单线性 Workflow。
- 明确任务级 Primary Agent 策略。
- 明确 Supporting Agent 只在评审、异常、额度、能力不足等场景使用。
- 更新 BRD：`brd.md`。
- 新增任务 Agent 策略：`task-agent-strategy.md`。

## 当前关键结论

1. 产品定位是 AI 开发任务中台。
2. Agent 不是产品定位，只是可复用执行组件。
3. Workflow 不是产品定位，只是固定流程模板能力。
4. MVP 必须有轻量 UI。
5. MVP 必须支持多个 Task、多个 Agent、多个 Workflow。
6. 每个 Task 可以指定 Primary Agent。
7. 同一任务默认由 Primary Agent 持续执行。
8. Supporting Agent 只在必要场景调用。
9. Workflow Step 默认使用任务 Primary Agent，除非显式指定 Supporting Agent。
10. Handoff 用于阶段总结和少数切换场景，不是每一步都切换。
11. 必须支持 Context Mode，避免 token 失控。

## 当前推荐 MVP 闭环

```text
初始化项目 → 创建多个 Agent → 创建多个 Workflow → 创建多个任务 → 为任务选择 Primary Agent → 用 Primary Agent 执行任务 → 必要时调用 Supporting Agent → 保存结果 → 生成 Handoff
```

## 当前需要用户确认

请用户继续确认 `brd.md`。

重点确认：

1. 产品定位是否改对：AI 开发任务中台。
2. Primary Agent / Supporting Agent 策略是否符合实际场景。
3. 多任务、多 Agent、多 Workflow 扩展性是否满足预期。
4. MVP 不做范围是否足够明确。
5. 是否可以进入 PRD。

## 下一步建议

用户确认 BRD 后，进入 PRD。

PRD 应重点展开：

1. Task 创建时选择 Primary Agent。
2. Task 详情页展示 Primary Agent。
3. Supporting Agent 调用入口。
4. Workflow Step 默认 Agent 规则。
5. Context Mode 规则。
6. Handoff 生成规则。
7. Agent 切换原因记录。

## 给下一个 AI 工具的接力提示

```text
请先阅读 tasks/ai-dev-hub/brd.md、task-agent-strategy.md、handoff.md。

当前阶段是 BRD 确认。不要进入 PRD 或技术方案，除非用户确认 BRD。

当前用户已明确：同一任务大概率由同一个 CLI / Agent 完成，不同任务才可能切换工具。方案必须以 Task Primary Agent 为主，Supporting Agent 只在评审、异常、额度不足、能力不足、第二意见等场景使用。

请不要把系统设计成任务内频繁多 Agent 自动切换。请不要实现完整 IDE、复杂 DAG、多 Agent 自动智能编排、自动 push / merge / deploy，也不要把任何具体 AI 工具写死为唯一执行器。
```
