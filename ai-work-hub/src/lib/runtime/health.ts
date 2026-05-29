import { runProcess } from "@/lib/runtime/process";

export async function testCommand(command: string) {
  if (!command) return { ok: true, message: "Manual agent is ready." };
  const result = await runProcess("sh", ["-lc", `command -v ${escapeShell(command)}`], "", 5);
  if (result.status === "success" && result.stdout.trim()) {
    return { ok: true, message: result.stdout.trim() };
  }
  return { ok: false, message: `${command} is not available in PATH.` };
}

function escapeShell(command: string) {
  return command.replace(/[^a-zA-Z0-9._/-]/g, "");
}
