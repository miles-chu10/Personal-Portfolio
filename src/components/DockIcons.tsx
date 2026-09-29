export function DockIcon({ kind }: { kind: "pdf" | "github" | "info" }) {
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

  if (kind === "github") {
    return (
      <svg
        aria-hidden="true"
        className="size-6 shrink-0"
        fill="currentColor"
        viewBox="0 0 24 24"
      >
        <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.009-.868-.014-1.703-2.782.605-3.369-1.343-3.369-1.343-.455-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.071 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.091-.647.349-1.088.635-1.338-2.221-.253-4.555-1.112-4.555-4.944 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.269.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.294 2.748-1.025 2.748-1.025.546 1.378.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.337 4.688-4.566 4.936.359.31.678.921.678 1.856 0 1.34-.012 2.421-.012 2.75 0 .268.18.58.688.482A10.019 10.019 0 0 0 22 12.017C22 6.484 17.522 2 12 2Z" />
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
