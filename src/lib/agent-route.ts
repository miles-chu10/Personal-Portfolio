import { agentFailureResponse } from "@/lib/agent-errors";
import {
  AGENT_RATE_LIMIT,
  AGENT_RATE_MAX_KEYS,
  AGENT_RATE_WINDOW_MS,
  MAX_QUESTION_LENGTH,
  MAX_REQUEST_BYTES,
} from "@/lib/chat-limits";
import { runPortfolioAgentStream } from "@/lib/portfolio-agent";
import { createRateLimiter, type RateLimiter } from "@/lib/rate-limit";
import { startUtf8Stream } from "@/lib/text-stream";

type AgentRouteOptions = {
  consume?: RateLimiter;
  run?: (
    question: string,
    signal: AbortSignal,
  ) => Promise<AsyncIterable<string>>;
};

export function createAgentRoute({
  consume = createRateLimiter({
    limit: AGENT_RATE_LIMIT,
    maxKeys: AGENT_RATE_MAX_KEYS,
    windowMs: AGENT_RATE_WINDOW_MS,
  }),
  run = (question, signal) =>
    runPortfolioAgentStream(question, undefined, signal),
}: AgentRouteOptions = {}) {
  return async function POST(request: Request) {
    if (!isChatEnabled()) {
      return Response.json(
        { error: "Portfolio agent is offline right now." },
        { status: 503 },
      );
    }

    if (!isAllowedOrigin(request)) {
      return Response.json(
        { error: "Cross-site agent requests are not allowed." },
        { status: 403 },
      );
    }

    if (!consume(getClientKey(request))) {
      return Response.json(
        { error: "Too many requests. Try again in a minute." },
        { status: 429 },
      );
    }

    if (isBodyTooLarge(request)) {
      return Response.json(
        { error: "Request body is too large." },
        { status: 413 },
      );
    }

    let body: { question?: unknown } | null;

    try {
      body = (await request.json()) as { question?: unknown } | null;
    } catch {
      return Response.json(
        { error: "Request body must be JSON." },
        { status: 400 },
      );
    }

    const question = typeof body?.question === "string" ? body.question : "";

    if (!question.trim()) {
      return Response.json(
        { error: "Question is required." },
        { status: 400 },
      );
    }

    if (question.length > MAX_QUESTION_LENGTH) {
      return Response.json(
        { error: "Question is too long." },
        { status: 400 },
      );
    }

    if (!process.env.OPENAI_API_KEY?.trim()) {
      return Response.json(
        { error: "Portfolio agent is not configured." },
        { status: 503 },
      );
    }

    try {
      const stream = await run(question, request.signal);

      return new Response(await startUtf8Stream(stream), {
        headers: {
          "Cache-Control": "no-store",
          "Content-Type": "text/plain; charset=utf-8",
        },
      });
    } catch (error) {
      return agentFailureResponse(error);
    }
  };
}

function isChatEnabled() {
  const flag = process.env.CHAT_ENABLED?.trim().toLowerCase();

  return !(flag === "false" || flag === "0" || flag === "off" || flag === "no");
}

function isBodyTooLarge(request: Request) {
  const declaredBytes = Number(request.headers.get("content-length"));

  return Number.isFinite(declaredBytes) && declaredBytes > MAX_REQUEST_BYTES;
}

function getClientKey(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();

  return forwarded || request.headers.get("x-real-ip")?.trim() || "unknown";
}

function isAllowedOrigin(request: Request) {
  const origin = request.headers.get("origin");

  if (!origin) {
    return true;
  }

  try {
    const requestUrl = new URL(request.url);
    const forwardedHost = request.headers
      .get("x-forwarded-host")
      ?.split(",")[0]
      ?.trim();
    const host = forwardedHost || request.headers.get("host") || requestUrl.host;
    const forwardedProtocol = request.headers
      .get("x-forwarded-proto")
      ?.split(",")[0]
      ?.trim();
    const protocol =
      forwardedProtocol === "http" || forwardedProtocol === "https"
        ? `${forwardedProtocol}:`
        : requestUrl.protocol;

    return new URL(origin).origin === `${protocol}//${host}`;
  } catch {
    return false;
  }
}
