import assert from "node:assert/strict";
import { describe, it, mock } from "node:test";

import { POST } from "./route";

const ENV_KEYS = ["CHAT_ENABLED", "CHATKIT_BACKEND_URL", "CHATKIT_BACKEND_TOKEN"] as const;

async function withChatEnabled(value: string | undefined, run: () => Promise<void>) {
  const saved = ENV_KEYS.map((key) => [key, process.env[key]] as const);
  process.env.CHATKIT_BACKEND_URL = "http://backend.invalid/";
  process.env.CHATKIT_BACKEND_TOKEN = "test-backend-token-with-at-least-32-chars";
  if (value === undefined) delete process.env.CHAT_ENABLED;
  else process.env.CHAT_ENABLED = value;

  try {
    await run();
  } finally {
    for (const [key, original] of saved) {
      if (original === undefined) delete process.env[key];
      else process.env[key] = original;
    }
  }
}

function request(body = JSON.stringify({ type: "threads.list", params: {} })) {
  return new Request("http://localhost/api/chatkit", {
    method: "POST",
    headers: { origin: "http://localhost", "content-type": "application/json" },
    body,
  });
}

describe("ChatKit route kill switch", () => {
  it("rejects every documented false spelling before reading the body or fetching upstream", async () => {
    const upstream = mock.method(globalThis, "fetch", async () => Response.json({ data: [] }));

    try {
      for (const value of ["false", "FALSE", " False ", "0", "off", "OFF", "no", "NO"]) {
        await withChatEnabled(value, async () => {
          assert.equal((await POST(request())).status, 503, `CHAT_ENABLED=${value}`);
          const response = await POST(request("not json"));
          assert.equal(response.status, 503, `CHAT_ENABLED=${value}`);
          assert.equal(upstream.mock.callCount(), 0);
        });
      }
    } finally {
      upstream.mock.restore();
    }
  });

  it("keeps chat enabled for true or unset CHAT_ENABLED", async () => {
    const upstream = mock.method(globalThis, "fetch", async () => Response.json({ data: [] }));

    try {
      for (const value of ["true", "TRUE", undefined]) {
        await withChatEnabled(value, async () => {
          assert.equal((await POST(request())).status, 200);
        });
      }
      assert.equal(upstream.mock.callCount(), 3);
    } finally {
      upstream.mock.restore();
    }
  });
});
