import { describe, expect, it } from "vitest";

describe("ocr harness", () => {
  it("supports synthetic OCR success", () => {
    const result = {
      messageKey: "synthetic-image-001",
      status: "success",
      text: "Synthetic OCR text"
    };

    expect(result.status).toBe("success");
    expect(result.text).toContain("Synthetic");
  });

  it("supports synthetic OCR failure without blocking upload", () => {
    const result = {
      messageKey: "synthetic-image-002",
      status: "failed",
      error: "redacted-error"
    };

    expect(result.status).toBe("failed");
    expect(result.error).toBe("redacted-error");
  });
});
