# AI Dev Hub 数据模型

## 1. 设计目标

数据模型要支持 AI Dev Hub 的核心闭环：

```text
Project → Task → Required Capabilities → Agent Selection → Agent Run → Logs / Diff → Handoff → Done
```

设计原则：

1. 不绑定任何具体 AI 工具。
2. 支持 CLI / HTTP / Manual / Custom Adapter。
3. 支持任务接力和执行复盘。
4. 支持本地 SQLite 起步，后续可迁移 PostgreSQL。
5. 支持部分信息落盘到 `.ai/`，方便 Git 追踪和 AI 接力。

## 2. 存储分层

### 2.1 数据库

数据库存储结构化数据：

- 项目。
- 任务。
- Agent 配置。
- 执行记录。
- 事件流。
- Handoff 索引。
- 用户偏好。

MVP 推荐 SQLite。

### 2.2 文件系统

文件系统存储可读文档和大文本：

- `.ai/PROJECT.md`
- `.ai/RULES.md`
- `.ai/COMMANDS.md`
- `.ai/TASKS/<task_id>.md`
- `.ai/RUNS/<run_id>/prompt.md`
- `.ai/RUNS/<run_id>/stdout.log`
- `.ai/RUNS/<run_id>/stderr.log`
- `.ai/HANDOFF.md`
- `.ai/DECISIONS.md`

### 2.3 Git

建议进入 Git 的文件：

- `.ai/PROJECT.md`
- `.ai/RULES.md`
- `.ai/COMMANDS.md`
- `.ai/TASKS/*.md`
- `.ai/HANDOFF.md`
- `.ai/DECISIONS.md`

不建议进入 Git 的文件：

- `.ai/RUNS/`
- `.ai/context.md`
- `.ai/AGENTS.local.yaml`
- 包含密钥、日志、完整 stdout/stderr 的文件。

## 3. 实体关系

```text
Project 1 ─── N Task
Project 1 ─── N Agent
Task    1 ─── N AgentRun
Task    1 ─── N TaskEvent
Task    1 ─── N Handoff
Agent   1 ─── N AgentRun
Agent   N ─── N Capability
Task    N ─── N RequiredCapability
```

## 4. Project

### 4.1 字段

```ts
interface Project {
  id: string
  name: string
  workspacePath: string
  defaultBranch?: string
  aiDir: string
  status: 'active' | 'archived'
  createdAt: string
  updatedAt: string
}
```

### 4.2 SQLite 表

```sql
CREATE TABLE projects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  workspace_path TEXT NOT NULL UNIQUE,
  default_branch TEXT,
  ai_dir TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
```

## 5. Task

### 5.1 字段

```ts
interface Task {
  id: string
  projectId: string
  title: string
  goal: string
  scope: string[]
  nonGoals: string[]
  acceptanceCriteria: string[]
  status: 'draft' | 'ready' | 'running' | 'blocked' | 'reviewing' | 'done' | 'archived'
  priority?: 'low' | 'medium' | 'high'
  currentHandoffId?: string
  createdAt: string
  updatedAt: string
}
```

### 5.2 SQLite 表

```sql
CREATE TABLE tasks (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id),
  title TEXT NOT NULL,
  goal TEXT NOT NULL,
  scope_json TEXT NOT NULL DEFAULT '[]',
  non_goals_json TEXT NOT NULL DEFAULT '[]',
  acceptance_criteria_json TEXT NOT NULL DEFAULT '[]',
  status TEXT NOT NULL DEFAULT 'draft',
  priority TEXT,
  current_handoff_id TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
```

## 6. Capability

能力是系统的核心抽象，不是工具名。

### 6.1 字段

```ts
interface Capability {
  id: string
  name: string
  description?: string
  category: 'plan' | 'code' | 'shell' | 'review' | 'doc' | 'project'
}
```

### 6.2 内置能力

```text
plan
code_read
code_edit
code_generate
refactor
shell_run
test_run
build_run
lint_run
review
security_review
performance_review
architecture_review
summarize
doc_generate
handoff_generate
changelog_generate
task_split
status_update
decision_record
risk_assess
```

### 6.3 表

```sql
CREATE TABLE capabilities (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL
);
```

## 7. Task Required Capabilities

```sql
CREATE TABLE task_capabilities (
  task_id TEXT NOT NULL REFERENCES tasks(id),
  capability_id TEXT NOT NULL REFERENCES capabilities(id),
  requirement_type TEXT NOT NULL, -- required | preferred | forbidden
  PRIMARY KEY (task_id, capability_id, requirement_type)
);
```

## 8. Agent

Agent 是已注册的执行器，不等于某个固定工具。

### 8.1 字段

