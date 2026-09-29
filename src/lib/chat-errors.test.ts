import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  OFFLINE_MESSAGE,
  RATE_LIMITED_MESSAGE,
  readErrorMessage,
} from "./chat-errors";

describe("readErrorMessage", () => {
  it("shows the offline copy for 503 and points at a link that exists", async () => {
    const message = await readErrorMessage(new Response("{}", { status: 503 }));

    assert.equal(message, OFFLINE_MESSAGE);
    assert.ok(!message.includes("dock"));
    assert.ok(message.includes("top of the page"));
  });

  it("shows the busy copy for 429", async () => {
    assert.equal(
      await readErrorMessage(new Response("{}", { status: 429 })),
      RATE_LIMITED_MESSAGE,
    );
  });

  it("uses the server error text for other statuses", async () => {
    const response = Response.json({ error: "Question is too long." }, { status: 400 });

    assert.equal(await readErrorMessage(response), "Question is too long.");
  });

  it("falls back when the body is not JSON", async () => {
    assert.equal(
      await readErrorMessage(new Response("<html>bad gateway</html>", { status: 502 })),
      "Portfolio agent failed.",
    );
  });
});
