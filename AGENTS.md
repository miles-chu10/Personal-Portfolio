# Repository Guidelines

## Project Structure & Module Organization

This repository is a Next.js personal portfolio site. `IDEA.md` contains the product note: showcase work experience and skillsets. Application code lives under `src/app`, structured portfolio content lives under `src/data`, static assets live under `public`, and tests sit beside source files as `*.test.ts[x]`. Keep project-specific docs in this repo root, and do not modify sibling projects in `/Users/mileschu/code`.

## Build, Test, and Development Commands

- `npm run dev`: start the local development server.
- `npm run build`: create a production build.
- `npm run lint`: run ESLint.
- `npm run typecheck`: run TypeScript without emitting files.
- `npm test`: run automated tests.

Run commands from `/Users/mileschu/code/Personal-Portfolio`, not the workspace root.

## Coding Style & Naming Conventions

Prefer TypeScript for new code. Use 2-space indentation, LF line endings, UTF-8, and concise components or functions. Name React components in PascalCase, such as `ExperienceTimeline.tsx`; name hooks in camelCase with a `use` prefix; and name assets with lowercase kebab-case, such as `profile-headshot.webp`. Follow the project formatter and linter once they are added.

## Testing Guidelines

Tests use Node's built-in test runner with `tsx` for TypeScript execution. Use `*.test.ts` or `*.test.tsx` for unit and component tests, and reserve `*.spec.ts` for browser or end-to-end flows. Cover portfolio data rendering, navigation, responsive layout, and any contact or download flows.

## Commit & Pull Request Guidelines

This Git workspace has no commits yet, so there is no local convention to inherit. Use short imperative subjects, optionally scoped, such as `feat: add experience section` or `docs: update contributor guide`. Pull requests should describe the change, list verification performed, link related issues, and include screenshots for visual changes.

## Security & Configuration

Do not commit secrets, `.env.local`, analytics tokens, or generated build output. Document required environment variables in `.env.example` once they exist.
