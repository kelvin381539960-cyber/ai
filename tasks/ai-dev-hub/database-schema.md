# AI Work Hub Database Schema

## 1. 目标

本文件定义 MVP 的 SQLite 数据库 schema。

技术选择：

```text
SQLite
Prisma 或 Drizzle 均可
```

原则：

- SQLite 存结构化状态。
- 大文本和文件存文件系统。
- 数据库保存路径、摘要和索引。
- MVP 单用户优先。

## 2. 命名约定

- 表名使用复数 snake_case。
- 主键使用 `id TEXT PRIMARY KEY`。
- 时间字段使用 ISO string。
- JSON 字段使用 TEXT 保存 JSON。

## 3. workspaces

```sql
CREATE TABLE workspaces (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  data_dir TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
```

## 4. projects

```sql
CREATE TABLE projects (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX idx_projects_workspace_id ON projects(workspace_id);
```

## 5. tasks

```sql
CREATE TABLE tasks (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  type TEXT NOT NULL,
  goal TEXT NOT NULL,
  expected_output TEXT,
  default_assistant_id TEXT REFERENCES assistants(id),
  workflow_id TEXT REFERENCES workflows(id),
  context_scope TEXT NOT NULL DEFAULT 'standard',
  status TEXT NOT NULL DEFAULT 'draft',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX idx_tasks_project_id ON tasks(project_id);
CREATE INDEX idx_tasks_type ON tasks(type);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_default_assistant_id ON tasks(default_assistant_id);
```

Task status:

```text
draft
ready
running
blocked
reviewing
done
archived
```

Task type:

```text
research
prd
competitive_analysis
ops_plan
meeting_summary
data_review
review
tech_question
dev_task
custom
```

## 6. materials

```sql
CREATE TABLE materials (
  id TEXT PRIMARY KEY,
  task_id TEXT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  file_path TEXT,
  source_url TEXT,
  usage_status TEXT NOT NULL DEFAULT 'active',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX idx_materials_task_id ON materials(task_id);
CREATE INDEX idx_materials_type ON materials(type);
CREATE INDEX idx_materials_usage_status ON materials(usage_status);
```

Material type:

```text
text
url
file
image
meeting_note
user_feedback
competitor_info
ai_output
custom
```

Usage status:

```text
active
key
excluded
archived
```

## 7. assistants

```sql
CREATE TABLE assistants (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  applicable_task_types_json TEXT NOT NULL DEFAULT '[]',
  capabilities_json TEXT NOT NULL DEFAULT '[]',
  prompt_template TEXT,
  default_context_scope TEXT NOT NULL DEFAULT 'standard',
  enabled INTEGER NOT NULL DEFAULT 1,
  config_json TEXT NOT NULL DEFAULT '{}',
  is_seed INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX idx_assistants_workspace_id ON assistants(workspace_id);
CREATE INDEX idx_assistants_type ON assistants(type);
CREATE INDEX idx_assistants_enabled ON assistants(enabled);
```

Assistant type:

```text
manual
cli
```

## 8. workflows

```sql
CREATE TABLE workflows (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  applicable_task_types_json TEXT NOT NULL DEFAULT '[]',
  steps_json TEXT NOT NULL DEFAULT '[]',
  enabled INTEGER NOT NULL DEFAULT 1,
  is_seed INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX idx_workflows_workspace_id ON workflows(workspace_id);
CREATE INDEX idx_workflows_enabled ON workflows(enabled);
```

`steps_json` 示例：

```json
[
  {
    "id": "confirm-goal",
    "title": "确认目标",
    "type": "manual_input",
    "required": true
  },
  {
    "id": "run-research",
    "title": "生成调研结论",
    "type": "assistant_run",
    "useDefaultAssistant": true,
    "contextScope": "standard",
    "required": true
  }
]
```

## 9. workflow_runs

```sql
CREATE TABLE workflow_runs (
  id TEXT PRIMARY KEY,
  task_id TEXT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  workflow_id TEXT NOT NULL REFERENCES workflows(id),
  status TEXT NOT NULL DEFAULT 'pending',
  current_step_id TEXT,
  step_states_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX idx_workflow_runs_task_id ON workflow_runs(task_id);
CREATE INDEX idx_workflow_runs_workflow_id ON workflow_runs(workflow_id);
CREATE INDEX idx_workflow_runs_status ON workflow_runs(status);
```

Workflow run status:

```text
pending
running
waiting_user
success
failed
cancelled
```

## 10. runs

```sql
CREATE TABLE runs (
  id TEXT PRIMARY KEY,
  task_id TEXT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  assistant_id TEXT NOT NULL REFERENCES assistants(id),
  workflow_run_id TEXT REFERENCES workflow_runs(id) ON DELETE SET NULL,
  workflow_step_id TEXT,
  reason TEXT,
  context_scope TEXT NOT NULL DEFAULT 'standard',
  prompt_path TEXT NOT NULL,
  result_path TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  used_material_ids_json TEXT NOT NULL DEFAULT '[]',
  created_at TEXT NOT NULL,
  completed_at TEXT
);

CREATE INDEX idx_runs_task_id ON runs(task_id);
CREATE INDEX idx_runs_assistant_id ON runs(assistant_id);
CREATE INDEX idx_runs_workflow_run_id ON runs(workflow_run_id);
CREATE INDEX idx_runs_status ON runs(status);
```

Run status:

```text
pending
running
waiting_user
success
failed
cancelled
timeout
```

## 11. outputs

```sql
CREATE TABLE outputs (
  id TEXT PRIMARY KEY,
  task_id TEXT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  content_path TEXT NOT NULL,
  version INTEGER NOT NULL DEFAULT 1,
  is_final INTEGER NOT NULL DEFAULT 0,
  source_run_ids_json TEXT NOT NULL DEFAULT '[]',
  source_material_ids_json TEXT NOT NULL DEFAULT '[]',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX idx_outputs_task_id ON outputs(task_id);
CREATE INDEX idx_outputs_type ON outputs(type);
CREATE INDEX idx_outputs_is_final ON outputs(is_final);
```

Output type:

```text
research_report
prd_draft
competitive_analysis
ops_plan
meeting_summary
data_review
review_result
action_items
handoff
custom
```

## 12. template_installations

用于记录默认模板安装状态。

```sql
CREATE TABLE template_installations (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  template_version TEXT NOT NULL,
  installed_at TEXT NOT NULL
);

CREATE INDEX idx_template_installations_workspace_id ON template_installations(workspace_id);
```

## 13. settings

```sql
CREATE TABLE settings (
  id TEXT PRIMARY KEY,
  workspace_id TEXT REFERENCES workspaces(id) ON DELETE CASCADE,
  key TEXT NOT NULL,
  value TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE UNIQUE INDEX idx_settings_workspace_key ON settings(workspace_id, key);
```

默认 settings：

```text
default_context_scope = standard
data_dir = ~/.ai-work-hub
advanced_mode = false
allow_cli_assistant = false
```

## 14. MVP 查询需求

必须支持高效查询：

```text
任务列表
任务详情
任务资料
任务输出
任务执行记录
等待回填的 Run
等待继续的 Workflow Run
可用助手
可用流程
```

## 15. 迁移要求

MVP 可使用简单迁移机制：

```text
migrations/001_init.sql
migrations/002_seed_templates.sql
```

必须支持重复启动不重复建表。
