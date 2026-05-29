import { Buffer } from 'node:buffer';
import { randomBytes } from 'node:crypto';
import { RemoteOps } from './remote-ops.js';
import type { SshTarget } from './remote-types.js';

export interface AgentBootstrapResult {
  ok: boolean;
  installPath: string;
  port: number;
  token: string;
  pidFile: string;
  logFile: string;
  stdout: string;
  stderr: string;
  probe?: unknown;
}

const DEFAULT_AGENT_PORT = Number(process.env.ROOTOPS_REMOTE_AGENT_PORT ?? 18765);

export class AgentBootstrap {
  constructor(private readonly remote = new RemoteOps()) {}

  async install(target: SshTarget, installPath = '/tmp/aix-rootops-agent.js'): Promise<AgentBootstrapResult> {
    const port = DEFAULT_AGENT_PORT;
    const token = `ra_${randomBytes(24).toString('hex')}`;
    const pidFile = `${installPath}.pid`;
    const logFile = `${installPath}.log`;
    const encoded = Buffer.from(buildAgentScript(), 'utf8').toString('base64');
    const command = [
      `cat > ${shellQuote(installPath)}.b64 <<'EOF'`,
      encoded,
      'EOF',
      `base64 -d ${shellQuote(installPath)}.b64 > ${shellQuote(installPath)}`,
      `chmod +x ${shellQuote(installPath)}`,
      `rm -f ${shellQuote(installPath)}.b64`,
      `if [ -f ${shellQuote(pidFile)} ] && kill -0 $(cat ${shellQuote(pidFile)}) 2>/dev/null; then kill $(cat ${shellQuote(pidFile)}) 2>/dev/null || true; fi`,
      `ROOTOPS_AGENT_TOKEN=${shellQuote(token)} ROOTOPS_AGENT_HOST=127.0.0.1 ROOTOPS_AGENT_PORT=${port} nohup node ${shellQuote(installPath)} serve > ${shellQuote(logFile)} 2>&1 & echo $! > ${shellQuote(pidFile)}`,
      `sleep 1`,
      `${shellQuote(installPath)} health`,
      `node -e ${shellQuote(`const http=require('http');const token=process.env.TOKEN;const req=http.request({host:'127.0.0.1',port:${port},path:'/health',headers:{Authorization:'Bearer '+token}},res=>{let d='';res.on('data',c=>d+=c);res.on('end',()=>{console.log(d);process.exit(res.statusCode===200?0:1);});});req.on('error',e=>{console.error(e.message);process.exit(1)});req.end();`)} TOKEN=${shellQuote(token)}`
    ].join('\n');

    const result = await this.remote.sshExec(target, command, { timeoutMs: 120000 });
    return {
      ok: result.ok,
      installPath,
      port,
      token,
      pidFile,
      logFile,
      stdout: result.stdout,
      stderr: result.stderr,
      probe: parseProbe(result.stdout)
    };
  }
}

function parseProbe(stdout: string): unknown {
  const lines = stdout.split(/\r?\n/).filter((line) => line.trim().startsWith('{'));
  const line = lines.at(-1);
  if (!line) return undefined;
  try { return JSON.parse(line); } catch { return undefined; }
}

