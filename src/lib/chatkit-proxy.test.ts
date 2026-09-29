import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { describe, it } from "node:test";

import { proxyChatKit } from "./chatkit-proxy";

const config = { backendUrl: "http://127.0.0.1:8000", token: "test-only-backend-token-with-32-characters", enabled: true };
const origin = "https://milesdchu.com";
const body = JSON.stringify({ type: "threads.list", params: {} });
function request(headers: Record<string, string> = {}, content = body) {
  return new Request(`${origin}/api/chatkit`, { method: "POST", headers: { origin, "Content-Type": "application/json", ...headers }, body: content });
}

describe("ChatKit proxy boundary", () => {
  it("streams official events and reuses only a signed server-issued identity", async () => {
    const ids: string[] = [];
    const backend: typeof fetch = async (url, init) => {
      assert.equal(String(url), "http://127.0.0.1:8000/chatkit");
      const headers = new Headers(init?.headers);
      assert.equal(headers.get("Authorization"), `Bearer ${config.token}`);
      ids.push(headers.get("x-portfolio-visitor")!);
      assert.equal(new TextDecoder().decode(init?.body as Uint8Array), body);
      return new Response("data: {\"type\":\"thread.created\"}\n\n", { headers: { "Content-Type": "text/event-stream" } });
    };
    const first = await proxyChatKit(request({ "x-portfolio-visitor": "attacker" }), config, backend);
    assert.equal(first.status, 200);
    assert.match(await first.text(), /thread.created/);
    assert.equal(first.headers.get("Cache-Control"), "no-store");
    const cookie = first.headers.get("Set-Cookie")!;
    assert.match(cookie, /HttpOnly; SameSite=Strict; Secure/);
    assert.notEqual(ids[0], "attacker");
    await proxyChatKit(request({ cookie: cookie.split(";")[0] }), config, backend);
    assert.equal(ids[0], ids[1]);
    await proxyChatKit(request({ cookie: cookie.split(";")[0] + "bad" }), config, backend);
    assert.notEqual(ids[0], ids[2]);
  });

  it("rotates expired cookies even with a valid signature", async () => {
    const id = "12345678-1234-4234-8234-123456789012";
    const payload = `${id}.${Date.now() - 1}`;
    const signature = createHmac("sha256", config.token).update(payload).digest("base64url");
    const backend: typeof fetch = async (_, init) => {
      assert.notEqual(new Headers(init?.headers).get("x-portfolio-visitor"), id);
      return Response.json({ data: [] });
    };
    assert.equal((await proxyChatKit(request({ cookie: `portfolio_chat_visitor=${payload}.${signature}` }), config, backend)).status, 200);
  });

  it("accepts the routed host when Next.js normalizes its runtime URL", async () => {
    const incoming = new Request("http://localhost:4173/api/chatkit", {
      method: "POST",
      headers: { origin: "http://127.0.0.1:4173", host: "127.0.0.1:4173", "Content-Type": "application/json" },
      body,
    });
    const response = await proxyChatKit(incoming, config, async () => Response.json({ data: [] }));
    assert.equal(response.status, 200);
  });

  it("uses an explicitly configured public origin behind a private service host", async () => {
    const incoming = new Request("http://localhost:59170/api/chatkit", {
      method: "POST",
      headers: { origin, host: "localhost:59170", "Content-Type": "application/json" },
      body,
    });
    const allowed = await proxyChatKit(incoming, { ...config, allowedOrigins: [origin] }, async () => Response.json({ data: [] }));
    assert.equal(allowed.status, 200);
    const denied = await proxyChatKit(request({ origin: "https://attacker.example" }), { ...config, allowedOrigins: [origin] });
    assert.equal(denied.status, 403);
  });

  it("rejects cross-site and missing origins despite spoofed forwarding headers", async () => {
    const never: typeof fetch = async () => { throw new Error("Must not fetch"); };
    const crossSite = request({ origin: "https://attacker.example", "x-forwarded-host": "attacker.example" });
    assert.equal((await proxyChatKit(crossSite, config, never)).status, 403);
    const missing = request();
    missing.headers.delete("origin");
    assert.equal((await proxyChatKit(missing, config, never)).status, 403);
    assert.equal((await proxyChatKit(request({ "sec-fetch-site": "cross-site" }), config, never)).status, 403);
  });

  it("fails closed for disabled or missing configuration and rejects malformed bodies", async () => {
    const never: typeof fetch = async () => { throw new Error("Must not fetch"); };
    assert.equal((await proxyChatKit(request(), { ...config, enabled: false }, never)).status, 503);
    assert.equal((await proxyChatKit(request(), { ...config, token: "" }, never)).status, 503);
    assert.equal((await proxyChatKit(request(), { ...config, backendUrl: "" }, never)).status, 503);
    assert.equal((await proxyChatKit(request({}, "not-json"), config, never)).status, 400);
    assert.equal((await proxyChatKit(request({}, JSON.stringify({ value: "x".repeat(16_384) })), config, never)).status, 400);
    assert.equal((await proxyChatKit(request({ "Content-Type": "text/plain" }), config, never)).status, 400);
  });

  it("sanitizes upstream errors and transport failures", async () => {
    const response = await proxyChatKit(request(), config, async () => new Response("secret backend error", { status: 500 }));
    assert.equal(response.status, 503);
    assert.doesNotMatch(await response.text(), /secret/);
    const throttled = await proxyChatKit(request(), config, async () => new Response("", { status: 429 }));
    assert.equal(throttled.status, 429);
    const disconnected = await proxyChatKit(request(), config, async () => { throw new Error("secret network detail"); });
    assert.equal(disconnected.status, 503);
    assert.doesNotMatch(await disconnected.text(), /secret/);
  });

  it("passes cancellation into the backend request", async () => {
    const controller = new AbortController();
    const incoming = new Request(request(), { signal: controller.signal });
    await proxyChatKit(incoming, config, async (_, init) => {
      controller.abort();
      assert.equal(init?.signal?.aborted, true);
      return Response.json({ data: [] });
    });
  });
});
