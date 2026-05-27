# AI Dev Hub Prompts

## 1. 给 Cursor CLI 的首次接力 Prompt

```text
请先阅读以下文件：

- tasks/ai-dev-hub/README.md
- tasks/ai-dev-hub/product-spec.md
- tasks/ai-dev-hub/architecture.md
- tasks/ai-dev-hub/implementation-plan.md
- tasks/ai-dev-hub/decisions.md
- tasks/ai-dev-hub/handoff.md

任务目标：推进 AI Dev Hub 的 MVP 阶段 1：本地 CLI 原型。

约束：

- 不要重新定义产品方向。
- 不要做完整 IDE。
- 不要做 Web UI。
- 不要一开始接入多个工具。
- 第一版只接 Cursor CLI。
- 不要自动 push、merge 或 deploy。

请先输出：

1. 你理解的任务目标。
2. 最小技术方案。
3. 建议文件结构。
4. 第一批要修改或新增的文件。

确认方案后，再开始实现。
```

## 2. 给 Codex CLI 的 Review Prompt

```text
请阅读 tasks/ai-dev-hub/ 下的任务资料，并基于当前 git diff 做代码审查。

审查范围：

1. 是否符合 MVP 阶段 1 目标。
2. 是否过度设计。
3. 是否意外引入 Web UI、多工具适配或复杂数据库。
4. 是否存在安全风险，例如自动 push、暴露密钥、root 执行。
5. CLI 命令是否清晰、可维护。

请只输出高风险问题、测试缺口和必要修改建议。不要重写整个方案。
```

## 3. 给 Claude Code 的架构分析 Prompt

```text
请阅读 tasks/ai-dev-hub/ 下的产品和架构文档。

你的任务是做架构检查，不是写代码。

请重点检查：

1. 腾讯云部署方案是否合理。
2. Cursor CLI adapter 的边界是否清晰。
3. 任务、上下文、handoff、日志的模块边界是否合理。
4. MVP 是否过大。
5. 哪些能力应推迟到第二阶段。
6. 安全边界是否足够。

输出格式：

- 结论。
- 必须调整的问题。
- 可以延后的问题。
- 推荐的下一步。
```

## 4. 生成 Handoff 的 Prompt

```text
请基于当前任务资料、执行日志和 git diff，更新 tasks/ai-dev-hub/handoff.md。

必须包含：

1. 当前状态。
2. 已完成事项。
3. 修改过的文件。
4. 已执行命令。
5. 测试结果。
6. 当前风险。
7. 剩余问题。
8. 下一个 AI 工具接手时第一步应该做什么。
```

## 5. 任务收尾 Prompt

```text
请整理本任务阶段成果，并更新：

- tasks/ai-dev-hub/handoff.md
- tasks/ai-dev-hub/decisions.md

要求：

1. 记录本阶段完成了什么。
2. 记录关键决策。
3. 记录未完成事项。
4. 给出下一阶段建议。
5. 不要删除已有历史信息。
```
