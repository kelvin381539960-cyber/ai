# AI Dev Hub 架构设计

## 1. 总体架构

```text
公司电脑 / 个人电脑
        ↓
浏览器 / SSH / VPN / 安全隧道
        ↓
私有服务器
        ↓
AI Dev Hub Web UI + API + CLI
        ↓
任务系统 / 上下文系统 / 能力路由 / 执行系统 / 交接系统
        ↓
Agent Adapter Registry
        ↓
CLI Adapter / HTTP Adapter / Manual Adapter / Custom Adapter
        ↓
Git 工作区 / 测试命令 / 构建命令 / 外部 AI 工具 / 公司 API
```

## 2. 部署位置

第一版推荐部署在腾讯云服务器或其他私有服务器。

原因：

- 公司电脑和个人电脑都可以访问同一个远程工作现场。
- 代码、任务、日志、上下文集中保存。
- 避免两台电脑环境不一致。
- 具体 AI 工具可以在服务器上配置，也可以通过手动 Adapter 接入外部工具。

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
    RULES.md
    COMMANDS.md
    AGENTS.yaml
    TASKS/
    HANDOFF.md
    DECISIONS.md
    RUNS/
    context.md
```

本仓库任务文档目录：

```text
tasks/ai-dev-hub/
  README.md
  solution-overview.md
  capability-model.md
  agent-adapter-spec.md
  product-spec.md
  mvp-requirements.md
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
- 查看 Agent / Adapter。
- 选择能力。
- 触发执行。
- 查看执行日志。
- 查看 git diff。
- 查看 handoff。
- 触发 review prompt 生成。

技术可选：

- Next.js。
- React + Vite。
- Tauri/Electron 后续再考虑。

### 4.2 API Server

职责：

- 提供任务 CRUD。
- 提供 Agent CRUD。
- 调用能力路由。
- 调用执行器 Adapter。
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
- agents。
- agent_capabilities。
- task_events。
- agent_runs。
- handoffs。
- decisions。
- preferences。

### 4.4 Agent Adapter Registry

职责：

- 注册 Adapter。
- 启用 / 禁用 Adapter。
- 读取 Adapter 能力。
- 根据 capability 查找候选执行器。

Adapter 类型：

```text
cli
http
manual
custom
```

### 4.5 Capability Router

职责：

- 读取任务 required_capabilities。
- 查找匹配 Agent。
- 根据成本、偏好、可用性排序。
- 生成推荐执行器。
- 允许用户手动覆盖推荐。

### 4.6 Git Service

职责：

- 读取 `git status`。
- 读取 `git diff`。
- 获取当前 branch。
- 建议创建任务 branch。
- 生成 review prompt。

第一版不要自动 push 或 merge。

### 4.7 Context Builder

职责：生成给 AI 工具的标准上下文。

输入：

- 项目说明。
- 当前任务。
- 所需能力。
- 当前 handoff。
- 决策记录。
- git diff。
- 命令记录。

输出：

- prompt 文本。
- 可复制给任意 AI 工具的上下文。
- 可传给 Adapter 的 `AgentRunInput`。

### 4.8 Handoff Generator

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
声明 required_capabilities
  ↓
Context Builder 生成标准任务说明
  ↓
写入数据库和 .ai/TASKS/<task_id>.md
```

### 6.2 注册 Agent

```text
用户添加 Agent 配置
  ↓
Adapter Registry 校验配置
  ↓
保存 AGENTS.yaml / 数据库
  ↓
Capability Router 可检索该 Agent
```

### 6.3 执行任务

```text
用户点击 Run 或执行 CLI
  ↓
Capability Router 选择候选 Agent
  ↓
用户确认或指定 Agent
  ↓
Context Builder 生成 AgentRunInput
  ↓
Adapter 执行
  ↓
保存日志
  ↓
Git Service 读取 diff
  ↓
Handoff Generator 更新交接文档
```

### 6.4 切换工具

```text
用户选择另一个 Agent
  ↓
读取任务 + handoff + diff
  ↓
生成接力 prompt
  ↓
通过对应 Adapter 或 Manual 输出继续执行
```

## 7. 第一版建议技术栈

推荐：

- TypeScript。
- Node.js。
- SQLite。
- React / Vite 或 Next.js。
- child_process / execa 调用 CLI。
- fetch / undici 调用 HTTP Adapter。
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
- 单一工具硬编码绑定。
