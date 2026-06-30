export type RoleLine = {
  title: string;
  detail?: string;
  period: string;
  href?: string;
};

export type TimelineItem = {
  organization: string;
  mark: string;
  markTone: string;
  roles: RoleLine[];
};

export type SimpleRow = {
  label: string;
  value: string;
  meta: string;
};

export type Link = {
  label: string;
  shortLabel: string;
  href: string;
};

export type MiscLink = {
  year: string;
  title: string;
  source: string;
  href: string;
};

export const profile = {
  name: "Miles Chu",
  title: "Product-minded Engineer, Builder, Operator",
  email: "mileschu@gmail.com",
};

export const latest: TimelineItem[] = [
  {
    organization: "OpenAI",
    mark: "O",
    markTone: "#f4f4f5",
    roles: [
      {
        title: "AI workflow and product systems",
        detail: "Codex, agents, local developer surfaces",
        period: "2025 -",
      },
    ],
  },
  {
    organization: "Personal Systems",
    mark: "PS",
    markTone: "#5eead4",
    roles: [
      {
        title: "Workspace automation and agent control plane",
        detail: "Skills, MCP, hooks, durable project context",
        period: "2026",
      },
      {
        title: "Portfolio and proof-of-work artifacts",
        detail: "Static-first, editable from structured data",
        period: "2026",
      },
    ],
  },
  {
    organization: "Diligence",
    mark: "D",
    markTone: "#a78bfa",
    roles: [
      {
        title: "Technical and operating analysis",
        detail: "Software businesses, GTM systems, data quality",
        period: "2024 - 25",
      },
    ],
  },
];

export const earlier: TimelineItem[] = [
  {
    organization: "Product Teams",
    mark: "PT",
    markTone: "#60a5fa",
    roles: [
      {
        title: "Software engineer",
        detail: "Production web apps, internal tools, user workflows",
        period: "Earlier",
      },
    ],
  },
  {
    organization: "Research",
    mark: "R",
    markTone: "#f59e0b",
    roles: [
      {
        title: "Systems mapping and market research",
        detail: "Operating leverage, process design, data workflows",
        period: "Earlier",
      },
    ],
  },
  {
    organization: "Education",
    mark: "E",
    markTone: "#22c55e",
    roles: [
      {
        title: "Product, engineering, and business foundations",
        detail: "Cross-functional execution and analysis",
        period: "Earlier",
      },
    ],
  },
];

export const skillRows: SimpleRow[] = [
  {
    label: "Frontend",
    value: "React, Next.js, TypeScript, Tailwind CSS",
    meta: "UI",
  },
  {
    label: "Systems",
    value: "APIs, automation, observability, local tooling",
    meta: "Infra",
  },
  {
    label: "AI",
    value: "OpenAI API, agent workflows, MCP, evaluation loops",
    meta: "Tools",
  },
  {
    label: "Product",
    value: "Roadmaps, research, diligence, systems thinking",
    meta: "Ops",
  },
];

export const miscLinks: MiscLink[] = [
  {
    year: "2026",
    title: "Personal portfolio system",
    source: "This repo",
    href: "https://github.com/miles-chu10",
  },
  {
    year: "2026",
    title: "Agent workspace experiments",
    source: "Local builds",
    href: "https://github.com/miles-chu10",
  },
  {
    year: "2025",
    title: "Product and diligence notes",
    source: "Selected writing",
    href: "https://www.linkedin.com/in/mileschu/",
  },
];

export const footerLinks: Link[] = [
  {
    label: "LinkedIn",
    shortLabel: "in",
    href: "https://www.linkedin.com/in/mileschu/",
  },
  {
    label: "GitHub",
    shortLabel: "gh",
    href: "https://github.com/miles-chu10",
  },
  {
    label: "Email",
    shortLabel: "@",
    href: `mailto:${profile.email}`,
  },
  {
    label: "Work",
    shortLabel: "wk",
    href: "#latest",
  },
  {
    label: "Skills",
    shortLabel: "sk",
    href: "#skills",
  },
];
