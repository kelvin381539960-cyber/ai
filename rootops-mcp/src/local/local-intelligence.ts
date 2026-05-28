import type { LocalRerankCandidate, LocalRerankResult, PatchOperation } from '../types.js';
import { OllamaClient } from './ollama-client.js';

export class LocalIntelligence {
  constructor(private readonly ollama: OllamaClient) {}

  async embed(texts: string[]): Promise<number[][]> {
    return this.ollama.embed(texts);
  }

  async rerank(query: string, candidates: LocalRerankCandidate[]): Promise<LocalRerankResult[]> {
    if (candidates.length === 0) return [];

    const prompt = [
      'Return JSON only. Rank candidates for the query.',
      `Query: ${query}`,
      'Schema: {"items":[{"id":"string","score":number}]}',
      `Candidates: ${JSON.stringify(candidates.map((c) => ({ id: c.id, text: c.text.slice(0, 2000) })))}`
    ].join('\n');

    const result = await this.ollama.generateJson<{ items: { id: string; score: number }[] }>(prompt);
    const scoreById = new Map(result.items.map((item) => [item.id, item.score]));

    return candidates
      .map((candidate) => ({ ...candidate, score: scoreById.get(candidate.id) ?? 0 }))
      .sort((a, b) => b.score - a.score);
  }

  async summarizeLargeText(text: string): Promise<{ summary: string; risks: string[]; keyFacts: string[] }> {
    return this.ollama.generateJson([
      'Return JSON only. Summarize this large text for an AI coding/ops agent.',
      'Schema: {"summary":"string","risks":["string"],"keyFacts":["string"]}',
      text.slice(0, 120000)
    ].join('\n'));
  }

  async classifyPatchRisk(patch: PatchOperation): Promise<{ riskHint: string; reasons: string[] }> {
    return this.ollama.generateJson([
      'Return JSON only. Classify this patch risk. Do not authorize anything.',
      'Schema: {"riskHint":"string","reasons":["string"]}',
      JSON.stringify(patch)
    ].join('\n'));
  }
}
