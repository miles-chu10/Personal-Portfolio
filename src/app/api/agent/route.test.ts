import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  AGENT_RATE_LIMIT,
  MAX_QUESTION_LENGTH,
  MAX_REQUEST_BYTES,
} from "@/lib/chat-limits";

import { POST } from "./route";

let nextClient = 1;

function makeRequest(body: string, headers: Record<string, string> = {}) {
  return new Request("http://localhost/api/agent", {
    method: "POST",
    body,
    headers: { "x-forwarded-for": `198.51.100.${nextClient++}`, ...headers },
  });
}

async function withChatEnabled(value: string | undefined, run: () => Promise<void>) {
  const current = process.env.CHAT_ENABLED;

  if (value === undefined) {
    delete process.env.CHAT_ENABLED;
  } else {
    process.env.CHAT_ENABLED = value;
  }

  try {
    await run();
  } finally {
    if (current === undefined) {
      delete process.env.CHAT_ENABLED;
    } else {
      process.env.CHAT_ENABLED = current;
    }
  }
}

async function withoutApiKey(run: () => Promise<void>) {
  const currentKey = process.env.OPENAI_API_KEY;
  delete process.env.OPENAI_API_KEY;

  try {
    await run();
  } finally {
    if (currentKey === undefined) {
      delete process.env.OPENAI_API_KEY;
    } else {
      process.env.OPENAI_API_KEY = currentKey;
    }
  }
}

