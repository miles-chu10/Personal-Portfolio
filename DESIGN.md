# Personal Portfolio Design System

This document is the source of truth for the current portfolio UI. It describes
the Ambrosino-inspired portfolio implemented in `src/app/page.tsx`,
`src/components/PortfolioChat.tsx`, `src/app/globals.css`, and
`src/data/portfolio.ts`.

Use `CHECKPOINTS.md` to record version-level acceptance gates after each
meaningful website iteration.

## Checkpoints

- [x] Confirmed repo state and moved work to `codex/design-doc-and-qa`.
- [x] Read current OpenAI developer frontend guidance for structured workflow,
      design consistency, accessibility, and validation.
- [x] Checked Figma availability: authenticated as Miles Chu on a Starter/view
      seat, but metadata inspection is blocked by the Figma MCP Starter call
      limit.
- [x] Checked MagicPath availability: CLI `2.4.3` is installed, but the user is
      not authenticated.
- [x] Complete sub-agent design audit.
- [x] Run lint, typecheck, tests, and production build.
- [x] Verify desktop and mobile render in Browser.
- [x] Complete final sub-agent review before commit and GitHub push.

## Design Source

The active source of truth is the current Next.js implementation plus the
Ambrosino reference shown in the project prompt. Figma and MagicPath are not
authoritative for this pass because neither produced usable node-level design
context in this session.

Use the Ambrosino reference as an information-architecture model, not as a
literal clone. Preserve the narrow column, dark editorial surface, muted
metadata, compact row hierarchy, hairline dividers, and fixed bottom link dock.
Use Miles-specific content and avoid copying third-party copy, marks, or
employment claims.

Intentional divergences from the reference:

- Timeline logos are local compact SVG assets, not hotlinked reference assets.
- The site uses a system sans stack, not a custom font pairing.
- The reference licenses/press mix is replaced by Miles-specific `Skills` and
  `Misc` sections.

## Principles

- Make the first viewport the portfolio itself, not a marketing landing page.
- Keep the page quiet, scannable, and resume-like: no hero card, nested cards,
  decorative blobs, bokeh, large gradients, or explanatory product text.
- Use structured data for content. Layout code should not contain portfolio
  facts beyond component labels and section headings.
- Favor stable dimensions and predictable grids so long names, dates, and link
  labels do not resize the layout.
- Keep all public-facing content easy to revise before publication; verify
  personal email, social URLs, company references, and role language before
  shipping a production domain.
- Derive public content from resume/source material, but filter out phone
  numbers, private document URLs, and any detail that should not be indexed.

## Tokens

| Token | Value | Usage |
| --- | --- | --- |
| `--background` | `#080808` | Page surface and footer fade |
| `--foreground` | `#f4f4f5` | Primary text and active links |
| `--muted` | `#8a8a8f` | Section headings, dates, secondary copy |
| `--subtle` | `#66666b` | Low-emphasis metadata |
| `--line` | `#18181b` | Default row dividers |
| `--line-strong` | `#27272a` | Hover row divider |
| `--focus` | `#d4d4d8` | Keyboard focus outline |
| `--font-sans-system` | system UI stack | All typography |

The palette should remain near-neutral and dark. Accent color belongs only in
small logo assets and interaction states; do not expand accent colors into page
backgrounds, cards, gradients, or large decorative surfaces.

## Typography

- Use the system sans stack defined in `--font-sans-system`.
- H1: `1.85rem`, `600`, tight line height; at `sm`, `2rem`.
- Body rows and section headings: `0.95rem`, `1.25rem` line height.
- Subtitle: `0.96rem`, muted, one compact line when space allows.
- Letter spacing stays at the browser default. Do not use viewport-scaled type.

## Layout

The page shell is a single centered column:

- Max width: `42rem`.
- Horizontal padding: `1rem` mobile, `1.5rem` at `sm`.
- Top padding: `6rem` mobile, `7rem` at `sm`.
- Bottom padding: `7rem` minimum so the fixed footer dock does not cover final
  content.
- Section spacing: `4rem`.
- Section headings sit `1rem` above their row groups.

Timeline rows use a two-stage grid:

- Mobile: `1.5rem minmax(0, 1fr)` for logo and organization. Role/date pairs
  begin in column two below the organization.
