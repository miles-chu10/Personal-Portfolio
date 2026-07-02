import assert from "node:assert/strict";
import { describe, it, mock } from "node:test";

import { toUtf8Stream } from "./text-stream";

async function* chunks(values: string[]) {
  for (const value of values) {
    yield value;
  }
}

async function* failing(message: string): AsyncIterable<string> {
  yield "partial ";
  throw new Error(message);
}

describe("toUtf8Stream", () => {
  it("encodes string chunks to UTF-8 bytes", async () => {
    const stream = toUtf8Stream(chunks(["Miles ", "builds ", "systems."]));
    const reader = stream.getReader();
    const decoder = new TextDecoder();
    let text = "";

    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        break;
      }

      text += decoder.decode(value, { stream: true });
    }

    assert.equal(text, "Miles builds systems.");
  });

  it("logs and propagates mid-stream failures", async () => {
    const errorLog = mock.method(console, "error", () => {});

    try {
      const stream = toUtf8Stream(failing("model exploded"));
      const reader = stream.getReader();

      await reader.read();
      await assert.rejects(async () => {
        while (true) {
          const { done } = await reader.read();

          if (done) {
            break;
          }
        }
      }, /model exploded/);

      assert.equal(errorLog.mock.callCount(), 1);
    } finally {
      errorLog.mock.restore();
    }
  });
});
