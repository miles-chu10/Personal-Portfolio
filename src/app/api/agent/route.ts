import {
  AGENT_RATE_LIMIT,
  AGENT_RATE_MAX_KEYS,
  AGENT_RATE_WINDOW_MS,
  MAX_QUESTION_LENGTH,
} from "@/lib/chat-limits";
import { runPortfolioAgentStream } from "@/lib/portfolio-agent";
import { createRateLimiter } from "@/lib/rate-limit";
import { toUtf8Stream } from "@/lib/text-stream";

export const runtime = "nodejs";
export const maxDuration = 60;

const consumeAgentRequest = createRateLimiter({
  limit: AGENT_RATE_LIMIT,
  maxKeys: AGENT_RATE_MAX_KEYS,
  windowMs: AGENT_RATE_WINDOW_MS,
});

export async function POST(request: Request) {
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

  if (!isAllowedOrigin(request)) {
    return Response.json(
      { error: "Cross-site agent requests are not allowed." },
      { status: 403 },
    );
  }

  if (process.env.CHAT_ENABLED === "false") {
    return Response.json(
      { error: "Portfolio agent is offline right now." },
      { status: 503 },
    );
  }

  if (!consumeAgentRequest(getClientKey(request))) {
    return Response.json(
      { error: "Too many requests. Try again in a minute." },
      { status: 429 },
    );
  }

  if (!process.env.OPENAI_API_KEY?.trim()) {
    return Response.json(
      { error: "Portfolio agent is not configured." },
      { status: 503 },
    );
  }

  try {
    const stream = await runPortfolioAgentStream(
      question,
      undefined,
      request.signal,
    );

    return new Response(toUtf8Stream(stream), {
      headers: {
        "Cache-Control": "no-store",
        "Content-Type": "text/plain; charset=utf-8",
      },
    });
  } catch (error) {
    console.error("[api/agent] request failed", error);

    return Response.json(
      { error: "Portfolio agent failed." },
      { status: 500 },
    );
  }
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
    return new URL(origin).origin === new URL(request.url).origin;
  } catch {
    return false;
  }
}
