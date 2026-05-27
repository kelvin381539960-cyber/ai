# AI Dev Hub 用户流程

## 1. 核心用户故事

用户有两台电脑：

- 公司电脑。
- 个人电脑。

Cursor CLI 已经在腾讯云服务器上。用户希望把腾讯云服务器作为统一 AI 开发现场。

目标：

> 上班做了一半的 AI 开发任务，下班回家可以继续，不需要重新解释给 AI。

## 2. 流程 A：第一次初始化

### 2.1 用户动作

用户 SSH 到腾讯云服务器：

```bash
cd /srv/ai-workspaces/project-a
aihub init
```

### 2.2 系统动作

系统生成：

```text
.ai/PROJECT.md
.ai/RULES.md
.ai/COMMANDS.md
.ai/TASKS/
.ai/HANDOFF.md
.ai/DECISIONS.md
```

### 2.3 成功结果

项目具备标准 AI 工作区，后续任意 AI 工具都先读 `.ai/`。

## 3. 流程 B：创建任务

### 3.1 用户动作

```bash
aihub task create "实现 AI Dev Hub CLI 原型"
```

### 3.2 系统动作

系统生成任务文件：

```text
.ai/TASKS/<task_id>.md
```

内容包括：

- 目标。
- 范围。
- 不做什么。
- 验收标准。
- 推荐执行器。
- 风险。

### 3.3 成功结果

任务从一句话变成 AI 可以执行的结构化任务。

## 4. 流程 C：生成上下文

### 4.1 用户动作

```bash
aihub context --task <task_id>
```

### 4.2 系统动作

系统读取：

- `.ai/PROJECT.md`
- `.ai/RULES.md`
- `.ai/COMMANDS.md`
- `.ai/TASKS/<task_id>.md`
- `.ai/HANDOFF.md`
- `git status`
- `git diff`

生成：

```text
.ai/context.md
```

### 4.3 成功结果

用户可以把上下文直接交给 Cursor CLI 或其他 AI 工具。

## 5. 流程 D：用 Cursor CLI 执行

### 5.1 用户动作

```bash
aihub run --agent cursor --task <task_id>
```

### 5.2 系统动作

系统：

1. 生成本次 prompt。
2. 调用 Cursor CLI。
3. 捕获 stdout / stderr。
4. 记录执行时间。
5. 记录执行前后的 git status。
6. 保存日志到 `.ai/runs/`。

### 5.3 成功结果

Cursor CLI 可以执行任务，同时执行过程被完整记录。

## 6. 流程 E：下班前生成交接

### 6.1 用户动作

```bash
aihub handoff --task <task_id>
```

### 6.2 系统动作

系统基于：

- 当前任务。
- 执行日志。
- git diff。
- 用户备注。

生成：

```text
.ai/HANDOFF.md
```

### 6.3 Handoff 必须回答

- 已完成什么？
- 改了哪些文件？
- 跑过哪些命令？
- 现在卡在哪里？
- 哪些地方有风险？
- 下一个工具接手第一步做什么？

### 6.4 成功结果

用户下班后不需要靠记忆恢复现场。

## 7. 流程 F：回家继续

### 7.1 用户动作

用户用个人电脑访问腾讯云服务器：

```bash
cd /srv/ai-workspaces/project-a
aihub context --task <task_id>
aihub run --agent cursor --task <task_id>
```

### 7.2 系统动作

系统读取同一份任务、日志和 handoff。

### 7.3 成功结果

个人电脑可以接着公司电脑未完成的任务继续。

## 8. 流程 G：切换到另一个 AI 工具

### 8.1 用户动作

用户生成 review prompt：

```bash
aihub review --task <task_id>
```

然后把输出复制给 Codex CLI 或 Claude Code。

### 8.2 系统动作

系统生成包含以下内容的接力 prompt：

- 项目背景。
- 当前任务。
- Handoff。
- Git diff。
- Review 重点。
- 明确不允许重做或扩大范围。

### 8.3 成功结果

新的 AI 工具可以直接接手，不需要用户重新讲背景。

## 9. 流程 H：任务完成

### 9.1 用户动作

```bash
aihub done --task <task_id>
```

### 9.2 系统动作

系统：

1. 生成任务总结。
2. 更新 `.ai/DECISIONS.md`。
3. 归档任务。
4. 保存最终 diff 摘要。
5. 提醒用户手动 commit。

### 9.3 成功结果

AI 开发过程沉淀为项目资产，而不是只留在聊天记录里。
