import { describe, expect, it } from "vitest";
import { authorizeSyntheticAction } from "../src/auth/action-auth.js";

const config = { expectedBearerToken: "synthetic-action-token" };

describe("Phase 9 synthetic auth wrapper extended", () => {
  it("rejects missing bearer token", () => {
    expect(authorizeSyntheticAction({}, config)).toEqual({ ok: false, reason: "missing_authorization" });
  });

  it("rejects invalid scheme", () => {
    expect(authorizeSyntheticAction({ authorization: "Basic synthetic-action-token" }, config)).toEqual({ ok: false, reason: "invalid_scheme" });
  });

  it("rejects wrong token", () => {
    expect(authorizeSyntheticAction({ authorization: "Bearer wrong-token" }, config)).toEqual({ ok: false, reason: "invalid_token" });
  });

  it("accepts correct token", () => {
    expect(authorizeSyntheticAction({ authorization: "Bearer synthetic-action-token" }, config)).toEqual({ ok: true });
  });
});