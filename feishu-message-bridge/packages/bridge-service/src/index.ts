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
    version: "0.1.0-post-gate-5-hardening"
  };
}

export * from "./messages/types.js";
export * from "./messages/message-repository.js";
export * from "./messages/in-memory-message-repository.js";
export * from "./messages/synthetic-records.js";
export * from "./messages/search-service.js";
export * from "./messages/thread-query-service.js";
export * from "./messages/summary-service.js";
export * from "./messages/work-item-service.js";
export * from "./routes/handlers.js";
export * from "./routes/response-mappers.js";
export * from "./sync-lock/in-memory-sync-lock.js";
export * from "./api/limit.js";
