"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

type ChatMessage = {
  id: string;
  role: "assistant" | "user";
  content: string;
  tone?: "normal" | "error";
};

type ChatStatus = "idle" | "submitted" | "streaming";

type AgentErrorResponse = {
  error?: string;
};

const initialMessages: ChatMessage[] = [
  {
    id: "intro",
    role: "assistant",
    content: "Ask about Miles's GTM work, RevOps impact, AI systems, or links.",
  },
];

export function PortfolioChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [status, setStatus] = useState<ChatStatus>("idle");
  const [lastQuestion, setLastQuestion] = useState("");
  const formRef = useRef<HTMLFormElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const isBusy = status !== "idle";
  const canSubmit = input.trim().length > 0 && !isBusy;
  const canRetry = lastQuestion.length > 0 && !isBusy;
  const hasConversation = messages.length > initialMessages.length;

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ block: "end" });
  }, [messages, status]);

  async function handleSubmit(event: { preventDefault: () => void }) {
    event.preventDefault();
    await submitQuestion(input);
  }

  async function submitQuestion(questionInput: string) {
    const question = questionInput.trim();

    if (!question || isBusy) {
      return;
    }

    const timestamp = Date.now();
    const assistantId = `assistant-${timestamp}`;
    const userMessage: ChatMessage = {
      id: `user-${timestamp}`,
      role: "user",
      content: question,
    };

    setMessages((current) => [
      ...current,
      userMessage,
      {
        id: assistantId,
        role: "assistant",
        content: "",
      },
    ]);
    setInput("");
    setLastQuestion(question);
    setStatus("submitted");

    try {
      const response = await fetch("/api/agent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question }),
      });

      if (!response.ok) {
        const errorMessage = await readErrorMessage(response);
        updateAssistantMessage(assistantId, errorMessage, "error");
        return;
      }

      if (!response.body) {
        updateAssistantMessage(
          assistantId,
          "Portfolio agent returned an empty response.",
          "error",
        );
        return;
      }

      setStatus("streaming");
      await streamAssistantMessage(response.body, assistantId);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Portfolio agent failed.";

      updateAssistantMessage(assistantId, message, "error");
    } finally {
      setStatus("idle");
    }
  }

  async function streamAssistantMessage(
    body: ReadableStream<Uint8Array>,
    assistantId: string,
  ) {
    const reader = body.getReader();
    const decoder = new TextDecoder();
    let answer = "";

    try {
      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          break;
        }

        answer += decoder.decode(value, { stream: true });
        updateAssistantMessage(assistantId, answer);
      }

      answer += decoder.decode();

      if (!answer.trim()) {
        updateAssistantMessage(
          assistantId,
          "Portfolio agent returned an empty response.",
          "error",
        );
        return;
      }

      updateAssistantMessage(assistantId, answer.trim());
    } finally {
      reader.releaseLock();
    }
  }

  function updateAssistantMessage(
    id: string,
    content: string,
    tone: ChatMessage["tone"] = "normal",
  ) {
    setMessages((current) =>
      current.map((message) =>
        message.id === id
          ? {
              ...message,
              content,
              tone,
            }
          : message,
      ),
    );
  }

  function clearConversation() {
    setMessages(initialMessages);
    setInput("");
    setLastQuestion("");
  }

  return (
    <div className="pointer-events-auto relative">
      {isOpen ? (
        <section
          aria-label="Portfolio agent chat"
          className="fixed inset-x-3 bottom-[calc(5.75rem+env(safe-area-inset-bottom))] z-30 mx-auto flex max-h-[min(34rem,calc(100vh-7.5rem))] max-w-[23rem] flex-col overflow-hidden rounded-[0.45rem] border border-line-strong bg-background/96 shadow-2xl shadow-black/45 backdrop-blur sm:left-auto sm:right-[max(1rem,calc((100vw-42rem)/2+1rem))] sm:mx-0 sm:w-[23rem]"
        >
          <div className="flex items-center justify-between gap-3 border-b border-line px-3 py-2.5">
            <div className="flex min-w-0 items-center gap-2.5">
              <span className="relative flex size-8 shrink-0 items-center justify-center rounded-[0.35rem] border border-line bg-[#111113]">
                <Image
                  alt=""
                  aria-hidden="true"
                  className="size-5 object-contain"
                  height={20}
                  src="/img/brand/chatgpt-512.png"
                  unoptimized
                  width={20}
                />
                <span className="absolute -bottom-1 -right-1 flex size-4 items-center justify-center rounded-[0.2rem] border border-background bg-[#111113]">
                  <Image
                    alt=""
                    aria-hidden="true"
                    className="size-3 object-contain"
                    height={12}
                    src="/img/brand/codex-512.png"
                    unoptimized
                    width={12}
                  />
                </span>
              </span>
              <div className="min-w-0">
                <h2 className="truncate text-[0.82rem] font-medium leading-5 text-foreground">
                  Portfolio Agent
                </h2>
                <p className="truncate text-[0.72rem] leading-4 text-subtle">
                  OpenAI Agents SDK
                </p>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-1">
              <button
                aria-label="Retry last question"
                className="flex size-8 items-center justify-center rounded-sm text-muted transition-colors hover:bg-foreground/5 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-35"
                disabled={!canRetry}
                title="Retry"
                type="button"
                onClick={() => submitQuestion(lastQuestion)}
              >
                <RetryIcon />
              </button>
              <button
                aria-label="Clear chat"
                className="flex size-8 items-center justify-center rounded-sm text-muted transition-colors hover:bg-foreground/5 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-35"
                disabled={!hasConversation || isBusy}
                title="Clear"
                type="button"
                onClick={clearConversation}
              >
                <ClearIcon />
              </button>
              <button
                aria-label="Close AI chat"
                className="flex size-8 items-center justify-center rounded-sm text-muted transition-colors hover:bg-foreground/5 hover:text-foreground"
                title="Close"
                type="button"
                onClick={() => setIsOpen(false)}
              >
                <CloseIcon />
              </button>
            </div>
          </div>

          <div
            aria-live="polite"
            className="flex-1 space-y-3 overflow-y-auto px-3 py-3"
          >
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} status={status} />
            ))}
            {status === "submitted" && !messages.at(-1)?.content ? (
              <div className="mr-auto max-w-[90%] rounded-[0.45rem] border border-line bg-[#0d0d0f] px-3 py-2 text-[0.82rem] leading-5 text-muted">
                Connecting...
              </div>
            ) : null}
            <div ref={scrollRef} />
          </div>

          <form
            className="border-t border-line p-2"
            ref={formRef}
            onSubmit={handleSubmit}
          >
            <div className="flex items-end gap-2 rounded-[0.45rem] border border-line-strong bg-[#0d0d0f] p-2 transition-colors focus-within:border-foreground/35">
              <textarea
                aria-label="Ask the portfolio agent"
                className="max-h-28 min-h-11 flex-1 resize-none bg-transparent text-[0.82rem] leading-5 text-foreground outline-none placeholder:text-subtle"
                disabled={isBusy}
                placeholder="Ask about impact, skills, or links"
                rows={2}
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (
                    event.key === "Enter" &&
                    !event.shiftKey &&
                    !event.nativeEvent.isComposing
                  ) {
                    event.preventDefault();
                    formRef.current?.requestSubmit();
                  }
                }}
              />
              <button
                aria-label="Send question"
                className="flex size-8 shrink-0 items-center justify-center rounded-sm bg-foreground text-background transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
                disabled={!canSubmit}
                type="submit"
              >
                <SendIcon />
              </button>
            </div>
          </form>
        </section>
      ) : null}

      <button
        aria-expanded={isOpen}
        aria-label="Open AI chat"
        className="group flex h-8 min-w-8 items-center justify-center rounded-sm p-1.5 text-muted transition-colors hover:bg-foreground/5 hover:text-foreground focus-visible:text-foreground"
        title="AI Chat"
        type="button"
        onClick={() => setIsOpen((current) => !current)}
      >
        <Image
          alt=""
          aria-hidden="true"
          className="size-5 object-contain opacity-80 transition-opacity group-hover:opacity-100"
          height={20}
          src="/img/brand/chatgpt-512.png"
          unoptimized
          width={20}
        />
      </button>
    </div>
  );
}

