import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { GET, POST } from "@/app/api/owner/site-tools/route";
import { registerOwnerSiteTools, type SiteTool, type SiteToolsDocument } from "./owner-site-tools";

function fixture() {
  const tools: SiteTool[] = [];
  const registrations: AbortSignal[] = [];
  let reads = 0;
  let scrolls = 0;
  const doc = {
    modelContext: {
      async registerTool(tool: SiteTool, { signal }: { signal: AbortSignal }) {
        tools.push(tool);
        registrations.push(signal);
      },
    },
    getElementById() {
      reads++;
      return { innerText: "Visible portfolio text", scrollIntoView: () => { scrolls++; } };
    },
  } as unknown as SiteToolsDocument;
  return { doc, tools, registrations, counts: () => ({ reads, scrolls }) };
}

const allowed = () => Response.json({ authorized: true });

describe("owner site tools", () => {
  it("denies discovery and execution at the real server boundary", async () => {
    for (const handler of [GET, POST]) {
      const response = handler();
      assert.equal(response.status, 403);
      assert.match(response.headers.get("cache-control")!, /no-store/);
      assert.equal((await response.json()).authorized, false);
    }
    const f = fixture();
    await registerOwnerSiteTools(f.doc, new AbortController(), async () => GET());
    assert.equal(f.tools.length, 0);
    assert.deepEqual(f.counts(), { reads: 0, scrolls: 0 });
  });

  it("does nothing in unsupported browsers", async () => {
    await registerOwnerSiteTools({} as SiteToolsDocument, new AbortController(), async () => {
      assert.fail("unsupported browsers should not fetch");
    });
  });

  it("fails closed on network errors, malformed replies, and non-boolean authorization", async () => {
    const replies = [
      async () => { throw new Error("Offline"); },
      async () => new Response("Not JSON"),
      async () => Response.json({ authorized: "true" }),
      async () => Response.json({ authorized: true }, { status: 403 }),
    ];
    for (const request of replies) {
      const f = fixture();
      await registerOwnerSiteTools(f.doc, new AbortController(), request);
      assert.equal(f.tools.length, 0);
    }
  });

  it("rechecks authorization on execution and revokes all registrations on denial", async () => {
    const f = fixture();
    const calls: RequestInit[] = [];
    const lifetime = new AbortController();
    await registerOwnerSiteTools(f.doc, lifetime, async (_url, init) => {
      calls.push(init!);
      return calls.length === 1 ? allowed() : POST();
    });
    assert.equal(f.tools.length, 2);
    await assert.rejects(f.tools[0].execute({ section: "work" }), /authorization unavailable/);
    assert.equal(calls[1].method, "POST");
    assert.equal(calls[1].credentials, "same-origin");
    assert.equal(calls[1].cache, "no-store");
    assert.ok(f.registrations.every((signal) => signal.aborted));
    await assert.rejects(f.tools[1].execute({ section: "skills" }), /canceled/);
    assert.deepEqual(f.counts(), { reads: 0, scrolls: 0 });
  });

  it("limits operations to known sections and separates reading from scrolling", async () => {
    const f = fixture();
    let calls = 0;
    await registerOwnerSiteTools(f.doc, new AbortController(), async () => { calls++; return allowed(); });
    for (const input of [null, [], {}, { section: "chat" }, { section: "work", url: "https://example.com" }]) {
      await assert.rejects(f.tools[0].execute(input), /Invalid section/);
    }
    assert.equal(calls, 1);
    assert.deepEqual(await f.tools[0].execute({ section: "work" }), { section: "work", text: "Visible portfolio text" });
    assert.deepEqual(f.counts(), { reads: 1, scrolls: 0 });
    assert.deepEqual(await f.tools[1].execute({ section: "skills" }), { section: "skills", scrolled: true });
    assert.deepEqual(f.counts(), { reads: 2, scrolls: 1 });
  });

  it("does not register after unmounting during the permission check", async () => {
    const f = fixture();
    const lifetime = new AbortController();
    await registerOwnerSiteTools(f.doc, lifetime, async () => {
      lifetime.abort();
      return allowed();
    });
    assert.equal(f.tools.length, 0);
  });

  it("aborts a partially registered tool set if the browser rejects registration", async () => {
    const f = fixture();
    const lifetime = new AbortController();
    const register = f.doc.modelContext!.registerTool;
    f.doc.modelContext!.registerTool = async (tool, options) => {
      if (f.tools.length) throw new Error("Capability revoked");
      await register(tool, options);
    };
    await registerOwnerSiteTools(f.doc, lifetime, async () => allowed());
    assert.equal(f.tools.length, 1);
    assert.ok(f.registrations[0].aborted);
  });
});