- Desktop: `1.5rem 6.25rem minmax(0, 1fr)` so organization labels align in a
  fixed column and role/date content scans as a table.
- Role rows use `minmax(0, 1fr)` plus a fixed date column of `4.75rem` mobile
  and `5.5rem` desktop.
- Rows have `border-t` dividers and `1rem` vertical padding.

Skills and misc sections follow the same row rhythm:

- Impact: compact metric-led cells in a two-column desktop grid and one-column
  mobile stack.
- Skills: on mobile, label and metadata share the first row while the value
  spans the full row below; at `sm`, label, value, and metadata align into
  three columns.
- Misc: year, title/source, arrow affordance.
- Keep row text short enough to wrap cleanly without horizontal overflow.

## Footer Dock

The footer dock is a fixed `nav` with `aria-label="Portfolio links"`.

- Keep links compact and icon-like through `shortLabel`; each link must still
  have a descriptive `aria-label`.
- Keep the AI Chat control in the dock as an icon button; the chat panel opens
  above the dock and calls `/api/agent`.
- Preserve the bottom gradient fade so content scrolls behind the dock without
  a hard edge.
- Keep touch targets at least `2rem` high and ensure all links are reachable by
  keyboard focus.
- Use external link behavior only for absolute `http` URLs; hash and `mailto:`
  links stay in the current browsing context.
- During mobile QA, check 320-390px widths for link crowding and iPhone bottom
  inset clipping. Add safe-area padding if clipping appears.

## Content Model

All portfolio facts live in `src/data/portfolio.ts`.

- `profile` drives the header and email link.
- `latest` and `earlier` render timeline sections.
- `impactRows` renders metric-led proof points.
- `skillRows` renders the skills table.
- `miscLinks` renders external writing/project references.
- `footerLinks` renders the fixed dock.

Every timeline item needs an organization, local SVG logo metadata, and at
least one role with a title and period. Prefer short role titles and put
secondary context in `detail` so mobile wrapping remains controlled.

## Accessibility And Interaction

- Keep semantic regions: `main`, `header`, `section`, `article`, and `nav`.
- Every section heading must be connected with `aria-labelledby`.
- Link-only controls need either visible text or a clear `aria-label`.
- Preserve `focus-visible` outlines and reduced-motion handling.
- Hover effects should be subtle: divider strengthening, text color change, or
  the misc arrow shifting by at most `0.125rem`.
- Agent responses should stay plain text unless a markdown renderer is added to
  the chat component.
- Validate that mobile and desktop have no horizontal overflow and no text
  overlap before shipping.

## QA Evidence

Update this section after every meaningful visual or content-system change.

| Check | Status | Notes |
| --- | --- | --- |
| Sub-agent design audit | Passed | Ohm confirmed the core layout matches the reference pattern and noted v1 gaps above. |
| `npm run lint` | Passed | ESLint completed without findings after the logo and chat update. |
| `npm run typecheck` | Passed | `tsc --noEmit` completed successfully after fixing chat response narrowing. |
| `npm test` | Passed | 11 tests passed across portfolio data, agent config, route validation, and missing-key handling. |
| `npm run build` | Passed | Next.js production build passed; sandbox run was blocked by Turbopack port binding, escalated run passed. |
| Local HTTP preview | Passed | Existing dev server at `http://127.0.0.1:3000/` returned 200 with logo SVG paths and the AI chat dock button; `/api/agent` returned a live answer with local `.env.local`. |
| IntelliJ inspections | Passed | No IDE problems reported for the agent route, agent tests, chat component, or agent helper after cleanup. |
| Browser desktop/mobile | Not run this pass | Browser plugin was not exposed and Playwright is not installed in the project. Earlier static-v1 Browser QA covered 1280x900, 390x844, and 320x780 before this chat/logo iteration. |
| Final review | Passed with caveat | Publish hygiene reviewed; visual screenshot QA still needs a browser tool before public launch. |

## Known Gaps

- Figma source could not be inspected because the connected account hit the
  Starter MCP tool-call limit. Re-run the Figma workflow with a node-specific
  URL after the limit resets or the plan changes.
- MagicPath is available through the CLI but unauthenticated. Run
  `npx -y magicpath-ai login` before making MagicPath authoritative.
- Confirm `profile.email`, LinkedIn, GitHub, misc URLs, and any company
  references before publishing to a public domain.
