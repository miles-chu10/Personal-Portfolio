# Repository Guidelines

## Project Structure & Module Organization

This repository is a Next.js (App Router, React 19) personal portfolio site styled with Tailwind CSS v4. `IDEA.md` contains the product note: showcase work experience and skillsets. Application code lives under `src/app`, reusable client components under `src/components` (e.g. `PortfolioChat.tsx`), shared server logic under `src/lib` (e.g. `portfolio-agent.ts`), structured portfolio content under `src/data` (`portfolio.ts` exports typed arrays like `latest`, `impactRows`, `skillRows`), static assets under `public` (company logos in `public/img/logos`), and tests beside source files as `*.test.ts[x]`. Import internal modules with the `@/` path alias (e.g. `@/data/portfolio`). The homepage chat dock posts to the `POST /api/agent` route (`src/app/api/agent/route.ts`), which runs the OpenAI Agents SDK assistant in `src/lib/portfolio-agent.ts`. Design rules live in `DESIGN.md`; version acceptance gates and release notes live in `CHECKPOINTS.md`. Keep project-specific docs in this repo root, and do not modify sibling projects in `/Users/mileschu/code`.

## Build, Test, and Development Commands

- `npm run dev`: start the local development server.
- `npm run build`: create a production build.
- `npm run start`: serve the production build.
- `npm run lint`: run ESLint (`eslint-config-next`, configured in `eslint.config.mjs`).
- `npm run typecheck`: run TypeScript without emitting files.
- `npm test`: run automated tests (`node --test --import tsx`).

Run commands from `/Users/mileschu/code/Personal-Portfolio`, not the workspace root.

## Coding Style & Naming Conventions

Prefer TypeScript for new code. Use 2-space indentation, LF line endings, UTF-8, and concise components or functions. Name React components in PascalCase, such as `ExperienceTimeline.tsx`; name hooks in camelCase with a `use` prefix; and name assets with lowercase kebab-case, such as `profile-headshot.webp`. Run `npm run lint` and `npm run typecheck` before committing.

## Testing Guidelines

Tests use Node's built-in test runner with `tsx` for TypeScript execution. Use `*.test.ts` or `*.test.tsx` for unit and component tests, and reserve `*.spec.ts` for browser or end-to-end flows. Import `describe`/`it` from `node:test` and assertions from `node:assert/strict` (see `src/app/api/agent/route.test.ts`). When a test mutates `process.env` (e.g. `OPENAI_API_KEY`), restore the original value in a `finally` block. Cover portfolio data rendering, navigation, responsive layout, and any contact or download flows.

## Commit & Pull Request Guidelines

Existing history uses short, imperative, sentence-style subjects such as `Prepare portfolio for first publish` or `Add portfolio design system and QA workflow`. Conventional prefixes (`feat:`, `docs:`) are also acceptable. Pull requests should describe the change, list verification performed, link related issues, and include screenshots for visual changes.

## Security & Configuration

Do not commit secrets, `.env.local`, analytics tokens, or generated build output. The agent route reads `OPENAI_API_KEY` from the server environment; copy `.env.example` to `.env.local` and set the key only when testing the portfolio agent locally. Without a key, `POST /api/agent` intentionally returns a `503` configuration response instead of calling the SDK (covered by `route.test.ts`).

Before changing OpenAI Agents SDK, OpenAI API, model, or streaming behavior, use the OpenAI Developers docs surfaces and match the current SDK/API signatures. Before changing Vercel deployment, environment-variable, or Next.js hosting behavior, use the Vercel docs/plugin surfaces and confirm the local Vercel CLI is current.
