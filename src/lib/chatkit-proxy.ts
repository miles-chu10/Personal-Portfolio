import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";

const COOKIE_NAME = "portfolio_chat_visitor";
const MAX_BODY_BYTES = 16_384;
const VISITOR_LIFETIME_MS = 24 * 60 * 60 * 1000;
const offline = "Chat is unavailable right now.";

type ProxyConfig = { backendUrl: string; token: string; enabled: boolean; allowedOrigins?: string[] };

export async function proxyChatKit(request: Request, config: ProxyConfig, fetchBackend: typeof fetch = fetch) {
  if (!isSameOrigin(request, config.allowedOrigins)) return jsonError("Cross-site chat requests are not allowed.", 403);
  if (!config.enabled || !config.backendUrl || config.token.length < 32) return jsonError(offline, 503);
  if (!request.headers.get("content-type")?.startsWith("application/json")) return jsonError("Request body must be JSON.", 400);
  let body: Uint8Array;
  try {
    body = await readLimitedBody(request);
    JSON.parse(new TextDecoder().decode(body));
  } catch {
    return jsonError("Invalid or oversized chat request.", 400);
  }
  const cookie = request.headers.get("cookie")?.split(";").map((part) => part.trim()).find((part) => part.startsWith(`${COOKIE_NAME}=`))?.slice(COOKIE_NAME.length + 1);
  const visitor = verifyVisitor(cookie, config.token) || { id: randomUUID(), expires: Date.now() + VISITOR_LIFETIME_MS };
  const cookieValue = signVisitor(visitor, config.token);
  const secure = new URL(request.url).protocol === "https:" ? "; Secure" : "";
  const setCookie = `${COOKIE_NAME}=${cookieValue}; Path=/api/chatkit; Max-Age=${Math.max(0, Math.floor((visitor.expires - Date.now()) / 1000))}; HttpOnly; SameSite=Strict${secure}`;

  try {
    const target = new URL("chatkit", config.backendUrl.endsWith("/") ? config.backendUrl : `${config.backendUrl}/`);
    if (!["http:", "https:"].includes(target.protocol) || target.username || target.password) return jsonError(offline, 503);
    const upstream = await fetchBackend(target, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${config.token}`, "x-portfolio-visitor": visitor.id },
      body: body as BodyInit,
      signal: AbortSignal.any([request.signal, AbortSignal.timeout(55_000)]),
      redirect: "error",
      cache: "no-store",
    });
    if (!upstream.ok) {
      const status = [400, 404, 429].includes(upstream.status) ? upstream.status : 503;
      const message = status === 429 ? "Too many questions. Try again in a minute." : status === 404 ? "This conversation has expired. Start a new conversation." : status === 400 ? "This chat request could not be accepted." : offline;
      const response = jsonError(message, status);
      response.headers.set("Set-Cookie", setCookie);
      return response;
    }
    return new Response(upstream.body, {
      headers: { "Content-Type": upstream.headers.get("content-type") || "application/json", "Cache-Control": "no-store", "X-Accel-Buffering": "no", "Set-Cookie": setCookie },
    });
  } catch {
    return jsonError(offline, 503);
  }
}

function isSameOrigin(request: Request, allowedOrigins: string[] = []) {
  const origin = request.headers.get("origin");
  if (!origin || request.headers.get("sec-fetch-site") === "cross-site") return false;
  try {
    const actualOrigin = new URL(origin).origin;
    if (allowedOrigins.some((allowed) => {
      try { return new URL(allowed).origin === actualOrigin; }
      catch { return false; }
    })) return true;
    const runtimeUrl = new URL(request.url);
    // Next.js can normalize the URL hostname to localhost; Host keeps the
    // browser's routed hostname. Do not trust a client-supplied forwarded host.
    const host = request.headers.get("host") || runtimeUrl.host;
    return actualOrigin === new URL(`${runtimeUrl.protocol}//${host}`).origin;
  }
  catch { return false; }
}

async function readLimitedBody(request: Request) {
  if (!request.body) throw new Error("Missing body");
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let length = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      length += value.byteLength;
      if (length > MAX_BODY_BYTES) { await reader.cancel(); throw new Error("Oversized body"); }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  const body = new Uint8Array(length);
  let offset = 0;
  for (const chunk of chunks) { body.set(chunk, offset); offset += chunk.byteLength; }
  return body;
}

function signVisitor(visitor: { id: string; expires: number }, token: string) {
  const payload = `${visitor.id}.${visitor.expires}`;
  return `${payload}.${createHmac("sha256", token).update(payload).digest("base64url")}`;
}

function verifyVisitor(cookie: string | undefined, token: string) {
  if (!cookie || cookie.length > 160) return null;
  const [id, timestamp, signature, extra] = cookie.split(".");
  const expires = Number(timestamp);
  if (extra || !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(id) || !Number.isSafeInteger(expires) || expires <= Date.now() || expires > Date.now() + VISITOR_LIFETIME_MS || !signature) return null;
  const expected = signVisitor({ id, expires }, token).split(".")[2];
  const actualBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (actualBuffer.length !== expectedBuffer.length || !timingSafeEqual(actualBuffer, expectedBuffer)) return null;
  return { id, expires };
}

function jsonError(error: string, status: number) {
  return Response.json({ error }, { status, headers: { "Cache-Control": "no-store" } });
}
