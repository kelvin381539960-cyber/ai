import { randomUUID } from 'node:crypto';
import type { TaskScope } from '../types.js';
import { DEFAULT_TASK_SCOPE } from '../config/default-policy.js';

export interface CreateTaskScopeInput {
  allowedRoots?: string[];
  autoAllow?: string[];
  requiresConfirm?: string[];
  ttlMinutes?: number;
  limits?: Partial<TaskScope['limits']>;
}

export class TaskScopeStore {
  private readonly scopes = new Map<string, TaskScope>();
  private activeTaskId = DEFAULT_TASK_SCOPE.taskId;

  constructor() {
    this.scopes.set(DEFAULT_TASK_SCOPE.taskId, DEFAULT_TASK_SCOPE);
  }

  create(input: CreateTaskScopeInput = {}): TaskScope {
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

  setActive(taskId: string): TaskScope {
    const scope = this.get(taskId);
    this.activeTaskId = taskId;
    return scope;
  }

  list(): TaskScope[] {
    return [...this.scopes.values()];
  }
}
