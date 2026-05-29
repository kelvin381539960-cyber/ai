import { runProcess } from "@/lib/runtime/process";
import type { AgentExecutionRequest, AgentExecutionResult } from "@/lib/types";

type AgentConfig = {
  id: string;
  name: string;
  type: string;
  agentKey: string;
  command: string;
  timeoutSeconds: number;
};

export async function runAgent(
  request: AgentExecutionRequest,
  agent: AgentConfig,
): Promise<AgentExecutionResult> {
  if (agent.type === "manual") {
    return {
      runId: request.runId,
      agentId: agent.id,
      status: "waiting_user",
      finalText: request.prompt,
    };
  }

  if (agent.type === "harness") {
    const result = await runProcess(
      agent.command || "harness",
      ["run", "--agent", agent.agentKey, "--prompt", request.prompt],
      "",
      request.timeoutSeconds,
      request.workspacePath || undefined,
    );
    return {
      runId: request.runId,
      agentId: agent.id,
      status: result.status,
      stdout: result.stdout,
      stderr: result.stderr,
      finalText: extractFinalText(result.stdout),
      errorMessage: result.status === "failed" ? result.stderr || "Harness execution failed" : undefined,
    };
  }

  const result = await runProcess(agent.command, [], request.prompt, request.timeoutSeconds, request.workspacePath || undefined);
  return {
    runId: request.runId,
    agentId: agent.id,
    status: result.status,
    stdout: result.stdout,
    stderr: result.stderr,
    finalText: result.stdout.trim(),
    errorMessage: result.status === "failed" ? result.stderr || "CLI execution failed" : undefined,
  };
}

function extractFinalText(stdout: string) {
  const lines = stdout
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  const textLines: string[] = [];

  for (const line of lines) {
    try {
      const event = JSON.parse(line) as { type?: string; text?: string; message?: string; content?: string };
      if (event.text) textLines.push(event.text);
      if (event.message) textLines.push(event.message);
      if (event.content) textLines.push(event.content);
    } catch {
      textLines.push(line);
    }
  }

  return textLines.join("\n").trim();
}
