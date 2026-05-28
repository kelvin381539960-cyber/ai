import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';

export class FileEngine {
  async readLines(path: string, start = 1, limit = 200): Promise<{ lines: string[]; nextStart?: number }> {
    const text = await readFile(path, 'utf8');
    const all = text.split(/\r?\n/);
    const slice = all.slice(Math.max(start - 1, 0), Math.max(start - 1, 0) + limit);
    const next = start - 1 + limit < all.length ? start + limit : undefined;
    return { lines: slice.map((line, i) => `${start + i}: ${line}`), nextStart: next };
  }

  async readBytes(path: string, offset = 0, length = 64 * 1024): Promise<Buffer> {
    const data = await readFile(path);
    return data.subarray(offset, offset + length);
  }

  async hash(path: string): Promise<{ sha256: string; bytes: number }> {
    const data = await readFile(path);
    return {
      sha256: createHash('sha256').update(data).digest('hex'),
      bytes: data.byteLength
    };
  }
}
