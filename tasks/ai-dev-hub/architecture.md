# AI Dev Hub 架构设计

## 1. 总体架构

```text
公司电脑 / 个人电脑
        ↓
浏览器 / SSH / VPN / 安全隧道
        ↓
腾讯云服务器
        ↓
AI Dev Hub Web UI + API
        ↓
任务系统 / 上下文系统 / 执行系统 / 交接系统
        ↓
Cursor CLI
        ↓
Git 工作区 / 测试命令 / 构建命令
```

## 2. 部署位置

第一版部署在腾讯云服务器。

原因：

- 用户已有 Cursor CLI 在腾讯云服务器上的使用习惯。
- 公司电脑和个人电脑都可以访问同一个远程工作现场。
- 代码、任务、日志、上下文集中保存。
- 避免两台电脑环境不一致。

## 3. 推荐目录结构

服务器目录：

```text
/opt/ai-dev-hub/          # AI Dev Hub 程序
/srv/ai-workspaces/       # 项目代码工作区
/srv/ai-data/             # 数据库、日志、任务记录
/srv/ai-secrets/          # 密钥配置，不进 Git
```

单项目目录：

```text
/srv/ai-workspaces/project-a/
  src/
  package.json
  .ai/
    PROJECT.md
    TASK.md
    HANDOFF.md
    DECISIONS.md
    COMMANDS.md
```

本仓库任务文档目录：

```text
tasks/ai-dev-hub/
  README.md
  product-spec.md
  architecture.md
  implementation-plan.md
  handoff.md
  decisions.md
  prompts.md
```

## 4. 组件设计

### 4.1 Web UI

职责：

- 查看项目。
- 查看任务。
- 创建任务。
- 选择执行器。
- 查看执行日志。
- 查看 git diff。
- 查看 handoff。
- 触发 review。

技术可选：

- Next.js。
- React + Vite。
- Tauri/Electron 后续再考虑。

### 4.2 API Server

职责：

- 提供任务 CRUD。
- 调用执行器 adapter。
- 读取 git 状态。
- 保存日志。
- 生成上下文。
- 生成 handoff。

技术可选：

- Node.js / TypeScript。
- Fastify / Hono / Express。
- SQLite。

### 4.3 Task Store

MVP 用 SQLite。

建议表：

- projects。
- tasks。
- task_events。
- agent_runs。
- handoffs。
- decisions。
- preferences。

### 4.4 Agent Adapter

统一接口：

```ts
interface AgentAdapter {
  name: string
  run(input: AgentRunInput): Promise<AgentRunResult>
}
```

第一版只实现：

```text
CursorCliAdapter
```

后续增加：

```text
CodexCliAdapter
ClaudeCodeAdapter
ApiModelAdapter
```

### 4.5 Git Service

职责：

- 读取 `git status`。
- 读取 `git diff`。
- 获取当前 branch。
- 建议创建任务 branch。
- 生成 review prompt。

第一版不要自动 push 或 merge。

### 4.6 Context Builder

职责：生成给 AI 工具的标准上下文。

输入：

- 项目说明。
- 当前任务。
- 当前 handoff。
- 决策记录。
- git diff。
- 命令记录。

输出：

- prompt 文本。
- 可复制给 Cursor CLI / Codex CLI / Claude Code 的上下文。

### 4.7 Handoff Generator

职责：生成交接文档。

数据来源：

- 任务信息。
- agent run 日志。
- git diff。
- 测试结果。
- 人工备注。

## 5. 安全边界

### 5.1 不直接公网暴露

Web UI 不建议直接暴露公网。

推荐访问方式：

- SSH tunnel。
- WireGuard。
- Tailscale。
- Cloudflare Zero Trust。

### 5.2 权限隔离

- 不使用 root 运行任务。
- 每个项目独立目录。
- 密钥放在 `/srv/ai-secrets/` 或系统 Secret Manager。
- 不把密钥写入 Git。

### 5.3 高风险操作需要人工确认

MVP 禁止自动执行：

- push main。
- merge PR。
- deploy production。
- 删除大量文件。
- 修改密钥文件。

## 6. 数据流

### 6.1 创建任务

```text
用户输入任务
  ↓
Task Service 创建任务
  ↓
Context Builder 生成标准任务说明
  ↓
写入数据库和 .ai/TASK.md
```

### 6.2 执行任务

```text
用户点击 Run
  ↓
Context Builder 生成 prompt
  ↓
CursorCliAdapter 调用 cursor CLI
  ↓
保存日志
  ↓
Git Service 读取 diff
  ↓
Handoff Generator 更新交接文档
```

### 6.3 切换工具

```text
用户选择另一个 Agent
  ↓
读取任务 + handoff + diff
  ↓
生成接力 prompt
  ↓
交给新工具继续执行
```

## 7. 第一版建议技术栈

推荐：

- TypeScript。
- Node.js。
- SQLite。
- React / Vite 或 Next.js。
- child_process / execa 调用 CLI。
- simple-git 或直接 shell 调用 git。

## 8. 非目标

第一版不做：

- 完整 IDE。
- 在线代码编辑器。
- 多租户 SaaS。
- 团队权限系统。
- 精确 token 计费。
- 自动发布。
- 复杂 agent 编排图。
