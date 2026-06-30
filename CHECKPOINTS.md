# Website Checkpoints

This file tracks practical website versions. Each version should ship with a
clear purpose, content source, validation gates, and known risks.

## Version Rules

- Keep portfolio facts in `src/data/portfolio.ts`.
- Keep design and interaction rules in `DESIGN.md`.
- Do not publish private resume docs, phone numbers, secrets, `.env.local`, or
  generated build output.
- Run the full local gate before publishing: `npm run lint`,
  `npm run typecheck`, `npm test`, `npm run build`, and Browser QA at desktop
  plus 390px and 320px mobile widths.
- Prefer small versioned commits over broad rewrites.

## v0.1 - Static Portfolio Foundation

- Commit: `7333102`
- Purpose: establish a dark, Ambrosino-inspired static Next.js portfolio with
  structured local content, design-system documentation, and browser QA.
- Source: project prompt, Ambrosino reference, local implementation.
- Validation: lint, typecheck, tests, production build, Browser QA, sub-agent
  design audit, sub-agent final review.
- Result: complete locally; GitHub publishing blocked by missing remote and
  invalid local GitHub CLI auth.

## v0.2 - Resume-Grounded Practical Portfolio

- Commit: recorded by the `Tailor portfolio for practical longevity` commit.
- Purpose: align the content with the current resume while keeping public
  surfaces concise, privacy-safe, and easy to maintain.
- Source: current resume document in Google Drive, filtered into public-safe
  structured data.
- Changes:
  - Replace placeholder roles with OpenAI, Docusign, IBM, Esri, education, and
    personal systems entries.
  - Add a compact Impact section for metric-led proof points.
  - Update skills around GTM operations, analytics, automation, and AI systems.
  - Keep phone number and private Google Doc URLs out of the public site.
- Validation: passed `npm run lint`, `npm run typecheck`, `npm test`,
  `npm run build`, and Browser QA at 1280x900, 390x844, and 320x780.
- Result: complete locally; GitHub publishing depends on a valid GitHub remote
  and refreshed CLI authentication.

## v0.3 - Agents SDK Chat and Logo Dock

- Purpose: make the OpenAI Agents SDK assistant visible in the portfolio UI and
  bring timeline marks closer to the Ambrosino reference with compact logo
  assets.
- Source: current repo implementation, OpenAI Agents SDK docs, Ambrosino public
  reference HTML.
- Changes:
  - Add `src/components/PortfolioChat.tsx` as the bottom-dock AI Chat control
    and panel backed by `/api/agent`.
  - Replace timeline text badges with local SVG logo assets under
    `public/img/logos/`.
  - Keep the server-side portfolio agent on `@openai/agents` with a grounded
    `portfolio_snapshot` tool.
- Validation: passed `npm test`, `npm run typecheck`, `npm run lint`,
  `npm run build`, and IntelliJ inspections for the changed TypeScript files;
  local preview at `http://127.0.0.1:3000/` returned 200 and `/api/agent`
  returned a live answer with local `.env.local`.
- Publish hygiene: local `.ai/`, `.claude/`, Copilot prompt scratch files, and
  `.env.local` are ignored; `.env.example` documents the optional key.
- Remaining QA: browser screenshot verification was not run in this session
  because no Browser/agent-browser control tool was exposed and Playwright is
  not installed in the project.

## v1.0 - Public Launch Candidate

- Purpose: publish a durable first public version.
- Required before launch:
  - Confirm email, LinkedIn, GitHub, company references, dates, and metrics.
  - Configure `OPENAI_API_KEY` in the deployment environment if the AI chat
    should be enabled publicly; otherwise the endpoint returns a 503
    configuration response.
  - Replace generic GitHub links with live repo/project links once available.
  - Add a downloadable public resume only if it is intentionally sanitized.
  - Re-run all validation gates and update this file with the launch commit.
