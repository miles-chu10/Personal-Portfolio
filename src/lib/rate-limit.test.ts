import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { createRateLimiter } from "./rate-limit";

describe("createRateLimiter", () => {
  it("allows requests up to the limit within a window", () => {
    const consume = createRateLimiter({ limit: 3, windowMs: 1_000, now: () => 0 });

    assert.equal(consume("client"), true);
    assert.equal(consume("client"), true);
    assert.equal(consume("client"), true);
    assert.equal(consume("client"), false);
  });

  it("recovers once the window has passed", () => {
    let current = 0;
    const consume = createRateLimiter({
      limit: 2,
      windowMs: 1_000,
      now: () => current,
    });

    assert.equal(consume("client"), true);
    assert.equal(consume("client"), true);
    assert.equal(consume("client"), false);

    current = 1_001;

    assert.equal(consume("client"), true);
  });

  it("tracks keys independently", () => {
    const consume = createRateLimiter({ limit: 1, windowMs: 1_000, now: () => 0 });

    assert.equal(consume("first"), true);
    assert.equal(consume("first"), false);
    assert.equal(consume("second"), true);
  });

  it("caps tracked keys by evicting the oldest active key", () => {
    const consume = createRateLimiter({
      limit: 1,
      maxKeys: 2,
      windowMs: 1_000,
      now: () => 0,
    });

    assert.equal(consume("first"), true);
    assert.equal(consume("second"), true);
    assert.equal(consume("third"), true);
    assert.equal(consume("first"), true);
  });
});
