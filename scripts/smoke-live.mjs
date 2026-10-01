// Live smoke check for the deployed portfolio.
// Read-only: GET/HEAD requests plus one invalid-body POST that is rejected
// before any model call. Usage: npm run smoke:live -- https://milesdchu.com
const base = new URL(process.argv[2] ?? process.env.SMOKE_URL ?? "https://milesdchu.com");
const origin = base.origin;
const results = [];

function expect(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function check(name, run) {
  try {
    results.push({ name, ok: true, detail: (await run()) ?? "" });
  } catch (error) {
    results.push({
      name,
      ok: false,
      detail: error instanceof Error ? error.message : String(error),
    });
  }
}

function get(path, init = {}) {
  return fetch(new URL(path, origin), { redirect: "manual", ...init });
}

function sameOrigin(value) {
  return new URL(value).origin === origin;
}

const home = await get("/");
const html = await home.text();

await check("GET / returns 200 HTML", () => {
  expect(home.status === 200, `status ${home.status}`);
  expect((home.headers.get("content-type") ?? "").includes("text/html"), "not text/html");
});

await check("security headers are present", () => {
  const required = {
    "x-content-type-options": "nosniff",
    "x-frame-options": "DENY",
    "referrer-policy": "strict-origin-when-cross-origin",
  };

  for (const [name, value] of Object.entries(required)) {
    expect(home.headers.get(name) === value, `${name}: ${home.headers.get(name)}`);
  }

  expect(home.headers.has("permissions-policy"), "permissions-policy missing");

  if (base.protocol === "https:") {
    expect(home.headers.has("strict-transport-security"), "strict-transport-security missing");
  }
});

await check("canonical URL uses the site origin", () => {
  const href = html.match(/<link[^>]*rel="canonical"[^>]*href="([^"]+)"/)?.[1];
  expect(href, "canonical link missing");
  expect(sameOrigin(href), `canonical is ${href}`);
});

await check("Open Graph URL and image use the site origin", async () => {
  const url = html.match(/<meta property="og:url" content="([^"]+)"/)?.[1];
  const image = html.match(/<meta property="og:image" content="([^"]+)"/)?.[1];
  expect(url && image, "og:url or og:image missing");
  expect(sameOrigin(url), `og:url is ${url}`);
  expect(sameOrigin(image), `og:image is ${image}`);

  const response = await fetch(image);
  expect(response.status === 200, `og:image status ${response.status}`);
  expect((response.headers.get("content-type") ?? "").startsWith("image/"), "og:image is not an image");
});

await check("JSON-LD Person url uses the site origin", () => {
  const raw = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)?.[1];
  expect(raw, "JSON-LD script missing");
  const data = JSON.parse(raw);
  expect(data["@type"] === "Person", `@type is ${data["@type"]}`);
  expect(sameOrigin(data.url), `url is ${data.url}`);
});

await check("robots.txt points at this site's sitemap", async () => {
  const text = await (await get("/robots.txt")).text();
  expect(text.includes(`Sitemap: ${origin}/sitemap.xml`), "Sitemap line has another host");
  expect(/Disallow:\s*\/api\//.test(text), "/api/ is not disallowed");
});

await check("sitemap.xml lists this site's URL", async () => {
  const text = await (await get("/sitemap.xml")).text();
  expect(text.includes(`<loc>${origin}/</loc>`), "sitemap <loc> has another host");
});

await check("unknown paths return 404", async () => {
  const response = await get("/definitely-not-a-page");
  expect(response.status === 404, `status ${response.status}`);
});

await check("GET /api/agent is rejected with 405", async () => {
  const response = await get("/api/agent");
  expect(response.status === 405, `status ${response.status}`);
});

await check("POST /api/agent rejects a non-JSON body before any model call", async () => {
  const response = await get("/api/agent", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: "not json",
  });
  expect([400, 429, 503].includes(response.status), `status ${response.status}`);
  return response.status === 400 ? "" : `status ${response.status} (chat gated)`;
});

if (base.protocol === "https:") {
  await check("http:// redirects to https://", async () => {
    const response = await fetch(`http://${base.host}/`, { redirect: "manual" });
    const location = response.headers.get("location") ?? "";
    expect([301, 302, 307, 308].includes(response.status), `status ${response.status}`);
    expect(location.startsWith("https://"), `location ${location}`);
  });
}

if (base.hostname.split(".").length === 2) {
  await check("www redirects to the apex domain", async () => {
    const response = await fetch(`${base.protocol}//www.${base.host}/`, { redirect: "manual" });
    const location = response.headers.get("location") ?? "";
    expect([301, 302, 307, 308].includes(response.status), `status ${response.status}`);
    expect(sameOrigin(location), `location ${location}`);
  });
}

for (const { name, ok, detail } of results) {
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? ` — ${detail}` : ""}`);
}

const failed = results.filter((result) => !result.ok).length;
console.log(`\n${results.length - failed}/${results.length} checks passed for ${origin}`);
process.exit(failed === 0 ? 0 : 1);
