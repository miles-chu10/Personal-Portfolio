# Website Checkpoints

This file tracks practical website versions. Each version should ship with a
clear purpose, content source, validation gates, and known risks.

## Version Rules

- Keep portfolio facts in `src/data/portfolio.ts`.
- Keep design and interaction rules in `DESIGN.md`.
- Do not publish secrets, `.env.local`, private working docs, or generated
  build output. Exception by owner decision (2026-07-03): the public resume
  PDF intentionally includes Miles's phone number for direct recruiter
  contact.
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

## v0.4 - Streaming Chat and Editorial Touch-Up

- Purpose: polish the existing dark editorial portfolio while upgrading the
  OpenAI Agents SDK assistant to stream plain-text answers.
- Source: current repo implementation, z.ai export used only as visual
  reference, installed `@openai/agents` stream types, local ChatGPT/Codex app
  icon assets.
- Changes:
  - Switch successful `POST /api/agent` responses to a UTF-8 text stream backed
    by `run(agent, input, { stream: true })` and `toTextStream()`.
  - Add submitted, streaming, empty, error, retry, clear, keyboard submit, and
    close states to `PortfolioChat`.
  - Replace the hand-drawn chat mark with the local ChatGPT app icon and add a
    small Codex icon badge in the chat header.
  - Tighten timeline date rhythm with tabular numerals, fixed date columns, and
    stable hover/focus row states.
  - Improve footer dock affordances with clearer hover/focus targets and
    labels while keeping compact `shortLabel` links.
- Validation: passed `npm run lint`, `npm run typecheck`, `npm test`, and
  `npm run build`; local HTTP preview returned 200 for `/` and the ChatGPT
  asset; `/api/agent` streamed a live grounded answer with local `.env.local`.
- Browser QA: headless Chrome verified 1280x900, 390x844, and 320x780 with the
  chat panel open; no horizontal overflow, no footer/chat overlap, and brand
  images loaded. Screenshots are in `/private/tmp/portfolio-*-chat-open.png`.
- Figma artifact: created
  `https://www.figma.com/design/GSK3DLtmt9S9IsFSvlHpam`; capture/import was
  blocked by the Figma Starter MCP tool-call limit.

## v0.5 - Pre-Launch Hardening, SEO, and Accessibility

- Purpose: close the launch blockers surfaced by design reviews before buying
  the production domain: API abuse protection, chat dialog accessibility,
  contrast, mobile date overflow, duplicate IBM entry, and missing SEO
  surface.
- Source: current repo implementation, prior sub-agent design reviews, and
  the resume-grounded content shipped in the 2026-07-01 publish session.
- Changes:
  - Harden `POST /api/agent`: reject non-JSON bodies (400), cap question
    length via `MAX_QUESTION_LENGTH` (500), reject cross-site browser posts
    (403), support `CHAT_ENABLED=false`, rate limit per client IP with a
    bounded in-memory sliding window (429, `src/lib/rate-limit.ts`), cap agent
    output with `MAX_AGENT_OUTPUT_TOKENS`, and export `maxDuration`.
  - Make the chat panel a keyboard-accessible `role="dialog"`: focus moves to
    the textarea on open, Escape closes, focus returns to the dock toggle,
    and 503/429 responses render visitor-friendly fallback copy.
  - Raise `--subtle` to `#7a7a80` for 4.5:1 contrast on the page background.
  - Wrap timeline periods with non-breaking spaces so date ranges break only
    at the hyphen inside the fixed date column at 320px.
  - Merge the duplicated IBM entry into a single `Latest` item with three
    roles; `Earlier` now holds Esri and UC Riverside.
  - Add a header contact line (location plus email) under the title.
  - Add launch SEO surface: `metadataBase` derived from
    `NEXT_PUBLIC_SITE_URL` or `VERCEL_PROJECT_PRODUCTION_URL`, canonical,
    Open Graph and Twitter cards, generated OG image and apple icon,
    `robots.txt`, `sitemap.xml`, JSON-LD Person schema, and theme color.
  - Add security headers in `next.config.ts` plus on-brand `error.tsx` and
    `not-found.tsx` pages.
  - Pass the request `AbortSignal` through to the Agents SDK run so a closed
    tab stops token generation; log non-abort mid-stream failures from
    `src/lib/text-stream.ts` (previously silent).
  - Replace 190KB/155KB 512px brand PNGs with 6KB/5KB 64px versions
    (rendered at 20px and below).
  - Add `manifest.ts` plus a generated 512px `icon.tsx`; move streaming
    announcements to a screen-reader-only `role="status"` element instead of
    a token-by-token `aria-live` message list.
  - Keep chat controls focusable while busy, restore focus after submit/retry/
    clear, make the transcript scroll area keyboard-focusable, preserve partial
    streamed answers on interruption, and keep the chat toggle in the footer
    dock flow.
  - Add a GitHub Actions CI workflow running lint, typecheck, tests, and
    build.
