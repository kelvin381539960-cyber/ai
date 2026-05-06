export interface BridgeServiceConfig {
  port: number;
  databaseUrl: string;
  actionBearerToken: string;
}

export interface HealthResponse {
  status: "ok";
  version: string;
}

export function getHealth(): HealthResponse {
  return {
    status: "ok",
    version: "0.1.0-scaffold"
  };
}
