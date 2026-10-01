import assert from "node:assert/strict";
import { describe, it, mock } from "node:test";

import { startUtf8Stream, toUtf8Stream } from "./text-stream";

async function* chunks(values: string[]) {
  for (const value of values) {
    yield value;
  }
}

function failsImmediately(message: string): AsyncIterable<string> {
  return {
    [Symbol.asyncIterator]() {
      return { next: () => Promise.reject(new Error(message)) };
    },
  };
}

function tracked(values: string[]) {
  const state = { returned: false };
  const iterable: AsyncIterable<string> = {
    [Symbol.asyncIterator]() {
      let index = 0;

      return {
        next: async (): Promise<IteratorResult<string>> =>
          index < values.length
            ? { done: false, value: values[index++] }
            : { done: true, value: undefined },
        return: async (): Promise<IteratorResult<string>> => {
          state.returned = true;

          return { done: true, value: undefined };
        },
      };
    },
  };

  return { iterable, state };
}

async function readAll(stream: ReadableStream<Uint8Array>) {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let text = "";

  while (true) {
    const { done, value } = await reader.read();

    if (done) {
      return text;
    }

    text += decoder.decode(value, { stream: true });
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

  it("stops the upstream without logging when the consumer cancels", async () => {
    const errorLog = mock.method(console, "error", () => {});

    try {
      const { iterable, state } = tracked(["a", "b", "c"]);
      const reader = toUtf8Stream(iterable).getReader();

      await reader.read();
      await reader.cancel();
      await new Promise((resolve) => setTimeout(resolve, 20));

      assert.equal(state.returned, true);
      assert.equal(errorLog.mock.callCount(), 0);
    } finally {
      errorLog.mock.restore();
    }
  });
});

describe("startUtf8Stream", () => {
  it("rejects before returning a stream when the first chunk fails", async () => {
    const errorLog = mock.method(console, "error", () => {});

    try {
      await assert.rejects(
        () => startUtf8Stream(failsImmediately("credits exhausted")),
        /credits exhausted/,
      );
      assert.equal(errorLog.mock.callCount(), 0);
    } finally {
      errorLog.mock.restore();
    }
  });

  it("passes every chunk through, including the first", async () => {
    const stream = await startUtf8Stream(chunks(["Miles ", "builds ", "systems."]));

    assert.equal(await readAll(stream), "Miles builds systems.");
  });

  it("returns an empty stream for an empty upstream", async () => {
    const stream = await startUtf8Stream(chunks([]));

    assert.equal(await readAll(stream), "");
  });

  it("still logs and propagates a failure after the first chunk", async () => {
    const errorLog = mock.method(console, "error", () => {});

    try {
      const stream = await startUtf8Stream(failing("model exploded"));

      await assert.rejects(() => readAll(stream), /model exploded/);
      assert.equal(errorLog.mock.callCount(), 1);
    } finally {
      errorLog.mock.restore();
    }
  });
});
