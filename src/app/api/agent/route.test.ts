import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { POST } from "./route";

describe("portfolio agent route", () => {
  it("returns a validation error when question is missing", async () => {
    const response = await POST(
      new Request("http://localhost/api/agent", {
        method: "POST",
        body: JSON.stringify({}),
      }),
    );

    assert.equal(response.status, 400);
    assert.deepEqual(await response.json(), { error: "Question is required." });
  });

  it("returns a validation error when question is blank", async () => {
    const response = await POST(
      new Request("http://localhost/api/agent", {
        method: "POST",
        body: JSON.stringify({ question: "   " }),
      }),
    );

    assert.equal(response.status, 400);
    assert.deepEqual(await response.json(), { error: "Question is required." });
  });

  it("returns an intentional unavailable response when the API key is absent", async () => {
    const currentKey = process.env.OPENAI_API_KEY;
    delete process.env.OPENAI_API_KEY;

    try {
      const response = await POST(
        new Request("http://localhost/api/agent", {
          method: "POST",
          body: JSON.stringify({ question: "What does Miles do?" }),
        }),
      );

      assert.equal(response.status, 503);
      assert.deepEqual(await response.json(), {
        error: "Portfolio agent is not configured.",
      });
    } finally {
      if (currentKey === undefined) {
        delete process.env.OPENAI_API_KEY;
      } else {
        process.env.OPENAI_API_KEY = currentKey;
      }
    }
  });
});
