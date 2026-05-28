export interface WorkspaceRow {
  id: string;
  name: string;
  data_dir: string;
  created_at: string;
  updated_at: string;
}

export interface ProjectRow {
  id: string;
  workspace_id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface TaskRow {
  id: string;
  project_id: string;
  title: string;
  type: string;
  goal: string;
  expected_output: string | null;
  default_assistant_id: string | null;
  workflow_id: string | null;
  context_scope: 'light' | 'standard' | 'full';
  status: string;
  created_at: string;
  updated_at: string;
}

export interface MaterialRow {
  id: string;
  task_id: string;
  type: string;
  title: string;
  content: string | null;
  file_path: string | null;
  source_url: string | null;
  usage_status: 'active' | 'key' | 'excluded' | 'archived';
  created_at: string;
  updated_at: string;
}

export interface AssistantRow {
  id: string;
  workspace_id: string;
  name: string;
  type: 'manual' | 'cli';
  applicable_task_types_json: string;
  capabilities_json: string;
  prompt_template: string | null;
  default_context_scope: 'light' | 'standard' | 'full';
  enabled: number;
  config_json: string;
  is_seed: number;
  created_at: string;
  updated_at: string;
}

export interface RunRow {
  id: string;
  task_id: string;
  assistant_id: string;
  workflow_run_id: string | null;
  workflow_step_id: string | null;
  reason: string | null;
  context_scope: 'light' | 'standard' | 'full';
  prompt_path: string;
  result_path: string | null;
  status: string;
  used_material_ids_json: string;
  created_at: string;
  completed_at: string | null;
}

export interface OutputRow {
  id: string;
  task_id: string;
  type: string;
  title: string;
  content_path: string;
  version: number;
  is_final: number;
  source_run_ids_json: string;
  source_material_ids_json: string;
  created_at: string;
  updated_at: string;
}
