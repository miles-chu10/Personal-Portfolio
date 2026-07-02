export function DockIcon({ kind }: { kind: "pdf" | "info" }) {
  if (kind === "pdf") {
    return (
      <svg
        aria-hidden="true"
        className="size-6 shrink-0"
        fill="none"
        viewBox="0 0 24 24"
      >
        <path
          d="M6.5 3.5h7l4 4v13h-11z"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.8"
        />
        <path
          d="M13.5 3.5v4h4"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.8"
        />
        <path
          d="M5.8 16.1h1.1c.8 0 1.3-.4 1.3-1.1s-.5-1.1-1.3-1.1H5.8v4.1m4.4 0v-4.1h1.2c1.2 0 2 .8 2 2.1s-.8 2-2 2zm5.4 0v-4.1h2.8m-2.8 1.8H18"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.25"
        />
      </svg>
    );
  }

  return (
    <svg
      aria-hidden="true"
      className="size-6 shrink-0"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        cx="12"
        cy="12"
        r="8.2"
        stroke="currentColor"
        strokeWidth="1.9"
      />
      <path
        d="M12 10.9v5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.9"
      />
      <circle cx="12" cy="7.8" fill="currentColor" r="1.1" />
    </svg>
  );
}

export function ChatBubbleIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-7 shrink-0"
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        d="M20 11.5c0 4.1-3.7 7.4-8.2 7.4a9.8 9.8 0 0 1-3-.5L4.2 20l1.2-4A7 7 0 0 1 3.6 11.5c0-4.1 3.7-7.4 8.2-7.4S20 7.4 20 11.5Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.75"
      />
    </svg>
  );
}
