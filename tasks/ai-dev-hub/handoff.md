# AI Dev Hub Handoff

## 当前状态

任务资料处于 BRD 调整阶段，目录位于：

```text
tasks/ai-dev-hub/
```

已根据用户反馈更新：

```text
tasks/ai-dev-hub/brd.md
```

用户反馈：

1. V0 页面范围可以，但必须确认扩展性，例如多个 Workflow、多个任务。
2. Workflow V0 只做线性步骤可以。
3. V0 不做范围之前不够明确，需要写清楚。
4. Agent 预设和 Workflow 可以做，但产品定位不是这个。

本次调整：

1. 明确产品定位是 AI 开发任务中台。
2. Agent 和 Workflow 降级为能力组件，不作为产品定位。
3. 明确支持多任务、多 Agent、多 Workflow。
4. 明确一个 Agent / Workflow 可被多个 Task 复用。
5. 明确 V0 不做范围和后续扩展边界。

## 已完成

- 明确产品方向：AI 开发任务中台，而不是自研完整 IDE。
- 明确 Agent 和 Workflow 是能力组件，不是产品定位。
- 明确部署位置：私有服务器优先，可使用腾讯云服务器。
- 明确多电脑场景：公司电脑和个人电脑访问同一个远程 AI 开发现场。
- 明确不绑定任何单一 AI 工具。
- 明确 V0 必须有 UI。
- 明确 V0 支持多任务管理。
- 明确 V0 支持多个 Agent。
- 明确 V0 支持多个 Workflow。
- 明确 V0 支持简单线性 Workflow。
- 更新 BRD：`brd.md`。

## 当前关键结论

1. 产品定位是 AI 开发任务中台。
2. Agent 不是产品定位，只是可复用执行组件。
3. Workflow 不是产品定位，只是固定流程模板能力。
4. V0 必须有轻量 UI。
5. V0 必须支持多个 Task、多个 Agent、多个 Workflow。
6. Workflow 只做线性步骤，不做复杂 DAG。
7. 任务声明所需能力，Agent 声明可提供能力。
8. 具体工具通过 Adapter 接入。
9. V0 支持 Manual Agent 和 Generic CLI Agent。
10. 不做完整 IDE、代码编辑器、复杂 DAG、自动部署、多用户权限、成本统计。

## 当前推荐 V0 闭环

```text
初始化项目 → 创建多个 Agent → 创建多个 Workflow → 创建多个任务 → 在任务中运行 Agent/Workflow → 保存结果 → 生成 Handoff → 后续继续接力
```

## 当前需要用户确认

请用户继续确认 `brd.md`。

重点确认：

1. 产品定位是否改对：AI 开发任务中台，而不是 Agent/Workflow 平台。
2. 多任务、多 Agent、多 Workflow 扩展性是否满足预期。
3. V0 不做范围是否足够明确。
4. 是否可以进入 PRD。

## 下一步建议

用户确认 BRD 后，进入 PRD。

PRD 应输出：

1. 信息架构。
2. 页面流程。
3. 字段定义。
4. 多任务关系。
5. 多 Agent 关系。
6. 多 Workflow 关系。
7. Agent 创建流程。
8. Workflow 创建流程。
9. Workflow Run 流程。
10. Manual Agent 回填流程。
11. Handoff 生成规则。
12. V0 验收标准。

## 给下一个 AI 工具的接力提示

```text
请先阅读 tasks/ai-dev-hub/brd.md、handoff.md。

当前阶段是 BRD 确认。不要进入 PRD 或技术方案，除非用户确认 BRD。

当前用户已明确：V0 要有 UI，并且要支持创建固定 Workflow，例如 pre-work workflow、调研 workflow。但产品定位不是 Agent/Workflow 平台，而是 AI 开发任务中台。Agent 和 Workflow 是能力组件。

请不要实现完整 IDE、复杂 DAG、多 Agent 自动智能编排、自动 push / merge / deploy，也不要把任何具体 AI 工具写死为唯一执行器。
```
