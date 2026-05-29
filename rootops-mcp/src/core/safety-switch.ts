export interface SafetyState {
  frozen: boolean;
  reason?: string;
  changedAt: string;
}

export class SafetySwitch {
  private state: SafetyState = { frozen: false, changedAt: new Date().toISOString() };

  freeze(reason = 'manual freeze'): SafetyState {
    this.state = { frozen: true, reason, changedAt: new Date().toISOString() };
    return this.state;
  }

  unfreeze(reason = 'manual unfreeze'): SafetyState {
    this.state = { frozen: false, reason, changedAt: new Date().toISOString() };
    return this.state;
  }

  status(): SafetyState {
    return { ...this.state };
  }

  allows(toolName: string): boolean {
    if (!this.state.frozen) return true;
    return /^(policy\.check|audit\.list|safety\.status|safety\.unfreeze|file\.read|file\.read_many|file\.search|file\.hash|file\.outline|local\.)/.test(toolName);
  }
}
