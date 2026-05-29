import type { RiskLevel } from '../types.js';

const RISK_ORDER: RiskLevel[] = ['R0', 'R1', 'R2', 'R3', 'R4'];

export function compareRisk(a: RiskLevel, b: RiskLevel): number { return RISK_ORDER.indexOf(a) - RISK_ORDER.indexOf(b); }

export function classifyToolRisk(toolName: string): RiskLevel {
  if (/^(file\.read|file\.read_many|file\.list|file\.search|file\.index_|embedding\.index_|file\.hash|file\.outline|git\.status|git\.diff|git\.log|local\.|audit\.list|audit\.export|policy\.check|task\.scope\.|confirmation\.|safety\.)/.test(toolName)) return 'R0';
  if (/^(snapshot\.create|patch\.dry_run|patch\.plan|patch\.verify|patch\.apply|file\.patch|file\.write|file\.related|remote\.agent\.(health|hash|read|search))$/.test(toolName)) return 'R1';
  if (/^(build\.run|git\.branch|git\.worktree|remote\.session|remote\.exec|remote\.pty|remote\.tunnel|remote\.agent|remote\.group\.|remote\.rsync|ssh\.exec|rsync\.)/.test(toolName)) return 'R2';
  if (/^(git\.commit|git\.push|deploy\.|systemctl|database\.write)$/.test(toolName)) return 'R3';
  if (/^(sudo|policy\.manage|approval\.bypass|git\.rollback|file\.delete|snapshot\.restore)/.test(toolName)) return 'R4';
  return 'R2';
}