describe("portfolio agent route", () => {
  it("returns a validation error when question is missing", async () => {
    const response = await POST(makeRequest(JSON.stringify({})));

    assert.equal(response.status, 400);
    assert.deepEqual(await response.json(), { error: "Question is required." });
  });

  it("returns a validation error when question is blank", async () => {
    const response = await POST(makeRequest(JSON.stringify({ question: "   " })));

    assert.equal(response.status, 400);
    assert.deepEqual(await response.json(), { error: "Question is required." });
  });

  it("returns a validation error when the body is JSON null", async () => {
    const response = await POST(makeRequest("null"));

    assert.equal(response.status, 400);
    assert.deepEqual(await response.json(), { error: "Question is required." });
  });

  it("returns a validation error when the body is not JSON", async () => {
    const response = await POST(makeRequest("not json"));

    assert.equal(response.status, 400);
    assert.deepEqual(await response.json(), {
      error: "Request body must be JSON.",
    });
  });

  it("returns a validation error when the question is too long", async () => {
    const response = await POST(
      makeRequest(
        JSON.stringify({ question: "a".repeat(MAX_QUESTION_LENGTH + 1) }),
      ),
    );

    assert.equal(response.status, 400);
    assert.deepEqual(await response.json(), { error: "Question is too long." });
  });

  it("rejects cross-site browser requests before calling the agent", async () => {
    const response = await POST(
      makeRequest(JSON.stringify({ question: "What does Miles do?" }), {
        origin: "https://attacker.example",
      }),
    );

    assert.equal(response.status, 403);
    assert.deepEqual(await response.json(), {
      error: "Cross-site agent requests are not allowed.",
    });
  });

  it("allows same-origin browser requests through validation", async () => {
    await withoutApiKey(async () => {
      const response = await POST(
        makeRequest(JSON.stringify({ question: "What does Miles do?" }), {
          origin: "http://localhost",
          "x-forwarded-for": "203.0.113.17",
        }),
      );

      assert.equal(response.status, 503);
      assert.deepEqual(await response.json(), {
        error: "Portfolio agent is not configured.",
      });
    });
  });

  it("uses the request host when the runtime normalizes the request URL", async () => {
    const current = process.env.CHAT_ENABLED;
    process.env.CHAT_ENABLED = "false";

    try {
      const response = await POST(
        makeRequest(JSON.stringify({ question: "What does Miles do?" }), {
          host: "127.0.0.1:3107",
          origin: "http://127.0.0.1:3107",
        }),
      );

      assert.equal(response.status, 503);
      assert.deepEqual(await response.json(), {
        error: "Portfolio agent is offline right now.",
      });
    } finally {
      if (current === undefined) {
        delete process.env.CHAT_ENABLED;
      } else {
        process.env.CHAT_ENABLED = current;
      }
    }
  });

  it("can disable chat with the CHAT_ENABLED kill switch", async () => {
    const current = process.env.CHAT_ENABLED;
    process.env.CHAT_ENABLED = "false";

    try {
      const response = await POST(
        makeRequest(JSON.stringify({ question: "What does Miles do?" })),
      );

      assert.equal(response.status, 503);
      assert.deepEqual(await response.json(), {
        error: "Portfolio agent is offline right now.",
      });
    } finally {
      if (current === undefined) {
        delete process.env.CHAT_ENABLED;
      } else {
        process.env.CHAT_ENABLED = current;
      }
    }
  });

  it("returns an intentional unavailable response when the API key is absent", async () => {
    await withoutApiKey(async () => {
      const response = await POST(
        makeRequest(JSON.stringify({ question: "What does Miles do?" })),
      );

      assert.equal(response.status, 503);
      assert.deepEqual(await response.json(), {
        error: "Portfolio agent is not configured.",
      });
    });
  });

  it("rate limits repeated requests from the same client", async () => {
    await withoutApiKey(async () => {
      const headers = { "x-forwarded-for": "203.0.113.7" };

      for (let index = 0; index < AGENT_RATE_LIMIT; index += 1) {
        const response = await POST(
          makeRequest(JSON.stringify({ question: "What does Miles do?" }), headers),
        );

        assert.equal(response.status, 503);
      }

      const limited = await POST(
        makeRequest(JSON.stringify({ question: "What does Miles do?" }), headers),
      );

      assert.equal(limited.status, 429);
      assert.deepEqual(await limited.json(), {
        error: "Too many requests. Try again in a minute.",
      });
    });
  });

  it("treats common false spellings of CHAT_ENABLED as offline", async () => {
    for (const value of ["FALSE", " false ", "0", "off", "No"]) {
      await withChatEnabled(value, async () => {
        const response = await POST(
          makeRequest(JSON.stringify({ question: "What does Miles do?" })),
        );

        assert.equal(response.status, 503, value);
        assert.deepEqual(await response.json(), {
          error: "Portfolio agent is offline right now.",
        });
      });
    }
  });

  it("keeps chat enabled for true or unset CHAT_ENABLED", async () => {
    for (const value of ["true", "TRUE", undefined]) {
      await withChatEnabled(value, () =>
        withoutApiKey(async () => {
          const response = await POST(
            makeRequest(JSON.stringify({ question: "What does Miles do?" })),
          );

          assert.equal(response.status, 503);
          assert.deepEqual(await response.json(), {
            error: "Portfolio agent is not configured.",
          });
        }),
      );
    }
  });

  it("answers the kill switch before reading the body", async () => {
    await withChatEnabled("false", async () => {
      const response = await POST(makeRequest("not json"));

      assert.equal(response.status, 503);
    });
  });

  it("rejects oversized declared bodies before parsing them", async () => {
    const response = await POST(
      makeRequest("not json", { "content-length": String(MAX_REQUEST_BYTES + 1) }),
    );

    assert.equal(response.status, 413);
    assert.deepEqual(await response.json(), { error: "Request body is too large." });
  });

  it("rate limits before reading the body", async () => {
    await withoutApiKey(async () => {
      const headers = { "x-forwarded-for": "203.0.113.99" };

      for (let index = 0; index < AGENT_RATE_LIMIT; index += 1) {
        await POST(makeRequest("not json", headers));
      }

      const limited = await POST(makeRequest("not json", headers));

      assert.equal(limited.status, 429);
    });
  });
});
