export interface OllamaClientOptions {
  baseUrl: string;
  embeddingModel: string;
  instructModel: string;
}

export class OllamaClient {
  constructor(private readonly options: OllamaClientOptions) {}

  async embed(texts: string[]): Promise<number[][]> {
    const response = await fetch(`${this.options.baseUrl}/api/embed`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ model: this.options.embeddingModel, input: texts })
    });

    if (!response.ok) {
      throw new Error(`ollama embed failed: ${response.status} ${await response.text()}`);
    }

    const data = await response.json() as { embeddings?: number[][] };
    return data.embeddings ?? [];
  }

  async generateJson<T>(prompt: string): Promise<T> {
    const response = await fetch(`${this.options.baseUrl}/api/generate`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ model: this.options.instructModel, prompt, stream: false, format: 'json' })
    });

    if (!response.ok) {
      throw new Error(`ollama generate failed: ${response.status} ${await response.text()}`);
    }

    const data = await response.json() as { response?: string };
    if (!data.response) throw new Error('ollama returned empty response');
    return JSON.parse(data.response) as T;
  }
}