function shellQuote(value: string): string {
  return `'${value.replace(/'/g, `'\\''`)}'`;
}

function buildAgentScript(): string {
  return String.raw`#!/usr/bin/env node
const http = require('http');
const fs = require('fs');
const fsp = require('fs/promises');
const path = require('path');
const crypto = require('crypto');
const { execFile, exec } = require('child_process');

const VERSION = '0.2.0';
const TOKEN = process.env.ROOTOPS_AGENT_TOKEN || '';
const HOST = process.env.ROOTOPS_AGENT_HOST || '127.0.0.1';
const PORT = Number(process.env.ROOTOPS_AGENT_PORT || 18765);
const MAX_READ_BYTES = Number(process.env.ROOTOPS_AGENT_MAX_READ_BYTES || 1024 * 1024);
const MAX_EXEC_MS = Number(process.env.ROOTOPS_AGENT_MAX_EXEC_MS || 300000);

function json(value) { return JSON.stringify(value); }
function send(res, code, value) { const body = json(value); res.writeHead(code, { 'content-type': 'application/json', 'content-length': Buffer.byteLength(body) }); res.end(body); }
function readBody(req) { return new Promise((resolve, reject) => { let data = ''; req.on('data', c => { data += c; if (data.length > 1024 * 1024) reject(new Error('body too large')); }); req.on('end', () => { try { resolve(data ? JSON.parse(data) : {}); } catch (e) { reject(e); } }); req.on('error', reject); }); }
function authorized(req) { if (!TOKEN) return true; return req.headers.authorization === 'Bearer ' + TOKEN || req.headers['x-rootops-token'] === TOKEN; }
function health() { return { ok: true, agent: 'aix-rootops-remote-agent', version: VERSION, ts: new Date().toISOString(), host: require('os').hostname(), pid: process.pid }; }
function shellQuote(value) { return `'${String(value).replace(/'/g, `'\\''`)}'`; }
function blockedCommand(command) { return [/\brm\s+-rf\s+\//i, /\bmkfs\b/i, /\bdd\s+if=.*\s+of=\/dev\//i, /\bshutdown\b/i, /\breboot\b/i, /\bhalt\b/i, /\bchmod\s+-R\s+777\b/i].some(re => re.test(command)); }
async function sha256(file) { const data = await fsp.readFile(file); return { path: file, sha256: crypto.createHash('sha256').update(data).digest('hex'), bytes: data.length }; }
async function readFileWindow(file, offset = 0, length = MAX_READ_BYTES) { const data = await fsp.readFile(file); const start = Math.max(0, Number(offset) || 0); const end = Math.min(data.length, start + Math.min(Number(length) || MAX_READ_BYTES, MAX_READ_BYTES)); return { path: file, offset: start, bytes: end - start, totalBytes: data.length, text: data.subarray(start, end).toString('utf8'), truncated: end < data.length }; }
async function searchFiles(root, query, max = 50) { const hits = []; async function walk(dir) { if (hits.length >= max) return; let entries = []; try { entries = await fsp.readdir(dir, { withFileTypes: true }); } catch { return; } for (const entry of entries) { if (hits.length >= max) break; if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === 'dist' || entry.name === 'build') continue; const full = path.join(dir, entry.name); if (entry.isDirectory()) await walk(full); else if (entry.isFile()) { if (entry.name.includes(query)) hits.push({ path: full, matchType: 'filename', snippet: entry.name }); let text = ''; try { const st = await fsp.stat(full); if (st.size > 512 * 1024) continue; text = await fsp.readFile(full, 'utf8'); } catch { continue; } const idx = text.toLowerCase().indexOf(String(query).toLowerCase()); if (idx >= 0) hits.push({ path: full, matchType: 'content', snippet: text.slice(Math.max(0, idx - 120), idx + 300) }); } } } await walk(root); return { root, query, hits }; }
function runCommand(command, cwd, timeoutMs) { return new Promise((resolve) => { if (blockedCommand(command)) return resolve({ ok: false, exitCode: 126, stdout: '', stderr: 'blocked command' }); exec(command, { cwd, timeout: Math.min(Number(timeoutMs) || MAX_EXEC_MS, MAX_EXEC_MS), maxBuffer: 20 * 1024 * 1024 }, (error, stdout, stderr) => resolve({ ok: !error, exitCode: error && typeof error.code === 'number' ? error.code : 0, stdout, stderr })); }); }
async function handle(req, res) { try { if (!authorized(req)) return send(res, 401, { ok: false, error: 'unauthorized' }); const url = new URL(req.url, 'http://127.0.0.1'); if (req.method === 'GET' && url.pathname === '/health') return send(res, 200, health()); if (req.method === 'GET' && url.pathname === '/v1/hash') return send(res, 200, { ok: true, ...(await sha256(url.searchParams.get('path'))) }); if (req.method === 'GET' && url.pathname === '/v1/read') return send(res, 200, { ok: true, ...(await readFileWindow(url.searchParams.get('path'), url.searchParams.get('offset'), url.searchParams.get('length'))) }); if (req.method === 'GET' && url.pathname === '/v1/search') return send(res, 200, { ok: true, ...(await searchFiles(url.searchParams.get('root') || process.cwd(), url.searchParams.get('q') || '', Number(url.searchParams.get('max') || 50))) }); if (req.method === 'POST' && url.pathname === '/v1/exec') { const body = await readBody(req); return send(res, 200, { ok: true, ...(await runCommand(body.command, body.cwd, body.timeoutMs)) }); } return send(res, 404, { ok: false, error: 'not found' }); } catch (error) { return send(res, 500, { ok: false, error: error && error.message ? error.message : String(error) }); } }
async function cli() { const cmd = process.argv[2] || 'health'; if (cmd === 'serve') { http.createServer(handle).listen(PORT, HOST, () => console.log(json(health()))); return; } if (cmd === 'health') return console.log(json(health())); if (cmd === 'hash') return console.log(json(await sha256(process.argv[3]))); if (cmd === 'stat') return execFile('stat', [process.argv[3]], (e, stdout, stderr) => { if (e) { console.error(stderr || e.message); process.exit(1); } console.log(stdout); }); if (cmd === 'which') { for (const bin of process.argv.slice(3)) { execFile('which', [bin], (e, stdout) => console.log(bin + '=' + (e ? '' : stdout.trim()))); } return; } console.error('unknown command: ' + cmd); process.exit(2); }
cli().catch(err => { console.error(err && err.stack ? err.stack : String(err)); process.exit(1); });
`;
}
