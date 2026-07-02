import { DockIcon } from "@/components/DockIcons";
import { DockTooltip } from "@/components/DockTooltip";
import { PortfolioChat } from "@/components/PortfolioChat";
import { type Link } from "@/data/portfolio";

export function FooterDock({ links }: { links: Link[] }) {
  const navLinks = links.filter((link) => link.placement !== "utility");
  const utilityLinks = links.filter((link) => link.placement === "utility");

  return (
    <nav
      aria-label="Portfolio links"
      className="pointer-events-none fixed inset-x-0 bottom-0 z-20"
    >
      <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-background via-background/95 to-transparent" />
      <div className="relative mx-auto flex max-w-[42rem] items-center justify-between gap-3 px-4 pb-[calc(1.25rem+env(safe-area-inset-bottom))] pt-8 sm:px-6">
        <div className="flex min-w-0 items-center gap-1.5">
          {navLinks.map((link) => (
            <FooterLink key={link.href} link={link} />
          ))}
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          {utilityLinks.map((link) => (
            <FooterLink key={link.href} link={link} />
          ))}
          <PortfolioChat />
        </div>
      </div>
    </nav>
  );
}

function FooterLink({ link }: { link: Link }) {
  const isUtility = link.placement === "utility";

  if (isUtility) {
    return (
      <a
        aria-label={link.label}
        className="group/action pointer-events-auto relative flex h-12 min-w-12 items-center justify-center gap-2 rounded-[0.45rem] px-3 text-muted transition-colors hover:bg-foreground/10 hover:text-foreground focus-visible:bg-foreground/10 focus-visible:text-foreground"
        download={link.download}
        href={link.href}
        rel={link.href.startsWith("http") ? "noreferrer" : undefined}
        target={link.href.startsWith("http") ? "_blank" : undefined}
      >
        <DockTooltip>{link.label}</DockTooltip>
        <DockIcon kind={link.shortLabel === "PDF" ? "pdf" : "info"} />
        {link.shortLabel === "PDF" ? (
          <span className="text-[0.9rem] font-semibold leading-none text-current">
            PDF
          </span>
        ) : null}
      </a>
    );
  }

  return (
    <a
      className="pointer-events-auto flex h-8 min-w-8 items-center justify-center rounded-sm border border-transparent px-2 text-[0.72rem] font-medium leading-none text-muted transition-colors hover:border-line hover:bg-foreground/5 hover:text-foreground focus-visible:border-line-strong focus-visible:text-foreground"
      download={link.download}
      href={link.href}
      rel={link.href.startsWith("http") ? "noreferrer" : undefined}
      target={link.href.startsWith("http") ? "_blank" : undefined}
      title={link.label}
    >
      <span>{link.shortLabel}</span>
      <span className="sr-only"> {link.label}</span>
    </a>
  );
}
