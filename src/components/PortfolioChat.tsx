"use client";

import { useRef, useState } from "react";

type ChatMessage = {
  id: string;
  role: "assistant" | "user";
  content: string;
};

type AgentResponse = {
  answer?: string;
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
  const [isLoading, setIsLoading] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const canSubmit = input.trim().length > 0 && !isLoading;

  async function handleSubmit(event: { preventDefault: () => void }) {
    event.preventDefault();

    const question = input.trim();
    if (!question || isLoading) {
      return;
    }

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: question,
    };

    setMessages((current) => [...current, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/agent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question }),
      });

      const data = (await response.json().catch(() => ({}))) as AgentResponse;

      const answer = data.answer;

      if (!response.ok || !answer) {
        setMessages((current) => [
          ...current,
          {
            id: `assistant-${Date.now()}`,
            role: "assistant",
            content: data.error ?? "Portfolio agent failed.",
          },
        ]);
        return;
      }

      setMessages((current) => [
        ...current,
        {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: answer,
        },
      ]);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Portfolio agent failed.";

      setMessages((current) => [
        ...current,
        {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: message,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="pointer-events-auto relative">
      {isOpen ? (
        <section
          aria-label="Portfolio agent chat"
          className="fixed inset-x-4 bottom-[calc(4.75rem+env(safe-area-inset-bottom))] z-30 mx-auto flex max-h-[min(32rem,calc(100vh-7rem))] max-w-[22rem] flex-col overflow-hidden rounded-[0.45rem] border border-line-strong bg-background/95 shadow-2xl shadow-black/40 backdrop-blur sm:left-auto sm:right-[max(1rem,calc((100vw-42rem)/2+1rem))] sm:mx-0 sm:w-[22rem]"
        >
          <div className="flex items-center justify-between gap-3 border-b border-line px-3 py-2.5">
            <div className="min-w-0">
              <h2 className="truncate text-[0.82rem] font-medium leading-5 text-foreground">
                Portfolio Agent
              </h2>
              <p className="truncate text-[0.72rem] leading-4 text-subtle">
                OpenAI Agents SDK
              </p>
            </div>
            <button
              aria-label="Close AI chat"
              className="flex size-8 shrink-0 items-center justify-center rounded-sm text-muted transition-colors hover:bg-foreground/5 hover:text-foreground"
              type="button"
              onClick={() => setIsOpen(false)}
            >
              <CloseIcon />
            </button>
          </div>

          <div
            aria-live="polite"
            className="flex-1 space-y-3 overflow-y-auto px-3 py-3"
          >
            {messages.map((message) => (
              <div
                className={
                  message.role === "user"
                    ? "ml-auto max-w-[86%] rounded-[0.45rem] border border-line-strong bg-foreground px-3 py-2 text-background"
                    : "mr-auto max-w-[90%] rounded-[0.45rem] border border-line bg-[#0d0d0f] px-3 py-2 text-foreground"
                }
                key={message.id}
              >
                <p className="whitespace-pre-wrap text-[0.82rem] leading-5">
                  {message.content}
                </p>
              </div>
            ))}
            {isLoading ? (
              <div className="mr-auto rounded-[0.45rem] border border-line bg-[#0d0d0f] px-3 py-2 text-[0.82rem] leading-5 text-muted">
                Thinking...
              </div>
            ) : null}
          </div>

          <form
            className="border-t border-line p-2"
            ref={formRef}
            onSubmit={handleSubmit}
          >
            <div className="flex items-end gap-2 rounded-[0.45rem] border border-line-strong bg-[#0d0d0f] p-2">
              <textarea
                aria-label="Ask the portfolio agent"
                className="max-h-28 min-h-11 flex-1 resize-none bg-transparent text-[0.82rem] leading-5 text-foreground outline-none placeholder:text-subtle"
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
        className="flex h-8 min-w-8 items-center justify-center rounded-sm p-1.5 text-muted transition-colors hover:bg-foreground/5 hover:text-foreground focus-visible:text-foreground"
        title="AI Chat"
        type="button"
        onClick={() => setIsOpen((current) => !current)}
      >
        <OpenAIIcon />
      </button>
    </div>
  );
}

function OpenAIIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-5"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.7"
      viewBox="0 0 24 24"
    >
      <path d="M12 3.5c1.9 0 3.5 1.1 4.2 2.8" />
      <path d="M18 8.6c1 1.7.7 3.8-.7 5.1" />
      <path d="M15.6 17.7c-1 1.6-2.9 2.4-4.8 2" />
      <path d="M8.4 19.2c-1.9-.1-3.5-1.2-4.2-2.9" />
      <path d="M6 15.4c-1-1.7-.7-3.8.7-5.1" />
      <path d="M8.4 6.3c1-1.6 2.9-2.4 4.8-2" />
      <path d="m8.6 10.6 3.4-2 3.4 2v4L12 16.6l-3.4-2z" />
    </svg>
  );
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
