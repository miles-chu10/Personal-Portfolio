import Image from "next/image";

import { FooterDock } from "@/components/FooterDock";
import { HeaderSocialLinks } from "@/components/HeaderSocialLinks";
import {
  earlier,
  footerLinks,
  impactRows,
  latest,
  profile,
  skillRows,
  socialLinks,
  type ImpactRow,
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
          <p className="mt-2 text-[0.95rem] leading-5 text-subtle">
            {profile.location} ·{" "}
            <a
              className="underline decoration-foreground/30 transition-colors hover:text-foreground hover:decoration-foreground"
              href={`mailto:${profile.email}`}
            >
              {profile.email}
            </a>
          </p>
          <HeaderSocialLinks links={socialLinks} />
        </header>

        <div className="space-y-16">
          <WorkSection latestItems={latest} earlierItems={earlier} />
          <ImpactSection rows={impactRows} />
          <SkillsSection rows={skillRows} />
        </div>
      </div>

      <FooterDock links={footerLinks} />
    </main>
  );
}

function WorkSection({
  latestItems,
  earlierItems,
}: {
  latestItems: TimelineItem[];
  earlierItems: TimelineItem[];
}) {
  return (
    <section id="work" aria-labelledby="work-heading">
      <SectionHeading title="Work" />
      <div className="space-y-10">
        <TimelineGroup title="Latest" items={latestItems} />
        <TimelineGroup title="Earlier" items={earlierItems} />
      </div>
    </section>
  );
}

function TimelineGroup({
  title,
  items,
}: {
  title: string;
  items: TimelineItem[];
}) {
  return (
    <div>
      <h3 className="mb-3 text-[0.82rem] font-normal leading-4 text-subtle">
        {title}
      </h3>
      <div>
        {items.map((item) => (
          <TimelineRow key={item.organization} item={item} />
        ))}
      </div>
    </div>
  );
}

function TimelineRow({ item }: { item: TimelineItem }) {
  const isWordmark = item.logo.display === "wordmark";

  return (
    <article className="group -mx-2 rounded-[0.35rem] border-t border-line px-2 py-4 transition-colors hover:border-line-strong hover:bg-foreground/[0.025] focus-within:border-line-strong focus-within:bg-foreground/[0.025]">
      <div className="grid gap-y-3 sm:grid-cols-[7.5rem_minmax(0,1fr)] sm:gap-x-4 sm:gap-y-0">
        <h3 className="flex min-w-0 items-center gap-2 text-[0.95rem] font-medium leading-5 text-foreground">
          <Image
            alt={isWordmark ? item.logo.alt : ""}
            aria-hidden={isWordmark ? undefined : true}
            className={
              isWordmark
                ? "h-[1.05rem] w-auto max-w-full object-contain"
                : "size-5 shrink-0 object-contain"
            }
            height={item.logo.height ?? 20}
            src={item.logo.src}
            unoptimized
            width={item.logo.width ?? 20}
          />
          {!isWordmark ? (
            <span className="min-w-0 truncate">{item.organization}</span>
          ) : null}
        </h3>

        <div className="space-y-1.5">
          {item.roles.map((role) => (
            <div
              className="grid grid-cols-[minmax(0,1fr)_5.35rem] gap-x-3 sm:grid-cols-[minmax(0,1fr)_7.05rem] sm:gap-x-5"
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
              <p className="text-right text-[0.95rem] leading-5 text-muted tabular-nums sm:whitespace-nowrap">
                {formatPeriod(role.period)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </article>
  );
}

function ImpactSection({ rows }: { rows: ImpactRow[] }) {
  return (
    <section id="impact" aria-labelledby="impact-heading">
      <SectionHeading title="Impact" />
      <div className="grid border-t border-line sm:grid-cols-2">
        {rows.map((row) => (
          <div
            className="border-b border-line py-4 sm:odd:border-r sm:odd:pr-5 sm:even:pl-5"
            key={`${row.metric}-${row.label}`}
          >
            <p className="text-[1.25rem] font-semibold leading-6 text-foreground">
              {row.metric}
            </p>
            <p className="mt-2 text-[0.95rem] font-medium leading-5 text-foreground">
              {row.label}
            </p>
            <p className="mt-1 text-[0.95rem] leading-5 text-muted">
              {row.detail}
            </p>
          </div>
        ))}
      </div>
    </section>
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

function formatPeriod(period: string) {
  return period.replaceAll(" ", "\u00A0").replaceAll("-", " - ");
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
