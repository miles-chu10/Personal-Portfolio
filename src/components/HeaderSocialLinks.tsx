import { type SocialLink } from "@/data/portfolio";

export function HeaderSocialLinks({ links }: { links: SocialLink[] }) {
  return (
    <nav aria-label="Social links" className="mt-4 flex items-center gap-2">
      {links.map((link) => (
        <a
          className="flex size-8 items-center justify-center rounded-sm border border-transparent text-muted transition-colors hover:border-line hover:bg-foreground/5 hover:text-foreground focus-visible:border-line-strong focus-visible:text-foreground"
          href={link.href}
          key={link.href}
          rel={link.href.startsWith("http") ? "noreferrer" : undefined}
          target={link.href.startsWith("http") ? "_blank" : undefined}
          title={link.label}
        >
          <SocialIcon kind={link.kind} />
          <span className="sr-only">{link.label}</span>
        </a>
      ))}
    </nav>
  );
}

function SocialIcon({ kind }: { kind: SocialLink["kind"] }) {
  if (kind === "email") {
    return (
      <svg
        aria-hidden="true"
        className="size-4"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
        viewBox="0 0 24 24"
      >
        <rect height="14" rx="2" width="18" x="3" y="5" />
        <path d="m4 7 8 6 8-6" />
      </svg>
    );
  }

  if (kind === "linkedin") {
    return (
      <svg
        aria-hidden="true"
        className="size-4"
        fill="currentColor"
        viewBox="0 0 24 24"
      >
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.447-2.136 2.943v5.663H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.266 2.371 4.266 5.455zM5.337 7.433a2.063 2.063 0 1 1 0-4.126 2.063 2.063 0 0 1 0 4.126M7.119 20.452H3.554V9h3.565zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0z" />
      </svg>
    );
  }

  return (
    <svg
      aria-hidden="true"
      className="size-4"
      fill="currentColor"
      viewBox="0 0 24 24"
    >
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577v-2.234c-3.338.724-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.085 1.838 1.238 1.838 1.238 1.07 1.835 2.809 1.305 3.495.998.108-.776.418-1.305.762-1.605-2.665-.305-5.466-1.334-5.466-5.93 0-1.31.469-2.381 1.235-3.221-.123-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.5 11.5 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.119 3.176.77.84 1.233 1.911 1.233 3.221 0 4.609-2.806 5.624-5.479 5.921.43.371.823 1.102.823 2.222v3.293c0 .322.216.695.825.577C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  );
}
