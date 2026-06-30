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

## v1.0 - Public Launch Candidate

- Purpose: publish a durable first public version.
- Required before launch:
  - Confirm email, LinkedIn, GitHub, company references, dates, and metrics.
  - Replace generic GitHub links with live repo/project links once available.
  - Add a downloadable public resume only if it is intentionally sanitized.
  - Re-run all validation gates and update this file with the launch commit.
