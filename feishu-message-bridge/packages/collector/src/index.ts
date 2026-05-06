export interface CollectorConfig {
  deviceId: string;
  allowlistPath: string;
  bridgeBaseUrl: string;
}

export interface CollectorRuntime {
  start(): Promise<void>;
  stop(): Promise<void>;
}

export function createCollectorRuntime(_config: CollectorConfig): CollectorRuntime {
  return {
    async start() {
      throw new Error("Collector runtime is scaffold-only. Real runtime is not implemented yet.");
    },
    async stop() {
      return;
    }
  };
}
