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

export type ImpactRow = {
  metric: string;
  label: string;
  detail: string;
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
  title: "GTM Strategy, Revenue Operations, AI Workflow Systems",
  email: "milesdchu@gmail.com",
  location: "San Francisco Bay Area",
};

export const latest: TimelineItem[] = [
  {
    organization: "OpenAI",
    mark: "O",
    markTone: "#f4f4f5",
    roles: [
      {
        title: "Member of GTM Staff",
        detail: "pipeline coverage, RevOps systems, GTM readiness",
        period: "2025 - 26",
      },
      {
        title: "AI-assisted operating workflows",
        detail: "Salesforce automation, intake triage, PoC lifecycle tooling",
        period: "2025 - 26",
      },
    ],
  },
  {
    organization: "Docusign",
    mark: "D",
    markTone: "#60a5fa",
    roles: [
      {
        title: "Sales Strategy and Operations Analyst",
        detail: "forecasting, pipeline analytics, executive reporting cadence",
        period: "2025",
      },
    ],
  },
  {
    organization: "IBM",
    mark: "I",
    markTone: "#a78bfa",
    roles: [
      {
        title: "Consultant",
        detail: "GTM playbooks, GenAI support roadmap, enablement systems",
        period: "2022 - 24",
      },
      {
        title: "Sales Operations and Enablement Lead",
        detail: "IBM Consulting Advantage, Solution Architect Craft",
        period: "2022 - 24",
      },
    ],
  },
];

export const earlier: TimelineItem[] = [
  {
    organization: "Esri",
    mark: "E",
    markTone: "#22c55e",
    roles: [
      {
        title: "Business Strategy and Analytics Intern",
        detail: "campaign pipeline, lead conversion, Salesforce and Power BI",
        period: "2021",
      },
    ],
  },
  {
    organization: "UC Riverside",
    mark: "UC",
    markTone: "#f59e0b",
    roles: [
      {
        title: "B.S. Business Administration",
        detail: "marketing concentration",
        period: "2018 - 22",
      },
    ],
  },
  {
    organization: "Personal Systems",
    mark: "PS",
    markTone: "#5eead4",
    roles: [
      {
        title: "Agent workflow and portfolio experiments",
        detail: "static-first proof-of-work, local automation, durable context",
        period: "2026",
      },
    ],
  },
];

export const impactRows: ImpactRow[] = [
  {
    metric: "$250M+",
    label: "Pipeline decisions",
    detail:
      "Owned coverage, hygiene, and risk metrics for executive GTM operating cadence.",
  },
  {
    metric: "45-50%",
    label: "Faster RevOps intake",
    detail:
      "Automated request triage across Google Sheets, Apps Script, and Slack workflows.",
  },
  {
    metric: "$1.5B+",
    label: "Forecasting surface",
    detail:
      "Analyzed global pipeline coverage, deal quality, and conversion thresholds.",
  },
  {
    metric: "800+",
    label: "Hours removed annually",
    detail:
      "Built SQL-driven KPI tracking and reporting automation for sales leadership.",
  },
];

export const skillRows: SimpleRow[] = [
  {
    label: "GTM Ops",
    value: "Salesforce, forecasting, pipeline analytics, rhythm of business",
    meta: "RevOps",
  },
  {
    label: "Analytics",
    value: "SQL, Tableau, Power BI, Excel, Google Sheets",
    meta: "BI",
  },
  {
    label: "Automation",
    value: "Google Apps Script, Slack workflows, n8n, Docker",
    meta: "Ops",
  },
  {
    label: "AI Systems",
    value: "OpenAI Codex, Claude Code, Custom GPTs, workflow evaluation",
    meta: "AI",
  },
  {
    label: "Certs",
    value:
      "Salesforce Admin, Marketing Cloud Admin, Business Analyst, Associate, AI Associate",
    meta: "SFDC",
  },
];

export const miscLinks: MiscLink[] = [
  {
    year: "2026",
    title: "Personal portfolio system and checkpoints",
    source: "GitHub",
    href: "https://github.com/miles-chu10",
  },
  {
    year: "2026",
    title: "Agent workflow experiments",
    source: "Local builds",
    href: "https://github.com/miles-chu10",
  },
  {
    year: "2025",
    title: "Revenue operations and GTM systems",
    source: "Selected work",
    href: "https://www.linkedin.com/in/miles-chu/",
  },
];

export const footerLinks: Link[] = [
  {
    label: "LinkedIn",
    shortLabel: "in",
    href: "https://www.linkedin.com/in/miles-chu/",
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
    label: "Impact",
    shortLabel: "im",
    href: "#impact",
  },
  {
    label: "Skills",
    shortLabel: "sk",
    href: "#skills",
  },
];
