# AI Dev Hub Handoff

## 当前状态

BRD 已确认，项目进入 PRD 阶段。

已新增：

```text
tasks/ai-dev-hub/prd.md
```

当前 PRD 已覆盖：

- 页面范围。
- 页面字段。
- 核心流程。
- Primary Agent / Supporting Agent。
- Agent 创建。
- Workflow 创建。
- Workflow Run。
- Manual Agent 回填。
- Context Mode。
- Handoff 生成。
- 安全规则。
- MVP 验收标准。

## 已完成

- 明确产品定位：AI 开发任务中台。
- 明确 Agent 和 Workflow 是能力组件。
- 明确 MVP 必须有 UI。
- 明确支持多任务、多 Agent、多 Workflow。
- 明确任务级 Primary Agent 策略。
- 明确用户可以随时临时运行其他 Agent。
- 明确用户可以随时切换 Primary Agent。
- 明确 Workflow 默认使用任务 Primary Agent。
- 明确 Supporting Agent 只在必要场景调用。
- 明确 Context Mode，控制 token 成本。
- 新增 PRD：`prd.md`。

## 当前关键结论

1. 产品定位是 AI 开发任务中台。
2. MVP 是轻量 UI + 多任务 + 多 Agent + 多 Workflow + Run + Handoff。
3. 每个 Task 可以指定 Primary Agent。
4. 同一任务默认由 Primary Agent 持续执行。
5. 用户可以随时临时运行其他 Agent。
6. 用户可以随时正式切换 Primary Agent。
7. Supporting Agent 用于评审、安全检查、架构检查、异常、额度不足、第二意见等场景。
8. Workflow 只做线性步骤，不做复杂 DAG。
9. 系统不绑定任何具体 AI 工具。
10. External AI Control Layer 作为后续扩展预留，不进入 MVP。

## 当前 PRD 核心闭环

```text
初始化项目 → 创建 Agent → 创建 Workflow → 创建任务 → 选择 Primary Agent → 运行 Primary Agent / Workflow → 必要时运行 Supporting Agent → 保存 Run → 生成 Handoff
```

## 当前需要用户确认

请用户确认 `prd.md`。

重点确认：

1. 页面范围是否正确。
2. 任务详情页是否满足实际操作。
3. Primary Agent / Supporting Agent 流程是否合理。
4. Workflow 线性步骤是否足够作为 MVP。
5. Context Mode 是否满足 token 控制诉求。
6. 是否可以进入技术方案设计。

## 下一步建议

用户确认 PRD 后，进入技术方案设计。

技术方案应输出：

1. 系统架构。
2. 前后端模块划分。
3. 数据模型。
4. 文件系统 `.ai/` 存储方案。
5. Agent Adapter Runtime。
6. Workflow Runtime。
7. Context Builder。
8. Handoff Generator。
9. 安全策略。
10. MVP 开发计划。

## 给下一个 AI 工具的接力提示

```text
请先阅读 tasks/ai-dev-hub/brd.md、prd.md、task-agent-strategy.md、handoff.md。

当前阶段是 PRD 确认。不要进入技术方案，除非用户确认 PRD。

必须保持产品定位：AI 开发任务中台。

必须保持核心策略：同一任务默认由 Primary Agent 持续执行，但用户可以随时临时运行其他 Agent，也可以正式切换 Primary Agent。

请不要实现完整 IDE、复杂 DAG、多 Agent 自动智能编排、自动 push / merge / deploy，也不要把任何具体 AI 工具写死为唯一执行器。
```
