export type RoleLine = {
  title: string;
  detail?: string;
  period: string;
  href?: string;
};

export type TimelineItem = {
  organization: string;
  logo: {
    src: string;
    alt: string;
    width?: number;
    height?: number;
    display?: "mark" | "wordmark";
  };
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
  download?: string;
  placement?: "nav" | "utility";
};

export type MiscLink = {
  year: string;
  title: string;
  source: string;
  href: string;
};

export type SocialLink = {
  label: string;
  href: string;
  kind: "email" | "github" | "linkedin";
};

export const profile = {
  name: "Miles Chu",
  title: "GTM Strategy, Revenue Operations, AI Workflow Builder",
  email: "milesdchu@gmail.com",
  location: "San Francisco Bay Area, CA",
};

export const socialLinks: SocialLink[] = [
  {
    label: "Email",
    href: `mailto:${profile.email}`,
    kind: "email",
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/miles-chu/",
    kind: "linkedin",
  },
  {
    label: "GitHub",
    href: "https://github.com/miles-chu10",
    kind: "github",
  },
];

export const latest: TimelineItem[] = [
  {
    organization: "OpenAI",
    logo: {
      src: "/img/logos/openai.svg",
      alt: "OpenAI",
      width: 270,
      height: 73,
      display: "wordmark",
    },
    roles: [
      {
        title: "Member of GTM Staff",
        detail: "executive pipeline reporting, RevOps intake, Statsig GTM readiness",
        period: "Oct '25-Feb '26",
      },
      {
        title: "AI-assisted operating workflows",
        detail: "Google Apps Script, Slack routing, Custom GPT workflows",
        period: "Oct '25-Feb '26",
      },
    ],
  },
  {
    organization: "Docusign",
    logo: {
      src: "/img/logos/docusign.svg",
      alt: "Docusign",
      width: 70,
      height: 15,
      display: "wordmark",
    },
    roles: [
      {
        title: "Sales Strategy and Operations Analyst",
        detail: "territory investment, global pipeline analytics, executive reporting",
        period: "Jan-Oct '25",
      },
    ],
  },
  {
    organization: "IBM",
    logo: {
      src: "/img/logos/ibm.svg",
      alt: "IBM",
      width: 1075,
      height: 401,
      display: "wordmark",
    },
    roles: [
      {
        title: "Consultant",
        detail: "GTM playbooks, GenAI transformation roadmap, LLM support",
        period: "Oct '22-Dec '24",
      },
      {
        title: "Sales Operations and Enablement Lead",
        detail: "IBM Consulting Advantage, Solution Architect Craft",
        period: "Oct '22-Dec '24",
      },
      {
        title: "Consulting platform enablement",
        detail: "onboarding workflows, SME sessions, 50+ solution architects",
        period: "Oct '22-Dec '24",
      },
    ],
  },
];

export const earlier: TimelineItem[] = [
  {
    organization: "Esri",
    logo: {
      src: "/img/logos/esri.svg",
      alt: "Esri",
      width: 24,
      height: 24,
      display: "mark",
    },
    roles: [
      {
        title: "Business Strategy and Analytics Intern",
        detail: "campaign pipeline, lead conversion, Salesforce and Power BI",
        period: "Jun-Sep '21",
      },
    ],
  },
  {
    organization: "UC Riverside",
    logo: {
      src: "/img/logos/uc-riverside.svg",
      alt: "UC Riverside",
      width: 500,
      height: 155,
      display: "wordmark",
    },
    roles: [
      {
        title: "B.S. Business Administration",
        detail: "marketing concentration",
        period: "Sep '18-Mar '22",
      },
    ],
  },
];

export const impactRows: ImpactRow[] = [
  {
    metric: "$250M+",
    label: "OpenAI pipeline decisions",
    detail:
      "Owned weekly coverage, hygiene, and risk views for RevOps and CRO leadership with standardized Salesforce stage logic.",
  },
  {
    metric: "45-50%",
    label: "Faster RevOps intake",
    detail:
      "Built AI-native request triage across Google Sheets, Apps Script, Slack routing, and human-in-the-loop review.",
  },
  {
    metric: "30%",
    label: "Salesforce efficiency lift",
    detail:
      "Automated Proof-of-Concept lifecycle management with status-change logic and Custom GPT schema-powered tooling.",
  },
  {
    metric: "$150M+",
    label: "Docusign territory decisions",
    detail:
      "Cut reporting cycle time by 40% with redesigned SQL-driven forecasting models and streamlined executive reporting.",
  },
  {
    metric: "$1.5B+",
    label: "Global pipeline framework",
    detail:
      "Improved forecast accuracy by 18% and opportunity quality by 25% with a dynamic deal valuation and benchmark framework.",
  },
  {
    metric: "$2.3M+",
    label: "IBM incremental revenue",
    detail:
      "Designed account strategies and standardized GTM playbooks across 3 market segments, lifting conversion 2%.",
  },
  {
    metric: "220+",
    label: "AI workflow users",
    detail:
      "Partnered with engineering and client executives on user journeys, governance KPIs, and Agile feature iterations.",
  },
  {
    metric: "800+",
    label: "Hours removed annually",
    detail:
      "Built a SQL-driven KPI tracker and dashboard workflow that automated sales leadership reporting.",
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
    value: "SQL, Snowflake, MySQL, Tableau, Power BI, Excel, Google Sheets",
    meta: "BI",
  },
  {
    label: "Automation",
    value: "Google Apps Script, Slack API, n8n, Docker, Jira",
    meta: "Ops",
  },
  {
    label: "AI Systems",
    value: "OpenAI API, Codex, Claude Code, Custom GPTs, MCP workflows",
    meta: "AI",
  },
  {
    label: "Operating Model",
    value: "Intake triage, human review loops, executive ROB, governance KPIs",
    meta: "Adoption",
  },
  {
    label: "Certs",
    value:
      "Salesforce Administrator, Marketing Cloud Administrator, Business Analyst, Associate, AI Associate",
    meta: "SFDC",
  },
  {
    label: "Languages",
    value: "English, Mandarin Chinese",
    meta: "Fluent",
  },
];

export const miscLinks: MiscLink[] = [
  {
    year: "2026",
    title: "Personal portfolio system and checkpoints",
    source: "GitHub",
    href: "https://github.com/miles-chu10/Personal-Portfolio",
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
    label: "Work",
    shortLabel: "Work",
    href: "#work",
    placement: "nav",
  },
  {
    label: "Impact",
    shortLabel: "Impact",
    href: "#impact",
    placement: "nav",
  },
  {
    label: "Skills",
    shortLabel: "Skills",
    href: "#skills",
    placement: "nav",
  },
  {
    label: "Download resume",
    shortLabel: "PDF",
    href: "/Miles_Chu_Resume.pdf",
    download: "Miles_Chu_Resume.pdf",
    placement: "utility",
  },
  {
    label: "Website info",
    shortLabel: "Info",
    href: "https://github.com/miles-chu10/Personal-Portfolio",
    placement: "utility",
  },
];
