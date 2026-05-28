export interface CommandRiskResult {
  allowed: boolean;
  risk: 'low' | 'medium' | 'high' | 'blocked';
  reasons: string[];
}

const BLOCK_PATTERNS = [
  /\brm\s+-rf\s+\//i,
  /\bmkfs\b/i,
  /\bdd\s+if=.*\s+of=\/dev\//i,
  /\bshutdown\b/i,
  /\breboot\b/i,
  /\bhalt\b/i,
  /\bpasswd\b/i,
  /\buserdel\b/i,
  /\bgroupdel\b/i,
  /\bchmod\s+-R\s+777\b/i,
  /\bchown\s+-R\b/i,
  /\biptables\b/i,
  /\bufw\b/i,
  /\bfirewall-cmd\b/i
];

const HIGH_RISK_PATTERNS = [
  /\bsudo\b/i,
  /\bsu\s+-/i,
  /\bsystemctl\s+(restart|stop|disable|enable)/i,
  /\bdocker\s+(rm|rmi|system\s+prune)/i,
  /\bkubectl\s+(delete|apply|scale)/i,
  /\bmysql\b.*\b(delete|update|drop|truncate)\b/i,
  /\bpsql\b.*\b(delete|update|drop|truncate)\b/i,
  /\bgit\s+push\b/i,
  /\bgit\s+reset\s+--hard\b/i
];

export function assessCommandRisk(command: string): CommandRiskResult {
  const blocked = BLOCK_PATTERNS.filter((pattern) => pattern.test(command));
  if (blocked.length > 0) {
    return { allowed: false, risk: 'blocked', reasons: blocked.map((pattern) => `blocked pattern: ${pattern}`) };
  }

  const high = HIGH_RISK_PATTERNS.filter((pattern) => pattern.test(command));
  if (high.length > 0) {
    return { allowed: true, risk: 'high', reasons: high.map((pattern) => `high-risk pattern: ${pattern}`) };
  }

  if (command.length > 2000) {
    return { allowed: true, risk: 'medium', reasons: ['long command'] };
  }

  return { allowed: true, risk: 'low', reasons: [] };
}
