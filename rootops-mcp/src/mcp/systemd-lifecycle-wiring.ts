import { z } from 'zod';
import { RemoteAgentSystemd } from '../remote/remote-agent-systemd.js';

const SshTargetSchema = z.object({
  host: z.string(),
  user: z.string().optional(),
  port: z.number().int().min(1).max(65535).optional(),
  identityFile: z.string().optional()
});

export const systemdLifecycleToolDefinitions = [
  {
    name: 'remote.agent.systemd_uninstall',
    description: 'Uninstall the remote agent systemd service and remove its env file.',
    inputSchema: {
      type: 'object',
      properties: {
        target: { type: 'object' },
        service_name: { type: 'string', default: 'aix-rootops-agent' },
        approval_token: { type: 'string' }
      },
      required: ['target']
    }
  },
  {
    name: 'remote.agent.systemd_rotate_token',
    description: 'Rotate the remote agent systemd token and restart the service.',
    inputSchema: {
      type: 'object',
      properties: {
        target: { type: 'object' },
        service_name: { type: 'string', default: 'aix-rootops-agent' },
        new_token: { type: 'string' },
        approval_token: { type: 'string' }
      },
      required: ['target']
    }
  }
];

export const RemoteAgentSystemdUninstallArgs = z.object({
  target: SshTargetSchema,
  service_name: z.string().default('aix-rootops-agent')
});

export const RemoteAgentSystemdRotateTokenArgs = z.object({
  target: SshTargetSchema,
  service_name: z.string().default('aix-rootops-agent'),
  new_token: z.string().optional()
});

export async function callSystemdLifecycleTool(agentSystemd: RemoteAgentSystemd, name: string, args: unknown): Promise<unknown> {
  switch (name) {
    case 'remote.agent.systemd_uninstall': {
      const parsed = RemoteAgentSystemdUninstallArgs.parse(args);
      return agentSystemd.uninstall(parsed.target, parsed.service_name);
    }
    case 'remote.agent.systemd_rotate_token': {
      const parsed = RemoteAgentSystemdRotateTokenArgs.parse(args);
      const token = await agentSystemd.rotateToken(parsed.target, parsed.service_name, parsed.new_token);
      return { ok: true, serviceName: parsed.service_name, token };
    }
    default:
      throw new Error(`unknown systemd lifecycle tool: ${name}`);
  }
}

export function isSystemdLifecycleTool(name: string): boolean {
  return name === 'remote.agent.systemd_uninstall' || name === 'remote.agent.systemd_rotate_token';
}
