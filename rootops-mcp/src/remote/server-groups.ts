import type { ServerGroup, SshTarget } from './remote-types.js';

export class ServerGroupRegistry {
  private readonly groups = new Map<string, ServerGroup>();

  register(name: string, targets: SshTarget[]): ServerGroup {
    const group: ServerGroup = { name, targets };
    this.groups.set(name, group);
    return group;
  }

  get(name: string): ServerGroup {
    const group = this.groups.get(name);
    if (!group) throw new Error(`server group not found: ${name}`);
    return group;
  }

  list(): ServerGroup[] {
    return [...this.groups.values()];
  }
}
