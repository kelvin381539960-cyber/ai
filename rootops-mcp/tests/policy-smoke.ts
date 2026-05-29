import assert from 'node:assert/strict';
import { DEFAULT_TASK_SCOPE } from '../src/config/default-policy.js';
import { PolicyEngine } from '../src/core/policy-engine.js';
import { classifyToolRisk } from '../src/core/risk.js';
import type { ToolCallContext } from '../src/types.js';

function ctx(toolName: string, args: Record<string, unknown> = {}): ToolCallContext {
  return {
    taskId: DEFAULT_TASK_SCOPE.taskId,
    actor: 'test',
    toolName,
    profile: 'read_only',
    args,
    risk: classifyToolRisk(toolName)
  };
}

const policy = new PolicyEngine(DEFAULT_TASK_SCOPE);

const readonly = policy.authorize(ctx('file.read', { path: '/tmp/demo.txt' }));
assert.equal(readonly.allowed, true, 'file.read should be auto-allowed');
assert.equal(readonly.requiresConfirmation, false, 'file.read should not require confirmation');

const remoteRead = policy.authorize(ctx('remote.agent.health', { base_url: 'http://127.0.0.1:18765', token: 'test' }));
assert.equal(remoteRead.allowed, true, 'remote.agent.health should be auto-allowed');

const dangerous = policy.authorize(ctx('snapshot.restore', { snapshot_id: 'snap_test' }));
assert.equal(dangerous.allowed, false, 'snapshot.restore should not be auto-allowed');
assert.equal(dangerous.requiresConfirmation, true, 'snapshot.restore should require confirmation');

const bypass = policy.authorize(ctx('approval.bypass'));
assert.equal(bypass.allowed, false, 'approval.bypass must stay blocked');

console.log(JSON.stringify({ ok: true, checks: ['file.read', 'remote.agent.health', 'snapshot.restore', 'approval.bypass'] }, null, 2));
