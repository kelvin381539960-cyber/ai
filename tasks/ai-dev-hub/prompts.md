# AI Dev Hub Prompts

## 1. 给任意 AI 工具的首次接力 Prompt

```text
请先阅读以下文件：

- tasks/ai-dev-hub/README.md
- tasks/ai-dev-hub/solution-overview.md
- tasks/ai-dev-hub/capability-model.md
- tasks/ai-dev-hub/agent-adapter-spec.md
- tasks/ai-dev-hub/mvp-requirements.md
- tasks/ai-dev-hub/architecture.md
- tasks/ai-dev-hub/implementation-plan.md
- tasks/ai-dev-hub/decisions.md
- tasks/ai-dev-hub/handoff.md

任务目标：继续完善 AI Dev Hub 的方案。

约束：

- 不要重新定义产品方向。
- 不要做完整 IDE。
- 不要一开始做 Web UI。
- 不要绑定任何单一 AI 工具。
- 系统核心要做能力模型和 Adapter 扩展机制。
- 具体工具只能作为可配置 Adapter 存在。
- 不要自动 push、merge 或 deploy。

请先输出：

1. 你理解的任务目标。
2. 当前方案是否还有绑定具体工具的问题。
3. 还缺哪些工程执行级文档。
4. 建议下一步补哪些文件。
```

## 2. 给实现工具的 CLI 原型 Prompt

```text
请阅读 tasks/ai-dev-hub/ 下的任务资料，重点阅读 capability-model.md 和 agent-adapter-spec.md。

你的任务是设计 AI Dev Hub 的 CLI 原型。

要求：

1. 不要写死任何具体 AI 工具。
2. 至少支持 Generic CLI Adapter 和 Manual Adapter。
3. Task 通过 required_capabilities 声明需要什么能力。
4. Agent 通过 capabilities 声明自己能做什么。
5. Run 时可以通过 --capability 选择能力，也可以通过 --agent 指定执行器。
6. 执行结果必须记录为标准 AgentRunResult。

请先输出最小文件结构和命令规格，不要直接大规模写代码。
```

## 3. 给 Review 工具的 Prompt

```text
请阅读 tasks/ai-dev-hub/ 下的任务资料，并基于当前 git diff 做方案/代码审查。

审查范围：

1. 是否仍然硬编码绑定了某个具体 AI 工具。
2. 是否符合能力驱动 + Adapter 扩展架构。
3. 是否过度设计。
4. 是否意外引入完整 IDE、复杂 SaaS、多用户权限或自动部署。
5. 是否存在安全风险，例如自动 push、暴露密钥、root 执行。
6. CLI 命令是否清晰、可维护。

请只输出高风险问题、测试缺口和必要修改建议。不要重写整个方案。
```

## 4. 给架构分析工具的 Prompt

```text
请阅读 tasks/ai-dev-hub/ 下的产品和架构文档。

你的任务是做架构检查，不是写代码。

请重点检查：

1. 能力模型是否足够抽象。
2. Agent Adapter 边界是否清晰。
3. 任务、上下文、handoff、日志的模块边界是否合理。
4. MVP 是否过大。
5. 哪些能力应推迟到第二阶段。
6. 安全边界是否足够。
7. 是否还有具体工具绑定问题。

输出格式：

- 结论。
- 必须调整的问题。
- 可以延后的问题。
- 推荐的下一步。
```

## 5. 生成 Handoff 的 Prompt

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

注意：不要把任何具体 AI 工具写死为唯一执行器。
```

## 6. 任务收尾 Prompt

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
6. 不要引入任何单一工具绑定表达。
```
