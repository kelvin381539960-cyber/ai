# AI Dev Hub Handoff

## 当前状态

任务资料处于 BRD 调整阶段，目录位于：

```text
tasks/ai-dev-hub/
```

已根据用户反馈新增外部 AI 接入扩展方案：

```text
tasks/ai-dev-hub/external-ai-control.md
```

当前 BRD 已明确：

1. 产品定位是 AI 开发任务中台。
2. Agent、Workflow、External AI Control Layer 都是能力组件，不是产品定位本身。
3. V0 不实现 ChatGPT Action / MCP Server，但模型和服务设计要预留扩展。
4. V1 可做 REST API + ChatGPT Action。
5. V2 可做 MCP Server。

## 已完成

- 明确产品方向：AI 开发任务中台，而不是自研完整 IDE。
- 明确 Agent 和 Workflow 是能力组件，不是产品定位。
- 明确 External AI Control Layer 是 V1/V2 扩展，不进入 V0。
- 明确部署位置：私有服务器优先，可使用腾讯云服务器。
- 明确多电脑场景：公司电脑和个人电脑访问同一个远程 AI 开发现场。
- 明确不绑定任何单一 AI 工具。
- 明确 V0 必须有 UI。
- 明确 V0 支持多任务管理。
- 明确 V0 支持多个 Agent。
- 明确 V0 支持多个 Workflow。
- 明确 V0 支持简单线性 Workflow。
- 新增外部 AI 控制层方案：`external-ai-control.md`。
- 更新 BRD：`brd.md`。

## 当前关键结论

1. 产品定位是 AI 开发任务中台。
2. Agent 不是产品定位，只是可复用执行组件。
3. Workflow 不是产品定位，只是固定流程模板能力。
4. External AI Control Layer 不是产品定位，只是后续外部控制入口。
5. V0 必须有轻量 UI。
6. V0 必须支持多个 Task、多个 Agent、多个 Workflow。
7. Workflow 只做线性步骤，不做复杂 DAG。
8. 任务声明所需能力，Agent 声明可提供能力。
9. 具体工具通过 Adapter 接入。
10. V0 支持 Manual Agent 和 Generic CLI Agent。
11. V1 可开放 REST API + ChatGPT Action。
12. V2 可开放 MCP Server。
13. 外部 AI 不能绕过 AI Dev Hub 安全策略直接执行 shell、push、merge、deploy 或修改密钥。

## 当前推荐 V0 闭环

```text
初始化项目 → 创建多个 Agent → 创建多个 Workflow → 创建多个任务 → 在任务中运行 Agent/Workflow → 保存结果 → 生成 Handoff → 后续继续接力
```

## V1/V2 扩展方向

```text
V1：REST API + ChatGPT Action
V2：MCP Server
```

可开放能力：

```text
Task tools
Agent tools
Workflow tools
Run tools
Handoff tools
```

不开放能力：

```text
直接 shell
自动 push
自动 merge
自动 deploy
删除文件
修改密钥
修改服务器配置
```

## 当前需要用户确认

请用户继续确认 `brd.md`。

重点确认：

1. 产品定位是否改对：AI 开发任务中台，而不是 Agent/Workflow/External AI 平台。
2. 多任务、多 Agent、多 Workflow 扩展性是否满足预期。
3. V0 不做 ChatGPT Action / MCP 是否合理。
4. V1 做 REST API + ChatGPT Action，V2 做 MCP Server 是否合理。
5. 是否可以进入 PRD。

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
12. 外部 AI 接入预留点。
13. V0 验收标准。

## 给下一个 AI 工具的接力提示

```text
请先阅读 tasks/ai-dev-hub/brd.md、external-ai-control.md、handoff.md。

当前阶段是 BRD 确认。不要进入 PRD 或技术方案，除非用户确认 BRD。

当前用户已明确：V0 要有 UI，并且要支持创建固定 Workflow，例如 pre-work workflow、调研 workflow。但产品定位不是 Agent/Workflow/External AI 平台，而是 AI 开发任务中台。Agent、Workflow、External AI Control Layer 都是能力组件。

请不要把 ChatGPT Action / MCP 放入 V0。V1 预留 REST API + ChatGPT Action，V2 预留 MCP Server。

请不要实现完整 IDE、复杂 DAG、多 Agent 自动智能编排、自动 push / merge / deploy，也不要把任何具体 AI 工具写死为唯一执行器。
```
