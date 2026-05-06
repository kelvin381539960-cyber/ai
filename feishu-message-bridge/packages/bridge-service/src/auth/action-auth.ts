export interface SyntheticActionAuthConfig {
  expectedBearerToken: string;
}

export interface SyntheticActionAuthHeaders {
  authorization?: string;
}

export interface SyntheticActionAuthResult {
  ok: boolean;
  reason?: "missing_authorization" | "invalid_scheme" | "invalid_token";
}

export function authorizeSyntheticAction(headers: SyntheticActionAuthHeaders, config: SyntheticActionAuthConfig): SyntheticActionAuthResult {
  const authorization = headers.authorization?.trim();

  if (!authorization) {
    return { ok: false, reason: "missing_authorization" };
  }

  const [scheme, token] = authorization.split(/\s+/, 2);
  if (scheme?.toLowerCase() !== "bearer" || !token) {
    return { ok: false, reason: "invalid_scheme" };
  }

  if (token !== config.expectedBearerToken) {
    return { ok: false, reason: "invalid_token" };
  }

  return { ok: true };
}
