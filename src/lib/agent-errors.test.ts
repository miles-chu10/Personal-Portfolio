import assert from "node:assert/strict";
import { describe, it, mock } from "node:test";

import {
  agentFailureResponse,
  classifyAgentError,
  describeAgentError,
} from "./agent-errors";

const billingError = Object.assign(new Error("You have no credits remaining."), {
  code: "credit_balance_exhausted",
  headers: { "set-cookie": "must-not-be-logged" },
  requestID: "req_test",
  status: undefined,
  type: "insufficient_quota",
});

const rateLimitError = Object.assign(new Error("Slow down."), { status: 429 });

describe("describeAgentError", () => {
  it("keeps only identifying fields and never upstream headers", () => {
    const summary = describeAgentError(billingError);

    assert.deepEqual(summary, {
      code: "credit_balance_exhausted",
      name: "Error",
      requestId: "req_test",
      status: undefined,
      type: "insufficient_quota",
    });
    assert.ok(!JSON.stringify(summary).includes("must-not-be-logged"));
  });

  it("tolerates non-object errors", () => {
    assert.equal(describeAgentError("boom").name, "Error");
    assert.equal(describeAgentError(undefined).code, undefined);
  });
});

describe("classifyAgentError", () => {
  it("recognizes exhausted OpenAI credits", () => {
    assert.equal(classifyAgentError(billingError), "quota");
    assert.equal(classifyAgentError({ code: "insufficient_quota" }), "quota");
  });

  it("recognizes upstream rate limits", () => {
    assert.equal(classifyAgentError(rateLimitError), "rate_limited");
    assert.equal(classifyAgentError({ code: "rate_limit_exceeded" }), "rate_limited");
  });

  it("treats everything else as unavailable", () => {
    assert.equal(classifyAgentError(new Error("boom")), "unavailable");
    assert.equal(classifyAgentError("boom"), "unavailable");
    assert.equal(classifyAgentError(undefined), "unavailable");
  });
});

describe("agentFailureResponse", () => {
  it("maps failures to visitor-safe responses and logs a minimal summary", async () => {
    const errorLog = mock.method(console, "error", () => {});

    try {
      const offline = agentFailureResponse(billingError);
      const limited = agentFailureResponse(rateLimitError);
      const failed = agentFailureResponse(new Error("boom"));

      assert.equal(offline.status, 503);
      assert.deepEqual(await offline.json(), {
        error: "Portfolio agent is offline right now.",
      });
      assert.equal(limited.status, 429);
      assert.equal(failed.status, 500);
      assert.equal(errorLog.mock.callCount(), 3);
      assert.ok(
        !JSON.stringify(errorLog.mock.calls.map((call) => call.arguments)).includes(
          "must-not-be-logged",
        ),
      );
    } finally {
      errorLog.mock.restore();
    }
  });

  it("does not log client aborts", () => {
    const errorLog = mock.method(console, "error", () => {});

    try {
      agentFailureResponse(Object.assign(new Error("aborted"), { name: "AbortError" }));

      assert.equal(errorLog.mock.callCount(), 0);
    } finally {
      errorLog.mock.restore();
    }
  });
});