- Validation: `npm run lint`, `npm run typecheck`, `npm test` (28 tests),
  `npm run build`; endpoint checks for headers, robots, sitemap, OG image,
  404, API validation branches, cross-site rejection, and `CHAT_ENABLED=false`;
  in-app Browser QA at 1280x720, 390x844, and 320x780 with the chat panel open
  (no horizontal overflow, no console errors); dialog submit/clear/Escape focus
  verification against the offline endpoint.
- Result: complete locally on branch `touch-ups`; deploy to the existing
  Vercel project after commit to refresh the live preview.

## v0.6 - Post-Merge Review Fixes and Resume Alignment

- Purpose: close the PR #1 automated review findings that landed at/after the
  merge and align public content with the current resume before the domain
  purchase.
- Source: PR #1 Copilot and Codex review comments, resume PDF recovered from
  git history, prior checkpoint rules.
- Changes:
  - Keep the public resume PDF and its dock download link: Miles reviewed the
    P1 review finding about the embedded phone number and chose to publish
    the resume as-is for direct recruiter contact (rule exception above).
  - Point the JSON-LD Person `sameAs` at `socialLinks` (LinkedIn, GitHub) and
    add `alumniOf` plus a curated `knowsAbout` list.
  - Remove the unused Geist font wiring (system sans stack per DESIGN.md) and
    the spurious Expo `app.json`.
  - Rewrite Impact rows in Google XYZ form with resume-exact metrics; add
    `$1.5B+` global pipeline framework and `220+` AI workflow users rows
    (8 rows total).
  - Align ATS keywords: meta description says "GTM strategy", certifications
    spelled in full, and Statsig GTM readiness plus human-in-the-loop review
    now appear in crawlable text.
- Validation: `npm run lint`, `npm run typecheck`, `npm test` (28 tests),
  `npm run build`; browser QA at 1280x800, 390x844, and 320x780 with no
  horizontal overflow and no console errors; logo render, JSON-LD contents,
  and chat dialog open/Escape/focus-return verified in the browser.
- Result: merged to main from `claude/zen-jang-1425cc`; the production
  redeploy refreshes the live site ahead of the domain purchase.

## v1.0 - Public Launch Candidate

- Purpose: publish a durable first public version.
- Required before launch:
  - Confirm email, LinkedIn, GitHub, company references, dates, and metrics.
  - Configure `OPENAI_API_KEY` in the deployment environment if the AI chat
    should be enabled publicly; otherwise the endpoint returns a 503
    configuration response.
  - Configure Vercel/OpenAI spend controls or a shared external limiter before
    treating chat rate limits as a hard account-wide budget.
  - Replace generic GitHub links with live repo/project links once available.
  - Add a downloadable public resume only if it is intentionally sanitized.
  - Re-run all validation gates and update this file with the launch commit.