function MessageBubble({
  message,
  status,
}: {
  message: ChatMessage;
  status: ChatStatus;
}) {
  const isUser = message.role === "user";
  const isError = message.tone === "error";

  if (!isUser && !message.content && status === "submitted") {
    return null;
  }

  return (
    <div
      className={
        isUser
          ? "ml-auto max-w-[86%] rounded-[0.45rem] border border-line-strong bg-foreground px-3 py-2 text-background"
          : [
              "mr-auto max-w-[90%] rounded-[0.45rem] border px-3 py-2 text-foreground",
              isError
                ? "border-[#8c3f3f] bg-[#1a0f10] text-[#f0c5c5]"
                : "border-line bg-[#0d0d0f]",
            ].join(" ")
      }
    >
      <p className="whitespace-pre-wrap text-[0.82rem] leading-5">
        {message.content || "Streaming..."}
      </p>
    </div>
  );
}

async function readErrorMessage(response: Response) {
  const data = (await response.json().catch(() => ({}))) as AgentErrorResponse;

  return data.error ?? "Portfolio agent failed.";
}

function SendIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-4"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path d="m5 12 14-7-7 14-2-5z" />
      <path d="m12 14 7-9" />
    </svg>
  );
}

function RetryIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-4"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path d="M21 12a9 9 0 1 1-2.64-6.36" />
      <path d="M21 3v6h-6" />
    </svg>
  );
}

function ClearIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-4"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path d="M3 6h18" />
      <path d="M8 6V4h8v2" />
      <path d="M19 6l-1 14H6L5 6" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-4"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}
