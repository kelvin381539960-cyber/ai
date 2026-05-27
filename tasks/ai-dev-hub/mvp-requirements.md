# AI Dev Hub MVP 需求清单

## 1. MVP 目标

MVP 的目标是验证一个最小闭环：

```text
创建任务 → 声明所需能力 → 生成上下文 → 选择已配置执行器 → 记录执行 → 生成 handoff → 可由下一个执行器接力
```

## 2. 角色

### 2.1 用户

当前主要用户是个人开发者，具体场景：

- 上班使用公司电脑。
- 下班使用个人电脑。
- 希望所有 AI 开发任务集中在私有服务器上。
- 希望工具可以替换，但工作流不被替换。

### 2.2 AI 执行器

MVP 不绑定具体执行器。

执行器通过 Adapter 接入，可包括：

- CLI 工具。
- HTTP API。
- 手动复制 prompt 的外部工具。
- 本地脚本。

## 3. 核心功能

### 3.1 项目管理

必须支持：

- 注册一个本地/服务器上的项目路径。
- 查看项目名称、路径、默认分支。
- 读取项目 git 状态。

非必须：

- 多用户项目权限。
- 项目模板市场。
- 云端仓库同步。

### 3.2 任务管理

必须支持：

- 创建任务。
- 查看任务。
- 修改任务状态。
- 标记任务完成。
- 保存任务目标、范围、验收标准。
- 声明任务需要的能力。

任务状态建议：

```text
draft
ready
running
blocked
reviewing
done
archived
```

任务字段建议：

```yaml
task_id: string
title: string
goal: string
scope: string[]
non_goals: string[]
acceptance_criteria: string[]
required_capabilities: string[]
preferred_capabilities: string[]
forbidden_capabilities: string[]
status: string
project_id: string
created_at: datetime
updated_at: datetime
```

### 3.3 Agent / Adapter 管理

必须支持：

- 添加 Agent。
- 查看 Agent。
- 启用 / 禁用 Agent。
- 声明 Agent 能力。
- 设置 Adapter 类型。
- 设置命令或 endpoint。

Agent 类型至少支持：

```text
cli
http
manual
```

### 3.4 上下文生成

必须支持生成标准 prompt，内容包括：

- 项目背景。
- 当前任务。
- 所需能力。
- 技术约束。
- 不做什么。
- 验收标准。
- 当前 handoff。
- 当前 git diff 摘要。
- 常用命令。

输出形式：

- CLI 直接输出。
- 保存到 `.ai/context.md`。
- 后续 Web UI 可复制。

### 3.5 执行能力

必须支持：

- 指定项目目录。
- 指定任务。
- 指定能力或 Agent。
- 生成 prompt。
- 调用匹配的 Adapter。
- 捕获 stdout / stderr 或 API 响应。
- 保存执行开始时间、结束时间、退出码。
- 执行前后读取 git status。

暂不支持：

- 自动修复失败。
- 自动循环执行直到成功。
- 自动提交代码。

### 3.6 执行日志

每次执行必须记录：

- run_id。
- task_id。
- agent_id。
- adapter_type。
- capability。
- prompt。
- stdout。
- stderr。
- started_at。
- ended_at。
- exit_code。
- before_git_status。
- after_git_status。

日志用途：

- 复盘。
- 生成 handoff。
- 生成 review prompt。
- 训练用户偏好和工具选择。

### 3.7 Handoff 生成

必须支持生成交接文档，内容包括：

- 当前状态。
- 已完成事项。
- 已修改文件。
- 已执行命令。
- 测试结果。
- 当前风险。
- 剩余事项。
- 下一个执行器应该怎么接手。

输出位置：

```text
.ai/HANDOFF.md
```

也可以同步到本仓库任务目录中的：

```text
tasks/ai-dev-hub/handoff.md
```

### 3.8 Review Prompt 生成

必须支持基于 git diff 生成 review prompt。

用途：

- 给任意 Review 能力的 Adapter 使用。
- 给手动外部工具使用。
- 给当前执行器自查。

MVP 可以只生成 prompt，不必须自动调用 Review 工具。

## 4. CLI 命令设计

### 4.1 初始化

```bash
aihub init
```

生成：

```text
.ai/PROJECT.md
.ai/RULES.md
.ai/COMMANDS.md
.ai/TASKS/
.ai/HANDOFF.md
.ai/DECISIONS.md
.ai/AGENTS.yaml
```

### 4.2 添加项目

```bash
aihub project add /srv/ai-workspaces/project-a
```

### 4.3 添加 Agent

```bash
aihub agent add --type cli --id code-agent --capabilities plan,code_edit,shell_run
```

### 4.4 查看 Agent

```bash
aihub agent list
```

### 4.5 创建任务

```bash
aihub task create "实现钱包登录" --capabilities plan,code_edit,test_run
```

### 4.6 生成上下文

```bash
aihub context --task <task_id>
```

### 4.7 执行任务

```bash
aihub run --task <task_id> --capability code_edit
```

或指定执行器：

```bash
aihub run --task <task_id> --agent <agent_id>
```

### 4.8 生成交接

```bash
aihub handoff --task <task_id>
```

### 4.9 生成 Review Prompt

```bash
aihub review --task <task_id>
```

### 4.10 完成任务

```bash
aihub done --task <task_id>
```

## 5. MVP 验收标准

MVP 完成时，必须能演示：

1. 在私有服务器上初始化一个项目。
2. 注册至少一个 CLI 或 Manual Agent。
3. 创建一个带 required_capabilities 的任务。
4. 生成标准上下文。
5. 通过能力选择或指定 Agent 执行一次。
6. 保存执行日志。
7. 读取 git diff。
8. 生成 handoff。
9. 在另一台电脑访问同一份 handoff 和任务状态。
10. 复制 handoff 给另一个 AI 工具后，对方能理解当前进度。

## 6. 明确不做

MVP 不做：

- 用户登录系统。
- 团队协作权限。
- 在线编辑代码。
- 自动 PR。
- 自动部署。
- 多 agent 并发编排。
- 精确 token 计费。
- 插件市场。
- SaaS 化。
- 硬编码绑定单一 AI 工具。
