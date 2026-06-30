import {
  earlier,
  footerLinks,
  latest,
  miscLinks,
  profile,
  skillRows,
  type Link,
  type MiscLink,
  type SimpleRow,
  type TimelineItem,
} from "@/data/portfolio";

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto w-full max-w-[42rem] px-4 pb-28 pt-24 sm:px-6 sm:pt-28">
        <header className="mb-16">
          <h1 className="text-[1.85rem] font-semibold leading-none text-foreground sm:text-[2rem]">
            {profile.name}
          </h1>
          <p className="mt-3 text-[0.96rem] leading-5 text-muted">
            {profile.title}
          </p>
        </header>

        <div className="space-y-16">
          <TimelineSection id="latest" title="Latest" items={latest} />
          <TimelineSection title="Earlier" items={earlier} />
          <SkillsSection rows={skillRows} />
          <MiscSection links={miscLinks} />
        </div>
      </div>

      <FooterDock links={footerLinks} />
    </main>
  );
}

function TimelineSection({
  id,
  title,
  items,
}: {
  id?: string;
  title: string;
  items: TimelineItem[];
}) {
  return (
    <section id={id} aria-labelledby={`${title.toLowerCase()}-heading`}>
      <SectionHeading title={title} />
      <div>
        {items.map((item) => (
          <TimelineRow key={item.organization} item={item} />
        ))}
      </div>
    </section>
  );
}

function TimelineRow({ item }: { item: TimelineItem }) {
  return (
    <article className="group border-t border-line py-4 transition-colors hover:border-line-strong">
      <div className="grid grid-cols-[1.5rem_minmax(0,1fr)] gap-x-3 sm:grid-cols-[1.5rem_6.25rem_minmax(0,1fr)] sm:gap-x-5">
        <span
          className="mt-[0.2rem] flex size-5 shrink-0 items-center justify-center rounded-[0.28rem] text-[0.56rem] font-semibold leading-none text-background"
          style={{ backgroundColor: item.markTone }}
          aria-hidden="true"
        >
          {item.mark}
        </span>

        <h3 className="text-[0.95rem] font-medium leading-5 text-foreground">
          {item.organization}
        </h3>

        <div className="col-start-2 mt-2 space-y-1 sm:col-start-3 sm:mt-0">
          {item.roles.map((role) => (
            <div
              className="grid grid-cols-[minmax(0,1fr)_4.75rem] gap-x-3 sm:grid-cols-[minmax(0,1fr)_5.5rem] sm:gap-x-4"
              key={`${role.title}-${role.period}`}
            >
              <p className="min-w-0 text-[0.95rem] leading-5 text-foreground">
                {role.href ? (
                  <a
                    className="underline decoration-foreground/40 transition-colors hover:text-foreground hover:decoration-foreground"
                    href={role.href}
                  >
                    {role.title}
                  </a>
                ) : (
                  role.title
                )}
                {role.detail ? (
                  <span className="block text-muted sm:ml-1 sm:inline">
                    {role.detail}
                  </span>
                ) : null}
              </p>
              <p className="text-right text-[0.95rem] leading-5 text-muted">
                {role.period}
              </p>
            </div>
          ))}
        </div>
      </div>
    </article>
  );
}

function SkillsSection({ rows }: { rows: SimpleRow[] }) {
  return (
    <section id="skills" aria-labelledby="skills-heading">
      <SectionHeading title="Skills" />
      <div>
        {rows.map((row) => (
          <div
            className="grid grid-cols-[minmax(0,1fr)_3.5rem] gap-x-3 gap-y-1 border-t border-line py-4 sm:grid-cols-[minmax(7rem,0.55fr)_minmax(0,1fr)_3.5rem] sm:gap-x-4 sm:gap-y-0"
            key={row.label}
          >
            <p className="col-start-1 row-start-1 min-w-0 text-[0.95rem] font-medium leading-5 text-foreground">
              {row.label}
            </p>
            <p className="col-span-2 col-start-1 row-start-2 min-w-0 text-[0.95rem] leading-5 text-muted sm:col-span-1 sm:col-start-2 sm:row-start-1">
              {row.value}
            </p>
            <p className="col-start-2 row-start-1 text-right text-[0.95rem] leading-5 text-subtle sm:col-start-3">
              {row.meta}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

function MiscSection({ links }: { links: MiscLink[] }) {
  return (
    <section aria-labelledby="misc-heading">
      <SectionHeading title="Misc" />
      <div>
        {links.map((link) => (
          <a
            className="group grid grid-cols-[4rem_minmax(0,1fr)_1rem] gap-x-4 border-t border-line py-4 transition-colors hover:border-line-strong"
            href={link.href}
            key={`${link.year}-${link.title}`}
            rel="noreferrer"
            target="_blank"
          >
            <span className="text-[0.95rem] leading-5 text-muted">
              {link.year}
            </span>
            <span className="min-w-0 text-[0.95rem] leading-5 text-foreground">
              {link.title}
              <span className="ml-1 text-muted">{link.source}</span>
            </span>
            <span
              className="text-right text-[0.95rem] leading-5 text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-foreground"
              aria-hidden="true"
            >
              -&gt;
            </span>
          </a>
        ))}
      </div>
    </section>
  );
}

function SectionHeading({ title }: { title: string }) {
  return (
    <h2
      id={`${title.toLowerCase()}-heading`}
      className="mb-4 text-[0.95rem] font-normal leading-5 text-muted"
    >
      {title}
    </h2>
  );
}

function FooterDock({ links }: { links: Link[] }) {
  return (
    <nav
      aria-label="Portfolio links"
      className="pointer-events-none fixed inset-x-0 bottom-0 z-20"
    >
      <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-background via-background/95 to-transparent" />
      <div className="relative mx-auto flex max-w-[42rem] items-center justify-between px-10 pb-5 pt-8 sm:px-16">
        {links.map((link) => (
          <a
            aria-label={link.label}
            className="pointer-events-auto flex h-8 min-w-8 items-center justify-center rounded-full text-[0.72rem] font-medium leading-none text-muted transition-colors hover:text-foreground focus-visible:text-foreground"
            href={link.href}
            key={link.href}
            rel={link.href.startsWith("http") ? "noreferrer" : undefined}
            target={link.href.startsWith("http") ? "_blank" : undefined}
          >
            {link.shortLabel}
          </a>
        ))}
      </div>
    </nav>
  );
}
