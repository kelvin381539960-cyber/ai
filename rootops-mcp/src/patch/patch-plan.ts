import type { PatchOperation, RiskLevel } from '../types.js';
import type { PatchEngine } from './patch-engine.js';

export interface PatchPlanInput {
  patches: PatchOperation[];
  maxFilesChanged: number;
  maxLinesChanged: number;
}

export interface PatchPlanResult {
  ok: boolean;
  risk: RiskLevel;
  summary: {
    patches: number;
    uniqueFiles: number;
    estimatedLinesChanged: number;
  };
  items: Array<{
    index: number;
    path: string;
    ok: boolean;
    reason: string;
    currentHash?: string;
    preview?: unknown;
  }>;
  blockers: string[];
}

export async function buildPatchPlan(engine: PatchEngine, input: PatchPlanInput): Promise<PatchPlanResult> {
  const uniqueFiles = new Set(input.patches.map((patch) => patch.path));
  const estimatedLinesChanged = input.patches.reduce((sum, patch) => {
    return sum + countLines(patch.oldText) + countLines(patch.newText);
  }, 0);
  const blockers: string[] = [];

  if (uniqueFiles.size > input.maxFilesChanged) blockers.push(`too many files changed: ${uniqueFiles.size} > ${input.maxFilesChanged}`);
  if (estimatedLinesChanged > input.maxLinesChanged) blockers.push(`too many estimated lines changed: ${estimatedLinesChanged} > ${input.maxLinesChanged}`);

  const items = [];
  for (let i = 0; i < input.patches.length; i += 1) {
    const patch = input.patches[i];
    const dry = await engine.dryRun(patch);
    items.push({ index: i, path: patch.path, ok: dry.ok, reason: dry.reason, currentHash: dry.currentHash, preview: dry.preview });
    if (!dry.ok) blockers.push(`patch ${i} failed: ${patch.path}: ${dry.reason}`);
  }

  return {
    ok: blockers.length === 0,
    risk: classifyPlanRisk(input.patches.length, uniqueFiles.size, estimatedLinesChanged),
    summary: { patches: input.patches.length, uniqueFiles: uniqueFiles.size, estimatedLinesChanged },
    items,
    blockers
  };
}

function countLines(value: string): number {
  return value.length === 0 ? 0 : value.split(/\r?\n/).length;
}

function classifyPlanRisk(patches: number, files: number, lines: number): RiskLevel {
  if (files > 20 || lines > 5000 || patches > 50) return 'R3';
  if (files > 8 || lines > 1200 || patches > 20) return 'R2';
  return 'R1';
}
