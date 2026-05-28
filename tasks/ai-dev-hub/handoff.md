# AI Dev Hub Handoff

## 当前状态

任务资料已进入“BRD 阶段”，目录位于：

```text
tasks/ai-dev-hub/
```

已新增：

```text
tasks/ai-dev-hub/brd.md
```

BRD 已按用户要求调整：

1. V0 必须有 UI。
2. V0 支持创建固定 Workflow，例如 pre-work workflow、调研 workflow。
3. V0 支持用户手动创建常用 Agent，例如评审 Agent。
4. 输出保持核心内容，不写冗余说明。

## 已完成

- 明确产品方向：AI 开发任务中台，而不是自研完整 IDE。
- 明确部署位置：私有服务器优先，可使用腾讯云服务器。
- 明确多电脑场景：公司电脑和个人电脑访问同一个远程 AI 开发现场。
- 明确不绑定任何单一 AI 工具。
- 明确 V0 必须有 UI。
- 明确 V0 支持用户手动创建常用 Agent。
- 明确 V0 支持用户创建简单线性 Workflow。
- 新增 BRD：`brd.md`。
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

## 当前需要用户确认

请用户先确认 `brd.md`。

确认点：

1. V0 页面范围是否正确：项目页、Agent 管理页、Workflow 管理页、任务页、Run 记录页、Handoff 页。
2. V0 Workflow 是否只做线性步骤。
3. V0 是否不做 IDE、不做代码编辑器、不做复杂 DAG。
4. V0 是否把 Agent 预设和 Workflow 作为核心能力。

## 下一步建议

用户确认 BRD 后，进入 PRD。

PRD 应输出：

1. 信息架构。
2. 页面流程。
3. 字段定义。
4. Agent 创建流程。
5. Workflow 创建流程。
6. Workflow Run 流程。
7. Manual Agent 回填流程。
8. Handoff 生成规则。
9. V0 验收标准。

## 给下一个 AI 工具的接力提示

```text
请先阅读 tasks/ai-dev-hub/brd.md、v0-scope.md、agent-presets.md、workflow-spec.md、screen-spec.md、handoff.md。

当前阶段是 BRD 确认。不要进入 PRD 或技术方案，除非用户确认 BRD。

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
