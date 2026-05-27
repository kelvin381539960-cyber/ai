# AI Dev Hub MVP 需求清单

## 1. MVP 目标

MVP 的目标是验证一个最小闭环：

```text
创建任务 → 生成上下文 → 调用 Cursor CLI → 记录执行 → 生成 handoff → 可由下一个工具接力
```

## 2. 角色

### 2.1 用户

当前主要用户是个人开发者，具体场景：

- 上班使用公司电脑。
- 下班使用个人电脑。
- Cursor CLI 已经部署在腾讯云服务器。
- 希望所有 AI 开发任务集中在腾讯云服务器上。

### 2.2 AI 执行器

MVP 只支持：

- Cursor CLI。

后续支持：

- Codex CLI。
- Claude Code。
- 公司 API。

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
status: string
project_id: string
created_at: datetime
updated_at: datetime
```

### 3.3 上下文生成

必须支持生成标准 prompt，内容包括：

- 项目背景。
- 当前任务。
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

### 3.4 Cursor CLI 执行

必须支持：

- 指定项目目录。
- 指定任务。
- 生成 prompt。
- 调用 Cursor CLI。
- 捕获 stdout / stderr。
- 保存执行开始时间、结束时间、退出码。
- 执行前后读取 git status。

暂不支持：

- 自动修复失败。
- 自动循环执行直到成功。
- 自动提交代码。

### 3.5 执行日志

每次执行必须记录：

- run_id。
- task_id。
- agent_name。
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

### 3.6 Handoff 生成

必须支持生成交接文档，内容包括：

- 当前状态。
- 已完成事项。
- 已修改文件。
- 已执行命令。
- 测试结果。
- 当前风险。
- 剩余事项。
- 下一个 AI 工具应该怎么接手。

输出位置：

```text
.ai/HANDOFF.md
```

也可以同步到本仓库任务目录中的：

```text
tasks/ai-dev-hub/handoff.md
```

### 3.7 Review Prompt 生成

必须支持基于 git diff 生成 review prompt。

用途：

- 给 Codex CLI 做 review。
- 给 Claude Code 做架构检查。
- 给 Cursor CLI 自查。

MVP 只生成 prompt，不负责自动调用其他工具。

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
```

### 4.2 添加项目

```bash
aihub project add /srv/ai-workspaces/project-a
```

### 4.3 创建任务

```bash
aihub task create "实现钱包登录"
```

### 4.4 生成上下文

```bash
aihub context --task <task_id>
```

### 4.5 执行任务

```bash
aihub run --agent cursor --task <task_id>
```

### 4.6 生成交接

```bash
aihub handoff --task <task_id>
```

### 4.7 生成 Review Prompt

```bash
aihub review --task <task_id>
```

### 4.8 完成任务

```bash
aihub done --task <task_id>
```

## 5. MVP 验收标准

MVP 完成时，必须能演示：

1. 在腾讯云服务器上初始化一个项目。
2. 创建一个任务。
3. 生成给 Cursor CLI 的上下文。
4. 调用 Cursor CLI 执行一次。
5. 保存执行日志。
6. 读取 git diff。
7. 生成 handoff。
8. 在另一台电脑访问同一份 handoff 和任务状态。
9. 复制 handoff 给另一个 AI 工具后，对方能理解当前进度。

## 6. 明确不做

MVP 不做：

- 用户登录系统。
- 团队协作权限。
- 在线编辑代码。
- 自动 PR。
- 自动部署。
- 多 agent 并发。
- 精确 token 计费。
- 插件市场。
- SaaS 化。
