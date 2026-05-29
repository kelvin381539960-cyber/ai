import { spawn } from "node:child_process";

export type ProcessResult = {
  status: "success" | "failed" | "timeout";
  stdout: string;
  stderr: string;
  exitCode: number | null;
};

export function runProcess(
  command: string,
  args: string[],
  input: string,
  timeoutSeconds: number,
  cwd?: string,
): Promise<ProcessResult> {
  return new Promise((resolve) => {
    const child = spawn(command, args, {
      stdio: ["pipe", "pipe", "pipe"],
      env: process.env,
      shell: false,
      cwd,
    });

    let stdout = "";
    let stderr = "";
    let settled = false;

    const timeout = setTimeout(() => {
      if (settled) return;
      settled = true;
      child.kill("SIGTERM");
      resolve({ status: "timeout", stdout, stderr, exitCode: null });
    }, timeoutSeconds * 1000);

    child.stdout.on("data", (chunk: Buffer) => {
      stdout += chunk.toString("utf8");
    });

    child.stderr.on("data", (chunk: Buffer) => {
      stderr += chunk.toString("utf8");
    });

    child.on("error", (error) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      resolve({ status: "failed", stdout, stderr: `${stderr}${error.message}`, exitCode: null });
    });

    child.on("close", (code) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      resolve({
        status: code === 0 ? "success" : "failed",
        stdout,
        stderr,
        exitCode: code,
      });
    });

    child.stdin.write(input);
    child.stdin.end();
  });
}
