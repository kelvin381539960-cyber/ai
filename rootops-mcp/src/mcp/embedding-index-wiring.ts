import { z } from 'zod';
import { EmbeddingIndex } from '../file/embedding-index.js';

export const embeddingIndexToolDefinitions = [
  {
    name: 'embedding.index_build',
    description: 'Build or incrementally update the local embedding index using Ollama embeddings.',
    inputSchema: {
      type: 'object',
      properties: {
        root: { type: 'string' },
        file_glob: { type: 'string' },
        max_file_bytes: { type: 'number', default: 524288 },
        chunk_chars: { type: 'number', default: 3000 },
        force: { type: 'boolean', default: false }
      }
    }
  },
  {
    name: 'embedding.index_search',
    description: 'Semantic search over the local embedding index.',
    inputSchema: {
      type: 'object',
      properties: {
        root: { type: 'string' },
        query: { type: 'string' },
        limit: { type: 'number', default: 10 }
      },
      required: ['query']
    }
  },
  {
    name: 'embedding.index_stats',
    description: 'Show local embedding index statistics.',
    inputSchema: { type: 'object', properties: { root: { type: 'string' } } }
  }
];

export const EmbeddingIndexBuildArgs = z.object({
  root: z.string().optional(),
  file_glob: z.string().optional(),
  max_file_bytes: z.number().int().min(1).max(10 * 1024 * 1024).default(512 * 1024),
  chunk_chars: z.number().int().min(500).max(20000).default(3000),
  force: z.boolean().default(false)
});

export const EmbeddingIndexSearchArgs = z.object({
  root: z.string().optional(),
  query: z.string().min(1),
  limit: z.number().int().min(1).max(100).default(10)
});

export const EmbeddingIndexStatsArgs = z.object({ root: z.string().optional() });

export async function callEmbeddingIndexTool(embeddingIndex: EmbeddingIndex, name: string, args: unknown): Promise<unknown> {
  switch (name) {
    case 'embedding.index_build': {
      const parsed = EmbeddingIndexBuildArgs.parse(args);
      return embeddingIndex.build({ root: parsed.root, fileGlob: parsed.file_glob, maxFileBytes: parsed.max_file_bytes, chunkChars: parsed.chunk_chars, force: parsed.force });
    }
    case 'embedding.index_search': {
      const parsed = EmbeddingIndexSearchArgs.parse(args);
      return embeddingIndex.search({ root: parsed.root, query: parsed.query, limit: parsed.limit });
    }
    case 'embedding.index_stats': {
      const parsed = EmbeddingIndexStatsArgs.parse(args);
      return embeddingIndex.stats(parsed.root);
    }
    default:
      throw new Error(`unknown embedding index tool: ${name}`);
  }
}

export function isEmbeddingIndexTool(name: string): boolean {
  return name === 'embedding.index_build' || name === 'embedding.index_search' || name === 'embedding.index_stats';
}
