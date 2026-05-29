import { z } from 'zod';
import { FileIndex } from '../file/file-index.js';

export const fileIndexToolDefinitions = [
  {
    name: 'file.index_build',
    description: 'Build or incrementally update the SQLite FTS5 file index.',
    inputSchema: {
      type: 'object',
      properties: {
        root: { type: 'string' },
        file_glob: { type: 'string' },
        max_file_bytes: { type: 'number', default: 1048576 },
        force: { type: 'boolean', default: false }
      }
    }
  },
  {
    name: 'file.index_search',
    description: 'Search the SQLite FTS5 file index.',
    inputSchema: {
      type: 'object',
      properties: {
        root: { type: 'string' },
        query: { type: 'string' },
        limit: { type: 'number', default: 20 },
        offset: { type: 'number', default: 0 },
        snippet_chars: { type: 'number', default: 400 }
      },
      required: ['query']
    }
  },
  {
    name: 'file.index_stats',
    description: 'Show SQLite FTS5 file index statistics.',
    inputSchema: {
      type: 'object',
      properties: {
        root: { type: 'string' }
      }
    }
  }
];

export const FileIndexBuildArgs = z.object({
  root: z.string().optional(),
  file_glob: z.string().optional(),
  max_file_bytes: z.number().int().min(1).max(10 * 1024 * 1024).default(1024 * 1024),
  force: z.boolean().default(false)
});

export const FileIndexSearchArgs = z.object({
  root: z.string().optional(),
  query: z.string().min(1),
  limit: z.number().int().min(1).max(200).default(20),
  offset: z.number().int().min(0).default(0),
  snippet_chars: z.number().int().min(80).max(2000).default(400)
});

export const FileIndexStatsArgs = z.object({
  root: z.string().optional()
});

export async function callFileIndexTool(fileIndex: FileIndex, name: string, args: unknown): Promise<unknown> {
  switch (name) {
    case 'file.index_build': {
      const parsed = FileIndexBuildArgs.parse(args);
      return fileIndex.build({
        root: parsed.root,
        fileGlob: parsed.file_glob,
        maxFileBytes: parsed.max_file_bytes,
        force: parsed.force
      });
    }
    case 'file.index_search': {
      const parsed = FileIndexSearchArgs.parse(args);
      return fileIndex.search({
        root: parsed.root,
        query: parsed.query,
        limit: parsed.limit,
        offset: parsed.offset,
        snippetChars: parsed.snippet_chars
      });
    }
    case 'file.index_stats': {
      const parsed = FileIndexStatsArgs.parse(args);
      return fileIndex.stats(parsed.root);
    }
    default:
      throw new Error(`unknown file index tool: ${name}`);
  }
}

export function isFileIndexTool(name: string): boolean {
  return name === 'file.index_build' || name === 'file.index_search' || name === 'file.index_stats';
}
