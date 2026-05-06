import { describe, expect, it } from "vitest";
import messageSearchFixture from "./fixtures/responses/message-search-response.json" assert { type: "json" };
import summaryFixture from "./fixtures/responses/summary-response.json" assert { type: "json" };
import threadDetailFixture from "./fixtures/responses/thread-detail-response.json" assert { type: "json" };
import threadSearchFixture from "./fixtures/responses/thread-search-response.json" assert { type: "json" };
import workItemFixture from "./fixtures/responses/work-item-response.json" assert { type: "json" };

function expectMessageItemShape(item: Record<string, unknown>) {
  expect(typeof item.id).toBe("string");
  expect(typeof item.conversation_name).toBe("string");
  expect(typeof item.sender_name).toBe("string");
  expect(typeof item.sent_at).toBe("string");
  expect(typeof item.item_type).toBe("string");
  expect(typeof item.source_metadata).toBe("object");
}

describe("OpenAPI-aligned synthetic response fixtures", () => {
  it("validates message search fixture shape", () => {
    expect(Array.isArray(messageSearchFixture.items)).toBe(true);
    expect(typeof messageSearchFixture.limit).toBe("number");
    expectMessageItemShape(messageSearchFixture.items[0]);
  });

  it("validates thread search fixture shape", () => {
    expect(Array.isArray(threadSearchFixture.items)).toBe(true);
    expect(typeof threadSearchFixture.limit).toBe("number");
    expect(typeof threadSearchFixture.items[0].thread_key).toBe("string");
    expect(typeof threadSearchFixture.items[0].last_reply_at).toBe("string");
  });

  it("validates thread detail fixture shape", () => {
    expect(typeof threadDetailFixture.thread.thread_key).toBe("string");
    expect(Array.isArray(threadDetailFixture.items)).toBe(true);
    expectMessageItemShape(threadDetailFixture.items[0]);
  });

  it("validates summary fixture shape", () => {
    expect(typeof summaryFixture.summary).toBe("string");
    expect(Array.isArray(summaryFixture.key_points)).toBe(true);
    expect(typeof summaryFixture.source_count).toBe("number");
  });

  it("validates work item fixture shape", () => {
    expect(Array.isArray(workItemFixture.tasks)).toBe(true);
    expect(Array.isArray(workItemFixture.decisions)).toBe(true);
    expect(Array.isArray(workItemFixture.risks)).toBe(true);
    expect(Array.isArray(workItemFixture.blockers)).toBe(true);
  });
});