```ts
interface Agent {
  id: string
  projectId?: string
  name: string
  type: 'cli' | 'http' | 'manual' | 'custom'
  enabled: boolean
  config: Record<string, unknown>
  costLevel?: 'low' | 'medium' | 'high'
  interactive: boolean
  requiresWorkspace: boolean
  createdAt: string
  updatedAt: string
}
```

### 8.2 表

```sql
CREATE TABLE agents (
  id TEXT PRIMARY KEY,
  project_id TEXT REFERENCES projects(id),
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  enabled INTEGER NOT NULL DEFAULT 1,
  config_json TEXT NOT NULL DEFAULT '{}',
  cost_level TEXT,
  interactive INTEGER NOT NULL DEFAULT 0,
  requires_workspace INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
```

## 9. Agent Capabilities

```sql
CREATE TABLE agent_capabilities (
  agent_id TEXT NOT NULL REFERENCES agents(id),
  capability_id TEXT NOT NULL REFERENCES capabilities(id),
  PRIMARY KEY (agent_id, capability_id)
);
```

## 10. AgentRun

每次执行都生成一条 AgentRun。

### 10.1 字段

```ts
interface AgentRun {
  id: string
  taskId: string
  projectId: string
  agentId: string
  adapterType: 'cli' | 'http' | 'manual' | 'custom'
  capability: string
  status: 'queued' | 'running' | 'success' | 'failed' | 'cancelled' | 'timeout' | 'manual_pending'
  promptPath?: string
  stdoutPath?: string
  stderrPath?: string
  summary?: string
  exitCode?: number
  beforeGitStatus?: string
  afterGitStatus?: string
  changedFilesJson?: string
  startedAt: string
  endedAt?: string
  createdAt: string
}
```

### 10.2 表

```sql
CREATE TABLE agent_runs (
  id TEXT PRIMARY KEY,
  task_id TEXT NOT NULL REFERENCES tasks(id),
  project_id TEXT NOT NULL REFERENCES projects(id),
  agent_id TEXT NOT NULL REFERENCES agents(id),
  adapter_type TEXT NOT NULL,
  capability TEXT NOT NULL,
  status TEXT NOT NULL,
  prompt_path TEXT,
  stdout_path TEXT,
  stderr_path TEXT,
  summary TEXT,
  exit_code INTEGER,
  before_git_status TEXT,
  after_git_status TEXT,
  changed_files_json TEXT,
  started_at TEXT NOT NULL,
  ended_at TEXT,
  created_at TEXT NOT NULL
);
```

## 11. TaskEvent

事件用于审计和复盘。

```ts
interface TaskEvent {
  id: string
  taskId: string
  type: 'created' | 'updated' | 'agent_selected' | 'run_started' | 'run_finished' | 'handoff_generated' | 'status_changed' | 'note_added'
  payload: Record<string, unknown>
  createdAt: string
}
```

```sql
CREATE TABLE task_events (
  id TEXT PRIMARY KEY,
  task_id TEXT NOT NULL REFERENCES tasks(id),
  type TEXT NOT NULL,
  payload_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL
);
```

## 12. Handoff

```ts
interface Handoff {
  id: string
  taskId: string
  projectId: string
  contentPath: string
  sourceRunId?: string
  summary: string
  createdAt: string
}
```

```sql
CREATE TABLE handoffs (
  id TEXT PRIMARY KEY,
  task_id TEXT NOT NULL REFERENCES tasks(id),
  project_id TEXT NOT NULL REFERENCES projects(id),
  content_path TEXT NOT NULL,
  source_run_id TEXT,
  summary TEXT,
  created_at TEXT NOT NULL
);
```

## 13. Preferences

偏好必须可控。

```ts
interface Preference {
  id: string
  scope: 'user' | 'project'
  projectId?: string
  key: string
  value: string
  confirmed: boolean
  createdAt: string
  updatedAt: string
}
```

```sql
CREATE TABLE preferences (
  id TEXT PRIMARY KEY,
  scope TEXT NOT NULL,
  project_id TEXT REFERENCES projects(id),
  key TEXT NOT NULL,
  value TEXT NOT NULL,
  confirmed INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
```

## 14. MVP 数据最小集

第一版真正必须实现的表：

```text
projects
tasks
agents
agent_capabilities
task_capabilities
agent_runs
task_events
handoffs
```

可以延后：

```text
preferences
capability_metrics
cost_records
team_users
permissions
```

## 15. 数据一致性规则

1. 数据库是结构化状态源。
2. `.ai/` 是 AI 可读工作区。
3. 长文本日志优先落文件，数据库只存路径和摘要。
4. 每次 AgentRun 必须有可追踪 run_id。
5. Handoff 必须能独立解释当前任务状态。
6. 不允许只有数据库状态、没有可读交接文档。
