import assert from 'node:assert/strict';
import http from 'node:http';
import { RemoteAgentClient } from '../src/remote/remote-agent-client.js';

const token = 'test-token';
const server = http.createServer((req, res) => {
  const authorized = req.headers.authorization === `Bearer ${token}`;
  if (!authorized) {
    res.writeHead(401, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ ok: false, error: 'unauthorized' }));
    return;
  }

  const url = new URL(req.url ?? '/', 'http://127.0.0.1');
  res.writeHead(200, { 'content-type': 'application/json' });
  if (url.pathname === '/health') {
    res.end(JSON.stringify({ ok: true, agent: 'test-agent' }));
    return;
  }
  if (url.pathname === '/v1/hash') {
    res.end(JSON.stringify({ ok: true, path: url.searchParams.get('path'), sha256: 'demo', bytes: 4 }));
    return;
  }
  if (url.pathname === '/v1/read') {
    res.end(JSON.stringify({ ok: true, path: url.searchParams.get('path'), text: 'demo' }));
    return;
  }
  if (url.pathname === '/v1/search') {
    res.end(JSON.stringify({ ok: true, hits: [{ path: 'demo.ts', snippet: 'demo' }] }));
    return;
  }
  if (url.pathname === '/v1/exec') {
    let body = '';
    req.on('data', (chunk) => { body += chunk; });
    req.on('end', () => {
      const parsed = JSON.parse(body || '{}');
      res.end(JSON.stringify({ ok: true, stdout: parsed.command, stderr: '', exitCode: 0 }));
    });
    return;
  }
  res.end(JSON.stringify({ ok: false, error: 'not found' }));
});

await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
const address = server.address();
assert.equal(typeof address, 'object');
assert.ok(address && 'port' in address);
const baseUrl = `http://127.0.0.1:${address.port}`;
const client = new RemoteAgentClient();

const health = await client.health(baseUrl, token) as { ok: boolean; agent: string };
assert.equal(health.ok, true);
assert.equal(health.agent, 'test-agent');

const hash = await client.hash(baseUrl, token, '/tmp/demo.txt') as { ok: boolean; path: string };
assert.equal(hash.ok, true);
assert.equal(hash.path, '/tmp/demo.txt');

const read = await client.read(baseUrl, token, '/tmp/demo.txt') as { ok: boolean; text: string };
assert.equal(read.ok, true);
assert.equal(read.text, 'demo');

const search = await client.search(baseUrl, token, '/tmp', 'demo') as { ok: boolean; hits: unknown[] };
assert.equal(search.ok, true);
assert.equal(search.hits.length, 1);

const exec = await client.exec(baseUrl, token, 'uptime') as { ok: boolean; stdout: string };
assert.equal(exec.ok, true);
assert.equal(exec.stdout, 'uptime');

await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
console.log(JSON.stringify({ ok: true, baseUrl }, null, 2));
