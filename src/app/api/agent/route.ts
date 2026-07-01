import { runPortfolioAgentStream } from "@/lib/portfolio-agent";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { question?: unknown };
    const question = typeof body.question === "string" ? body.question : "";

    if (!question.trim()) {
      return Response.json(
        { error: "Question is required." },
        { status: 400 },
      );
    }

    if (!process.env.OPENAI_API_KEY?.trim()) {
      return Response.json(
        { error: "Portfolio agent is not configured." },
        { status: 503 },
      );
    }

    const stream = await runPortfolioAgentStream(question);

    return new Response(toUtf8Stream(stream), {
      headers: {
        "Cache-Control": "no-store",
        "Content-Type": "text/plain; charset=utf-8",
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Portfolio agent failed.";

    if (message === "Question is required.") {
      return Response.json({ error: message }, { status: 400 });
    }

    console.error("[api/agent] request failed", error);

    return Response.json(
      { error: "Portfolio agent failed." },
      { status: 500 },
    );
  }
}

function toUtf8Stream(stream: AsyncIterable<string>) {
  const encoder = new TextEncoder();

  return new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          controller.enqueue(encoder.encode(chunk));
        }

        controller.close();
      } catch (error) {
        controller.error(error);
      }
    },
  });
}
