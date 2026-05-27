# AI Dev Hub `.ai/` 工作区规范

## 1. 目标

`.ai/` 是项目内的 AI 可读工作区，用于让不同工具在同一个任务现场上接力。

它解决的问题：

1. 工具切换时上下文不丢。
2. 执行过程可以复盘。
3. 任务状态可以被人和 AI 同时理解。
4. 关键决策沉淀到项目资产中。

## 2. 目录结构

MVP 推荐结构：

```text
.ai/
  PROJECT.md
  RULES.md
  COMMANDS.md
  AGENTS.yaml
  TASKS/
    <task_id>.md
  RUNS/
    <run_id>/
      input.json
      prompt.md
      stdout.log
      stderr.log
      result.json
      git-before.txt
      git-after.txt
  HANDOFF.md
  DECISIONS.md
  context.md
  review-prompt.md
```

## 3. Git 策略

### 3.1 建议提交 Git

```text
.ai/PROJECT.md
.ai/RULES.md
.ai/COMMANDS.md
.ai/TASKS/*.md
.ai/HANDOFF.md
.ai/DECISIONS.md
```

### 3.2 不建议提交 Git

```text
.ai/RUNS/
.ai/context.md
.ai/review-prompt.md
.ai/AGENTS.local.yaml
```

原因：

- RUNS 可能包含大量日志。
- context 可能包含敏感代码片段。
- AGENTS.local 可能包含本地路径或私有 endpoint。

## 4. `.gitignore` 建议

```gitignore
.ai/RUNS/
.ai/context.md
.ai/review-prompt.md
.ai/AGENTS.local.yaml
.ai/*.tmp
```

## 5. PROJECT.md

### 5.1 用途

项目背景说明，所有 AI 工具接手前必须先读。

### 5.2 模板

```md
# Project

## Summary

一句话说明项目。

## Tech Stack

- Runtime:
- Framework:
- Database:
- Package Manager:

## Key Directories

- `src/`:
- `tests/`:

## Local Setup

```bash
# install
# dev
# test
```

## Notes

长期背景信息。
```

## 6. RULES.md

### 6.1 用途

约束 AI 行为。

### 6.2 模板

```md
# AI Rules

## General

- 先给计划，再执行。
- 小步修改，不做无关重构。
- 不自动 push / merge / deploy。
- 遇到敏感文件先停止并报告。

## Code Style

- 遵循项目现有风格。
- 不引入不必要依赖。

## Safety

- 不修改 `.env`、密钥、证书。
- 不删除大量文件。
```

## 7. COMMANDS.md

### 7.1 用途

记录常用命令，避免 AI 猜测。

### 7.2 模板

```md
# Commands

## Install

```bash
pnpm install
```

## Dev

```bash
pnpm dev
```

## Test

```bash
pnpm test
```

## Lint

```bash
pnpm lint
```

## Build

```bash
pnpm build
```
```

## 8. AGENTS.yaml

### 8.1 用途

项目级 Agent 配置。不应包含密钥。

### 8.2 模板

```yaml
agents:
  - id: generic-code-cli
    name: Generic Code CLI
    type: cli
    command: some-command
    args:
      - run
    input_mode: stdin
    output_mode: stream
    capabilities:
      - plan
      - code_read
      - code_edit
      - shell_run
      - test_run
    timeout_seconds: 1800
    requires_workspace: true
    interactive: true
    enabled: true

  - id: manual-review
    name: Manual Review Tool
    type: manual
    capabilities:
      - review
      - security_review
    enabled: true
```

### 8.3 本地覆盖

如需保存本地路径、私有 endpoint、token 引用，使用：

```text
.ai/AGENTS.local.yaml
```

该文件不进 Git。

## 9. TASKS/<task_id>.md

### 9.1 用途

记录单个任务的结构化说明。

### 9.2 模板

```md
# Task: <title>

## Metadata

- id: <task_id>
- status: draft
- created_at:
- updated_at:

## Goal

任务目标。

## Scope

- 范围 1
- 范围 2

## Non-goals

- 不做什么

## Required Capabilities

- plan
- code_edit
- test_run

## Acceptance Criteria

- 验收标准 1
- 验收标准 2

## Risks

- 风险 1

## Notes

补充说明。
```

## 10. RUNS/<run_id>/

### 10.1 用途

保存单次执行的输入、输出和结果。

### 10.2 文件说明

```text
input.json       标准 AgentRunInput
prompt.md        实际发给 Agent 的 prompt
stdout.log       标准输出
stderr.log       标准错误
result.json      标准 AgentRunResult
git-before.txt   执行前 git status
git-after.txt    执行后 git status
```

### 10.3 注意

RUNS 默认不提交 Git。

## 11. HANDOFF.md

### 11.1 用途

当前项目或当前任务的最新交接说明。

### 11.2 模板

```md
# Handoff

## Current Status

当前状态。

## Completed

- 已完成 1

## Changed Files

- `path/to/file`: 修改原因

## Commands Run

```bash
command
```

## Test Results

测试结果。

## Risks

- 风险 1

## Remaining Work

- 剩余 1

## Next Agent Instructions

下一个执行器接手时第一步。
```

## 12. DECISIONS.md

### 12.1 用途

记录长期技术决策和产品决策。

### 12.2 模板

```md
# Decisions

## Decision 001: <title>

Status: accepted
Date:

### Context

背景。

### Decision

决策。

### Consequences

影响。
```

## 13. context.md

由 `aihub context` 生成。

特点：

- 可复制给任意 AI 工具。
- 临时文件。
- 默认不进 Git。

## 14. review-prompt.md

由 `aihub review` 生成。

特点：

- 包含任务、handoff、diff 摘要。
- 可给具备 review 能力的 Agent 使用。
- 默认不进 Git。

## 15. 文件权限和修改规则

### 15.1 用户主要维护

```text
PROJECT.md
RULES.md
COMMANDS.md
DECISIONS.md
```

### 15.2 系统主要生成

```text
TASKS/*.md
HANDOFF.md
context.md
review-prompt.md
RUNS/
```

### 15.3 AI 可以修改但需谨慎

```text
HANDOFF.md
TASKS/*.md
DECISIONS.md
```

AI 不应修改：

```text
AGENTS.local.yaml
密钥文件
.env
证书
```

## 16. 接力要求

任何 AI 工具接手任务前，必须读取：

```text
.ai/PROJECT.md
.ai/RULES.md
.ai/COMMANDS.md
.ai/TASKS/<task_id>.md
.ai/HANDOFF.md
.ai/DECISIONS.md
```

这样不依赖任何单一工具的历史聊天记录。
