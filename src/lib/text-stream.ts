export function toUtf8Stream(stream: AsyncIterable<string>) {
  const encoder = new TextEncoder();

  return new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          controller.enqueue(encoder.encode(chunk));
        }

        controller.close();
      } catch (error) {
        if (!isAbortError(error)) {
          console.error("[api/agent] stream failed mid-response", error);
        }

        controller.error(error);
      }
    },
  });
}

function isAbortError(error: unknown) {
  return error instanceof Error && error.name === "AbortError";
}
