# AI Dev Hub Handoff

## 当前状态

任务资料已更新为“V0 需要轻量 UI + Workflow 能力”，目录位于：

```text
tasks/ai-dev-hub/
```

用户明确要求：

1. V0 要有 UI。
2. V0 希望支持创建固定 Workflow，例如 pre-work workflow、调研 workflow。

因此 V0 不再定义为纯 CLI，而是轻量 UI + Agent + Workflow 的最小闭环。

## 已完成

- 明确产品方向：AI 开发任务中台，而不是自研完整 IDE。
- 明确部署位置：私有服务器优先，可使用腾讯云服务器。
- 明确多电脑场景：公司电脑和个人电脑访问同一个远程 AI 开发现场。
- 明确不绑定任何单一 AI 工具。
- 明确 V0 必须有 UI。
- 明确 V0 支持用户手动创建常用 Agent。
- 明确 V0 支持用户创建简单线性 Workflow。
- 新增能力模型：`capability-model.md`。
- 新增 Agent Adapter 规范：`agent-adapter-spec.md`。
- 新增数据模型：`data-model.md`。
- 新增 CLI 命令规格：`cli-spec.md`。
- 新增 `.ai/` 工作区规范：`workspace-spec.md`。
- 新增 Adapter Runtime 设计：`adapter-runtime.md`。
- 新增 Agent 预设方案：`agent-presets.md`。
- 新增 Workflow 方案：`workflow-spec.md`。
- 更新 V0 范围：`v0-scope.md`。
- 更新 UI 页面方案：`screen-spec.md`。
- 更新 README。

## 当前关键结论

1. 不要从自研 IDE 开始。
2. 先做 AI Dev Hub，即 AI 开发任务中台。
3. 不绑定任何单一 AI 工具。
4. V0 必须有轻量 UI。
5. V0 必须支持 Agent 管理。
6. V0 必须支持简单 Workflow 管理。
7. Workflow 只做线性步骤，不做复杂 DAG。
8. 任务声明所需能力，Agent 声明可提供能力。
9. 具体工具通过 Adapter 接入。
10. V0 必须支持 Manual Agent 和 Generic CLI Agent。
11. 用户可以手动创建常用 Agent，用的时候直接调用。
12. 评审 Agent 是 V0 应支持的典型用例。

## 当前推荐 V0 闭环

```text
初始化项目 → 创建 Agent → 创建 Workflow → 创建任务 → 运行 Workflow/Agent → 保存结果 → 生成 Handoff
```

## V0 UI 页面

```text
项目页
Agent 管理页
Workflow 管理页
任务页
Run 记录页
Handoff 页
```

## V0 推荐 Workflow 模板

```text
Pre-work Workflow
Research Workflow
Review Workflow
```

## V0 推荐 Agent 模板

```text
review-basic
security-review
architecture-review
research-basic
handoff-summary
```

## 下一步建议

按正常项目流程继续：

1. 更新 BRD，明确 V0 有 UI 和 Workflow。
2. BRD 确认后输出 PRD。
3. PRD 确认后输出技术方案。
4. 技术方案确认后再进入实现。

## 给下一个 AI 工具的接力提示

```text
请先阅读 tasks/ai-dev-hub/README.md、v0-scope.md、agent-presets.md、workflow-spec.md、screen-spec.md、handoff.md。

当前用户已明确：V0 要有 UI，并且要支持创建固定 Workflow，例如 pre-work workflow、调研 workflow。

请不要继续按纯 CLI V0 方案推进。现在 V0 是轻量 UI + Agent 预设 + 线性 Workflow + Run 记录 + Handoff。

请不要实现完整 IDE、复杂 DAG、多 Agent 自动智能编排、自动 push / merge / deploy，也不要把任何具体 AI 工具写死为唯一执行器。
```

## 风险提醒

- V0 加入 UI 和 Workflow 后范围变大，需要避免做成复杂平台。
- Workflow 只能做线性步骤，不能在 V0 做 DAG。
- UI 只做操作台，不做代码编辑器。
- 如果涉及公司代码，必须确认公司是否允许代码部署到个人服务器。
- Web UI 不应直接裸露公网。
- 密钥不能进入 Git 仓库。
