# AI Dev Hub Handoff

## 当前状态

任务资料已初始化，位于：

```text
tasks/ai-dev-hub/
```

当前只创建文档，不修改业务代码。

## 已完成

- 明确产品方向：AI 开发任务中台，而不是自研完整 IDE。
- 明确部署位置：腾讯云服务器优先。
- 明确第一执行器：Cursor CLI。
- 明确多电脑场景：公司电脑和个人电脑访问同一个远程 AI 开发现场。
- 明确 MVP 范围：任务、上下文、执行、日志、handoff、review。
- 创建任务资料目录。

## 关键结论

1. 不要从自研 IDE 开始。
2. 先做 AI Dev Hub，即 AI 开发任务中台。
3. 第一版只接 Cursor CLI。
4. 部署在腾讯云服务器，作为远程 AI 工作站。
5. 通过 `tasks/` 文档和后续 `.ai/` 工作区解决工具接力问题。
6. 后续可扩展 Codex CLI、Claude Code、公司 API。

## 下一步建议

推荐让 Cursor CLI 接手，执行以下任务：

1. 阅读本目录全部文档。
2. 根据 `implementation-plan.md` 阶段 1，设计 CLI 原型目录结构。
3. 选择技术栈，优先 TypeScript + Node.js。
4. 实现最小命令：
   - `aihub init`
   - `aihub task`
   - `aihub context`
   - `aihub handoff`
5. 先不要实现 Web UI。
6. 先不要接入 Codex / Claude。
7. 先不要自动 push / deploy。

## 给下一个 AI 工具的接力提示

```text
请先阅读 tasks/ai-dev-hub/README.md、product-spec.md、architecture.md、implementation-plan.md、decisions.md、handoff.md。

你的任务不是重新讨论产品方向，而是基于现有决策推进 MVP 阶段 1：本地 CLI 原型。

请先输出一个最小技术方案和文件结构，然后实现 CLI 骨架。第一版只接 Cursor CLI，不做完整 IDE，不做云端 SaaS，不做多工具适配。
```

## 风险提醒

- 如果涉及公司代码，必须确认公司是否允许代码部署到个人腾讯云服务器。
- Web UI 不应直接裸露公网。
- 不要用 root 运行 AI 执行器。
- 不要自动 push main、merge 或 deploy。
- 密钥不能进入 Git 仓库。
