"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import { ChatBubbleIcon } from "@/components/DockIcons";
import { DockTooltip } from "@/components/DockTooltip";
import { MAX_QUESTION_LENGTH } from "@/lib/chat-limits";
import { cn } from "@/lib/utils";

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
    content:
      "Hi, I'm Miles's portfolio agent. Ask for a quick read on his GTM work, RevOps impact, AI systems, or the best links to explore.",
  },
];

export function PortfolioChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [status, setStatus] = useState<ChatStatus>("idle");
  const [lastQuestion, setLastQuestion] = useState("");
  const [announcement, setAnnouncement] = useState("");
  const formRef = useRef<HTMLFormElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const isBusy = status !== "idle";
  const canSubmit = input.trim().length > 0 && !isBusy;
  const canRetry = lastQuestion.length > 0 && !isBusy;
  const hasConversation = messages.length > initialMessages.length;

  useEffect(() => {
    if (isOpen) {
      scrollRef.current?.scrollIntoView({ block: "end" });
    }
  }, [isOpen, messages, status]);

  useEffect(() => {
    if (isOpen) {
      textareaRef.current?.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
        toggleRef.current?.focus();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

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
    setAnnouncement("");

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
        setAnnouncement(errorMessage);
        return;
      }

      if (!response.body) {
        updateAssistantMessage(
          assistantId,
          "Portfolio agent returned an empty response.",
          "error",
        );
        setAnnouncement("Portfolio agent returned an empty response.");
        return;
      }

      setStatus("streaming");
      await streamAssistantMessage(response.body, assistantId);
    } catch {
      const message =
        "The portfolio agent lost its connection. Try again in a moment.";
      updateAssistantMessage(assistantId, message, "error");
      setAnnouncement(message);
    } finally {
      setStatus("idle");
      focusTextareaSoon();
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
        setAnnouncement("Portfolio agent returned an empty response.");
        return;
      }

      updateAssistantMessage(assistantId, answer.trim());
      setAnnouncement("Answer ready.");
    } catch {
      const message = answer.trim()
        ? `${answer.trim()}\n\nThe connection stopped before the answer finished. Retry for a complete response.`
        : "The connection dropped before the agent could answer. Try again.";

      updateAssistantMessage(assistantId, message, "error");
      setAnnouncement(
        answer.trim()
          ? "Answer interrupted. Retry for a complete response."
          : "The connection dropped before the agent could answer.",
      );
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
    setAnnouncement("Chat cleared.");
    focusTextareaSoon();
  }

  function closeChat() {
    setIsOpen(false);
    toggleRef.current?.focus();
  }

  function focusTextareaSoon() {
    requestAnimationFrame(() => {
      textareaRef.current?.focus();
    });
  }

  return (
    <div className="pointer-events-auto relative">
      {isOpen ? (
        <section
          aria-label="Portfolio agent chat"
          className="fixed inset-x-3 bottom-[calc(5.75rem+env(safe-area-inset-bottom))] z-30 mx-auto flex max-h-[min(34rem,calc(100vh-7.5rem))] max-w-[23rem] flex-col overflow-hidden rounded-[0.45rem] border border-line-strong bg-background/96 shadow-2xl shadow-black/45 backdrop-blur sm:left-auto sm:right-[max(1rem,calc((100vw-42rem)/2+4rem))] sm:mx-0 sm:w-[23rem]"
          role="dialog"
        >
          <div className="flex items-center justify-between gap-3 border-b border-line px-3 py-2.5">
            <div className="flex min-w-0 items-center gap-2.5">
              <span className="relative flex size-8 shrink-0 items-center justify-center rounded-[0.35rem] border border-line bg-[#111113]">
                <Image
                  alt=""
                  aria-hidden="true"
                  className="size-5 object-contain"
                  height={20}
                  src="/img/brand/chatgpt-64.png"
                  unoptimized
                  width={20}
                />
                <span className="absolute -bottom-1 -right-1 flex size-4 items-center justify-center rounded-[0.2rem] border border-background bg-[#111113]">
                  <Image
                    alt=""
                    aria-hidden="true"
                    className="size-3 object-contain"
                    height={12}
                    src="/img/brand/codex-64.png"
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
                aria-disabled={!canRetry}
                className={[
                  "flex size-8 items-center justify-center rounded-sm text-muted transition-colors hover:bg-foreground/5 hover:text-foreground",
                  !canRetry ? "cursor-not-allowed opacity-35" : "",
                ].join(" ")}
                title="Retry"
                type="button"
                onClick={() => {
                  if (canRetry) {
                    void submitQuestion(lastQuestion);
                  }
                }}
              >
                <RetryIcon />
              </button>
              <button
                aria-label="Clear chat"
                aria-disabled={!hasConversation || isBusy}
                className={[
                  "flex size-8 items-center justify-center rounded-sm text-muted transition-colors hover:bg-foreground/5 hover:text-foreground",
                  !hasConversation || isBusy ? "cursor-not-allowed opacity-35" : "",
                ].join(" ")}
                title="Clear"
                type="button"
                onClick={() => {
                  if (hasConversation && !isBusy) {
                    clearConversation();
                  }
                }}
              >
                <ClearIcon />
              </button>
              <button
                aria-label="Close AI chat"
                className="flex size-8 items-center justify-center rounded-sm text-muted transition-colors hover:bg-foreground/5 hover:text-foreground"
                title="Close"
                type="button"
                onClick={closeChat}
              >
                <CloseIcon />
              </button>
            </div>
          </div>

          <div
            aria-label="Chat messages"
            className="flex-1 space-y-3 overflow-y-auto px-3 py-3"
            tabIndex={0}
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

          <p className="sr-only" role="status">
            {announcement}
          </p>

          <form
            className="border-t border-line p-2"
            ref={formRef}
            onSubmit={handleSubmit}
          >
            <div className="flex items-end gap-2 rounded-[0.45rem] border border-line-strong bg-[#0d0d0f] p-2 transition-colors focus-within:border-foreground/35">
              <textarea
                aria-label="Ask the portfolio agent"
                aria-disabled={isBusy}
                className="max-h-28 min-h-11 flex-1 resize-none bg-transparent text-[0.82rem] leading-5 text-foreground outline-none placeholder:text-subtle"
                maxLength={MAX_QUESTION_LENGTH}
                placeholder="Ask about GTM impact, AI systems, or links"
                readOnly={isBusy}
                ref={textareaRef}
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
                aria-disabled={!canSubmit}
                className={[
                  "flex size-8 shrink-0 items-center justify-center rounded-sm bg-foreground text-background transition-opacity",
                  !canSubmit ? "cursor-not-allowed opacity-40" : "",
                ].join(" ")}
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
        aria-haspopup="dialog"
        aria-label="Open OpenAI Agents SDK chat"
        className={cn(
          "group/action relative flex h-12 min-w-12 items-center justify-center rounded-[0.45rem] text-muted transition-colors hover:bg-foreground/10 hover:text-foreground focus-visible:bg-foreground/10 focus-visible:text-foreground",
          isOpen ? "bg-foreground/10 text-foreground" : "",
        )}
        ref={toggleRef}
        type="button"
        onClick={() => setIsOpen((current) => !current)}
      >
        <DockTooltip>OpenAI Agents SDK chat</DockTooltip>
        <ChatBubbleIcon />
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
  if (response.status === 503) {
    return "The portfolio agent is offline right now. Use the email link in the dock to reach Miles directly.";
  }

  if (response.status === 429) {
    return "The agent is handling a lot of questions right now. Try again in a minute.";
  }

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
