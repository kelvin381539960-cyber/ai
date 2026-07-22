type CommandSpec = { supportedCommands?: readonly string[] };

export default function codegenNativeCommands<T extends Record<string, (...args: any[]) => void>>(
  spec: CommandSpec,
): T {
  return Object.fromEntries(
    (spec.supportedCommands ?? []).map(command => [command, () => undefined]),
  ) as T;
}
