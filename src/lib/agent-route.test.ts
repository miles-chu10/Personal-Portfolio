import assert from "node:assert/strict";
import { describe, it, mock } from "node:test";

import { createAgentRoute } from "./agent-route";

const billingError = Object.assign(new Error("You have no credits remaining."), {
  code: "credit_balance_exhausted",
  headers: { "set-cookie": "must-not-be-logged" },
  type: "insufficient_quota",
});

function makeRequest(headers: Record<string, string> = {}) {
  return new Request("http://localhost/api/agent", {
    method: "POST",
    body: JSON.stringify({ question: "What does Miles do?" }),
    headers: { "x-forwarded-for": "203.0.113.5", ...headers },
  });
}

async function* words(...values: string[]) {
  for (const value of values) {
    yield value;
  }
}

function rejectsOnFirstChunk(error: unknown): AsyncIterable<string> {
  return {
    [Symbol.asyncIterator]() {
      return { next: () => Promise.reject(error) };
    },
  };
}

async function withApiKey(run: () => Promise<void>) {
  const current = process.env.OPENAI_API_KEY;
  process.env.OPENAI_API_KEY = "test-key";

  try {
    await run();
  } finally {
    if (current === undefined) {
      delete process.env.OPENAI_API_KEY;
    } else {
      process.env.OPENAI_API_KEY = current;
    }
  }
}

describe("createAgentRoute", () => {
  it("streams a successful answer as plain text", async () => {
    await withApiKey(async () => {
      const POST = createAgentRoute({
        run: async () => words("Miles ", "builds ", "systems."),
      });
      const response = await POST(makeRequest());

      assert.equal(response.status, 200);
      assert.equal(response.headers.get("content-type"), "text/plain; charset=utf-8");
      assert.equal(await response.text(), "Miles builds systems.");
    });
  });

  it("turns exhausted OpenAI credits into the offline response, not a broken stream", async () => {
    const errorLog = mock.method(console, "error", () => {});

    try {
      await withApiKey(async () => {
        const POST = createAgentRoute({
          run: async () => rejectsOnFirstChunk(billingError),
        });
        const response = await POST(makeRequest());

        assert.equal(response.status, 503);
        assert.deepEqual(await response.json(), {
          error: "Portfolio agent is offline right now.",
        });
        assert.equal(errorLog.mock.callCount(), 1);
        assert.ok(
          !JSON.stringify(errorLog.mock.calls.map((call) => call.arguments)).includes(
            "must-not-be-logged",
          ),
        );
      });
    } finally {
      errorLog.mock.restore();
    }
  });

  it("maps upstream rate limits and unknown failures", async () => {
    const errorLog = mock.method(console, "error", () => {});

    try {
      await withApiKey(async () => {
        const limited = await createAgentRoute({
          run: async () => rejectsOnFirstChunk(Object.assign(new Error("slow"), { status: 429 })),
        })(makeRequest());
        const failed = await createAgentRoute({
          run: async () => rejectsOnFirstChunk(new Error("boom")),
        })(makeRequest());

        assert.equal(limited.status, 429);
        assert.equal(failed.status, 500);
      });
    } finally {
      errorLog.mock.restore();
    }
  });

  it("keeps HTTP 200 and errors the stream when the model fails after the first chunk", async () => {
    const errorLog = mock.method(console, "error", () => {});

    try {
      await withApiKey(async () => {
        async function* partial() {
          yield "Miles ";
          throw new Error("model exploded");
        }

        const POST = createAgentRoute({ run: async () => partial() });
        const response = await POST(makeRequest());

        assert.equal(response.status, 200);
        await assert.rejects(() => response.text(), /model exploded/);
        assert.equal(errorLog.mock.callCount(), 1);
      });
    } finally {
      errorLog.mock.restore();
    }
  });

  it("passes the request abort signal to the runner", async () => {
    await withApiKey(async () => {
      let seen: AbortSignal | undefined;
      const request = makeRequest();
      const POST = createAgentRoute({
        run: async (_question, signal) => {
          seen = signal;

          return words("ok");
        },
      });

      await (await POST(request)).text();

      assert.equal(seen, request.signal);
    });
  });

  it("does not call the runner when the injected limiter refuses", async () => {
    await withApiKey(async () => {
      let calls = 0;
      const POST = createAgentRoute({
        consume: () => false,
        run: async () => {
          calls += 1;

          return words("never");
        },
      });
      const response = await POST(makeRequest());

      assert.equal(response.status, 429);
      assert.equal(calls, 0);
    });
  });
});
