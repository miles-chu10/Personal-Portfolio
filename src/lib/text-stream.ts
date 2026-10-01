import { describeAgentError, isAbortError } from "@/lib/agent-errors";

export function toUtf8Stream(stream: AsyncIterable<string>) {
  return encodeIterator(stream[Symbol.asyncIterator]());
}

export async function startUtf8Stream(stream: AsyncIterable<string>) {
  const iterator = stream[Symbol.asyncIterator]();
  const first = await iterator.next();

  return encodeIterator(iterator, first);
}

function encodeIterator(
  iterator: AsyncIterator<string>,
  first?: IteratorResult<string>,
) {
  const encoder = new TextEncoder();
  let pending = first;

  return new ReadableStream<Uint8Array>({
    async pull(controller) {
      try {
        const next = pending ?? (await iterator.next());
        pending = undefined;

        if (next.done) {
          controller.close();
          return;
        }

        controller.enqueue(encoder.encode(next.value));
      } catch (error) {
        if (!isAbortError(error)) {
          console.error(
            "[api/agent] stream failed mid-response",
            describeAgentError(error),
          );
        }

        controller.error(error);
      }
    },
    async cancel() {
      await iterator.return?.();
    },
  });
}
