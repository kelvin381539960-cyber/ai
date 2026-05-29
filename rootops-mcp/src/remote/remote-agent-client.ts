export class RemoteAgentClient {
  async health(baseUrl: string, token: string): Promise<unknown> {
    return this.request(baseUrl, token, '/health');
  }

  async hash(baseUrl: string, token: string, path: string): Promise<unknown> {
    return this.request(baseUrl, token, `/v1/hash?path=${encodeURIComponent(path)}`);
  }

  async read(baseUrl: string, token: string, path: string, offset = 0, length = 65536): Promise<unknown> {
    return this.request(baseUrl, token, `/v1/read?path=${encodeURIComponent(path)}&offset=${offset}&length=${length}`);
  }

  async search(baseUrl: string, token: string, root: string, query: string, max = 50): Promise<unknown> {
    return this.request(baseUrl, token, `/v1/search?root=${encodeURIComponent(root)}&q=${encodeURIComponent(query)}&max=${max}`);
  }

  async exec(baseUrl: string, token: string, command: string, cwd?: string, timeoutMs = 300000): Promise<unknown> {
    return this.request(baseUrl, token, '/v1/exec', {
      method: 'POST',
      body: JSON.stringify({ command, cwd, timeoutMs })
    });
  }

  private async request(baseUrl: string, token: string, path: string, init: RequestInit = {}): Promise<unknown> {
    const url = new URL(path, ensureSlash(baseUrl));
    const response = await fetch(url, {
      ...init,
      headers: {
        authorization: `Bearer ${token}`,
        'content-type': 'application/json',
        ...(init.headers ?? {})
      }
    });
    const text = await response.text();
    let data: unknown;
    try { data = text ? JSON.parse(text) : {}; } catch { data = { raw: text }; }
    if (!response.ok) return { ok: false, status: response.status, data };
    return data;
  }
}

function ensureSlash(value: string): string {
  return value.endsWith('/') ? value : `${value}/`;
}
