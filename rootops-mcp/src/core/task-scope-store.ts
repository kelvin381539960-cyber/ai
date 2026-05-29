import { randomUUID } from 'node:crypto';
import path from 'node:path';
import type { TaskScope } from '../types.js';
import { DEFAULT_TASK_SCOPE } from '../config/default-policy.js';
import { JsonStore } from './json-store.js';

export interface CreateTaskScopeInput {
  allowedRoots?: string[];
  autoAllow?: string[];
  requiresConfirm?: string[];
  ttlMinutes?: number;
  limits?: Partial<TaskScope['limits']>;
}

interface TaskScopeState {
  activeTaskId: string;
  scopes: TaskScope[];
}

export class TaskScopeStore {
  private readonly scopes = new Map<string, TaskScope>();
  private activeTaskId = DEFAULT_TASK_SCOPE.taskId;
  private readonly store: JsonStore<TaskScopeState>;

  constructor(storeDir = process.env.ROOTOPS_STATE_DIR ?? '.var/state') {
    this.scopes.set(DEFAULT_TASK_SCOPE.taskId, DEFAULT_TASK_SCOPE);
    this.store = new JsonStore<TaskScopeState>(path.join(storeDir, 'task-scopes.json'), {
      activeTaskId: DEFAULT_TASK_SCOPE.taskId,
      scopes: [DEFAULT_TASK_SCOPE]
    });
  }

  async init(): Promise<void> {
    const state = await this.store.read();
    this.scopes.clear();
    for (const scope of state.scopes.length ? state.scopes : [DEFAULT_TASK_SCOPE]) {
      this.scopes.set(scope.taskId, scope);
    }
    this.activeTaskId = this.scopes.has(state.activeTaskId) ? state.activeTaskId : DEFAULT_TASK_SCOPE.taskId;
    await this.persist();
  }

  async create(input: CreateTaskScopeInput = {}): Promise<TaskScope> {
    const taskId = `task_${Date.now()}_${randomUUID().slice(0, 8)}`;
    const ttlMs = Math.max(1, input.ttlMinutes ?? 60) * 60 * 1000;
    const scope: TaskScope = {
      taskId,
      allowedRoots: input.allowedRoots ?? DEFAULT_TASK_SCOPE.allowedRoots,
      expiresAt: new Date(Date.now() + ttlMs).toISOString(),
      autoAllow: input.autoAllow ?? DEFAULT_TASK_SCOPE.autoAllow,
      requiresConfirm: input.requiresConfirm ?? DEFAULT_TASK_SCOPE.requiresConfirm,
      limits: { ...DEFAULT_TASK_SCOPE.limits, ...(input.limits ?? {}) }
    };
    this.scopes.set(taskId, scope);
    this.activeTaskId = taskId;
    await this.persist();
    return scope;
  }

  get(taskId = this.activeTaskId): TaskScope {
    const scope = this.scopes.get(taskId);
    if (!scope) throw new Error(`task scope not found: ${taskId}`);
    return scope;
  }

  active(): TaskScope {
    return this.get(this.activeTaskId);
  }

  async setActive(taskId: string): Promise<TaskScope> {
    const scope = this.get(taskId);
    this.activeTaskId = taskId;
    await this.persist();
    return scope;
  }

  list(): TaskScope[] {
    return [...this.scopes.values()];
  }

  private async persist(): Promise<void> {
    await this.store.write({ activeTaskId: this.activeTaskId, scopes: this.list() });
  }
}
