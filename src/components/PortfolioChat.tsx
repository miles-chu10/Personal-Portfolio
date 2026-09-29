"use client";

import { ChatKit, useChatKit } from "@openai/chatkit-react";
import { RotateCcw, X } from "lucide-react";
import Script from "next/script";
import { useEffect, useRef, useState } from "react";

import { ChatBubbleIcon } from "@/components/DockIcons";
import { DockTooltip } from "@/components/DockTooltip";

const offlineMessage = "Chat is unavailable right now. Use the email link in the dock to reach Miles.";

export function PortfolioChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasOpened, setHasOpened] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);

  function closeChat() {
    setIsOpen(false);
    toggleRef.current?.focus();
  }

  useEffect(() => {
    if (!isOpen) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
        toggleRef.current?.focus();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen]);

  return (
    <div className="pointer-events-auto relative">
      {hasOpened ? (
        <div className={isOpen ? "block" : "hidden"}>
          <ChatPanel isOpen={isOpen} onClose={closeChat} />
        </div>
      ) : null}
      <button
        aria-controls="portfolio-chat"
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        aria-label={isOpen ? "Close AI chat" : "Open AI chat"}
        className="group/action relative flex size-12 items-center justify-center rounded-[0.45rem] text-muted transition-colors hover:bg-foreground/10 hover:text-foreground focus-visible:bg-foreground/10 focus-visible:text-foreground"
        onClick={() => {
          setHasOpened(true);
          if (isOpen) closeChat();
          else setIsOpen(true);
        }}
        ref={toggleRef}
        type="button"
      >
        <DockTooltip>AI Chat</DockTooltip>
        <ChatBubbleIcon />
      </button>
    </div>
  );
}

function ChatPanel({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState("");
  const closeRef = useRef<HTMLButtonElement>(null);
  const domainKey = process.env.NEXT_PUBLIC_CHATKIT_DOMAIN_KEY?.trim();
  const configured = Boolean(domainKey) || process.env.NODE_ENV !== "production";

  const chatkit = useChatKit({
    api: {
      url: "/api/chatkit",
      domainKey: domainKey || "domain_pk_localhost_dev",
      async fetch(input, init) {
        const response = await fetch(input, { ...init, credentials: "same-origin" });
        if (!response.ok) {
          const message = response.status === 429
            ? "You've sent several questions. Please try again in a minute."
            : offlineMessage;
          setError(message);
          throw new Error(message);
        }
        setError(null);
        return response;
      },
    },
    frameTitle: "Chat about Miles Chu",
    theme: {
      colorScheme: "dark",
      density: "compact",
      radius: "soft",
      typography: { fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", baseSize: 14 },
      color: { surface: { background: "#080808", foreground: "#0d0d0f" } },
    },
    header: { enabled: false },
    history: { enabled: false },
    startScreen: {
      greeting: "What would you like to know about Miles?",
      prompts: [
        { label: "Work experience", prompt: "Give me a short overview of Miles's work experience.", icon: "suitcase" },
        { label: "Projects and AI", prompt: "What projects and AI systems has Miles worked on?", icon: "square-code" },
        { label: "Skills and impact", prompt: "What are Miles's strongest skills and impact examples?", icon: "chart" },
      ],
    },
    composer: { placeholder: "Ask about Miles's work…", attachments: { enabled: false } },
    threadItemActions: { feedback: false, retry: false },
    onReady() {
      setReady(true);
      if (isOpen) void chatkit.focusComposer();
    },
    onResponseStart() { setAnnouncement("Answering your question."); },
    onResponseEnd() { setAnnouncement("Answer ready."); },
    onError() { setError((current) => current || offlineMessage); },
  });

  const focusComposer = chatkit.focusComposer;

  useEffect(() => {
    if (!isOpen) return;
    if (ready) void focusComposer();
    else closeRef.current?.focus();
  }, [isOpen, ready, focusComposer]);

  return (
    <section
      aria-label="Miles's portfolio chat"
      className="fixed inset-x-3 bottom-[calc(5.75rem+env(safe-area-inset-bottom))] z-30 mx-auto flex h-[min(35rem,calc(100dvh-7.5rem))] max-w-[25rem] flex-col overflow-hidden rounded-[0.45rem] border border-line-strong bg-background shadow-2xl shadow-black/45 sm:left-auto sm:right-[max(1rem,calc((100vw-42rem)/2+4rem))] sm:mx-0 sm:w-[25rem]"
      id="portfolio-chat"
      role="dialog"
    >
      <div className="flex items-center justify-between gap-3 border-b border-line px-3 py-2">
        <h2 className="text-sm font-medium">Ask about Miles</h2>
        <div className="flex items-center gap-1">
          <button
            aria-label="New conversation"
            className="flex size-9 items-center justify-center rounded-sm text-muted hover:bg-foreground/10 hover:text-foreground"
            disabled={!ready}
            onClick={() => { setError(null); void chatkit.setThreadId(null).then(() => chatkit.focusComposer()); }}
            title="New conversation"
            type="button"
          >
            <RotateCcw aria-hidden="true" size={16} />
          </button>
          <button aria-label="Close chat" className="flex size-9 items-center justify-center rounded-sm text-muted hover:bg-foreground/10 hover:text-foreground" onClick={onClose} ref={closeRef} type="button">
            <X aria-hidden="true" size={18} />
          </button>
        </div>
      </div>
      {configured ? (
        <>
          <Script id="openai-chatkit" onError={() => setError(offlineMessage)} src="https://cdn.platform.openai.com/deployments/chatkit/chatkit.js" strategy="afterInteractive" />
          {!ready && !error ? <p className="px-4 py-3 text-sm text-muted" role="status">Loading chat…</p> : null}
          <ChatKit className="block min-h-0 w-full flex-1" control={chatkit.control} />
        </>
      ) : <p className="px-4 py-3 text-sm text-muted" role="status">{offlineMessage}</p>}
      {error ? <p className="border-t border-line px-4 py-3 text-sm text-muted" role="alert">{error}</p> : null}
      <p aria-live="polite" className="sr-only" role="status">{announcement}</p>
    </section>
  );
}
