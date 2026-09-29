# Personal Portfolio

Dark, editorial portfolio for Miles Chu. The site uses the compact information
architecture of `ambrosino.io`: a narrow centered column, timeline sections,
muted metadata, hairline dividers, metric-led proof points, company logo marks,
and a fixed bottom link dock with an AI chat control.

## Development

Run commands from this directory:

```bash
npm install
npm run dev
```

Useful checks:

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

Local development intentionally uses Next.js webpack because Turbopack dev
currently panics while resolving the installed Next.js package in this
checkout. Production still uses the default Turbopack build, so UI changes
must pass both a live `npm run dev` check and `npm run build`.

Copy `.env.example` to `.env.local` and set `OPENAI_API_KEY` only when testing
the optional portfolio agent locally. Set `CHAT_ENABLED=false` to keep the
chat endpoint offline without removing the UI.

## Content

Portfolio content lives in `src/data/portfolio.ts`. Edit the structured arrays
there to update the homepage sections without touching layout code.

## Agent API

`POST /api/agent` runs the OpenAI Agents SDK portfolio assistant. Send JSON
with a `question` string:

```bash
curl -X POST http://localhost:3000/api/agent \
  -H 'content-type: application/json' \
  -d '{"question":"What kind of work does Miles do?"}'
```

The route reads `OPENAI_API_KEY` from the server environment. Keep it in an
ignored local env file such as `.env.local`; without a key, the route returns a
503 configuration response instead of calling the SDK.

The original plain-text agent endpoint remains available for rollback. The
bottom dock now uses ChatKit through `/api/chatkit`. This earlier route validates JSON bodies, caps
question length, rejects cross-site browser posts, applies a bounded
per-instance rate limit, and caps model output tokens before calling the SDK.
Use Vercel spend limits or a shared external rate-limit store if the public
launch needs a hard account-wide request budget.

## Deployment

Absolute URLs in metadata, the sitemap, and robots derive from
`NEXT_PUBLIC_SITE_URL` when set, then fall back to Vercel's
`VERCEL_PROJECT_PRODUCTION_URL`, then `http://localhost:3000`. No extra
configuration is needed on Vercel; attaching a custom domain updates the
production URL automatically.

Design rules live in `DESIGN.md`. Version acceptance gates and release notes
live in `CHECKPOINTS.md`.

## ChatKit

The dock uses OpenAI's ChatKit UI with the official Python server SDK. The
same-origin Next.js route at `/api/chatkit` authenticates an anonymous visitor
with a signed HttpOnly cookie and streams the private Python service's reply.
Each visitor can access only their own conversations. Threads expire after
24 hours; uploads, external actions, and feedback are disabled. The backend
limits generation to eight questions per visitor per minute and 120 overall
per minute. These are request limits, not a monetary account budget.

All assistant facts come from `src/data/portfolio.ts`. Run
`npm run export:chatkit` after changing public content. The generated
`backend/portfolio.json` is checked for freshness before tests and builds.

Install Python dependencies in an isolated environment, then launch both
services locally:

```bash
cd backend
uv venv --python 3.12 .venv
uv pip sync --python .venv/bin/python requirements.lock
cd ..
npm run dev:chatkit
```

The preview uses `http://127.0.0.1:4173`, with the backend on loopback port
8001. The launcher reads existing local environment configuration and supplies
an ephemeral backend token without saving it. Local conversations use SQLite
under the ignored `backend/.local/` directory. `CHATKIT_DEV_WEB_PORT` and
`CHATKIT_DEV_API_PORT` can select unused ports.

Vercel Services builds Next.js and FastAPI together. Only the Next.js service
is publicly routed; its service binding supplies `CHATKIT_BACKEND_URL`.
Before deployment, configure a PostgreSQL `DATABASE_URL`, a random
`CHATKIT_BACKEND_TOKEN` of at least 32 characters, the existing server-side
`OPENAI_API_KEY`, and the public `NEXT_PUBLIC_CHATKIT_DOMAIN_KEY` registered
for milesdchu.com. Only the owner edits local `.env` files. Production rejects
SQLite or incomplete configuration, and the UI shows an unavailable state if
the domain key is absent. API credits must be available for live answers.
`CHAT_ENABLED=false` disables both chat routes.

Backend checks use disposable fixtures and never make model requests:

```bash
backend/.venv/bin/python -m pytest backend/tests
```

The earlier `/api/agent` endpoint remains available for rollback. Vercel
service routing and PostgreSQL persistence require a separate deployment
verification; a successful Next.js build does not prove that deployment.
