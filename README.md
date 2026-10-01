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

## Browser annotations and owner site tools

The homepage uses the documented Browser Annotation API HTML attributes for
individual Work, Impact, and Skills rows, plus text selection in the profile
header. These enhance the browser's own annotation mode without adding a public
editing interface or storing feedback. Unsupported browsers render normally.
No private metadata or annotation preview controls are attached.

WebMCP integration is prepared but **disabled for everyone, including Miles**.
This repository has no owner sign-in; its anonymous ChatKit visitor cookie is
not owner authentication. `/api/owner/site-tools` returns `403` with `no-store`
for both discovery and execution. No environment flag can enable it.

Before enabling, choose and approve an owner sign-in provider, verify the
session on the server against Miles's stable provider user ID, and authorize
every operation. Check expiry/revocation and same-origin requests there.
Do not replace the denial with a client email, hostname, query parameter,
local-storage flag, or the ChatKit cookie. The prepared client checks access
before registration and before every tool execution, aborts registrations on
denial/unmount, and exposes only section text inspection and local scrolling.
It cannot edit content, deploy, access chat history, or call a model.

Contracts: [Annotations Extensibility](https://learn.chatgpt.com/docs/annotations-extensibility),
[Site tools](https://learn.chatgpt.com/docs/webmcp), and the
[WebMCP draft](https://webmachinelearning.github.io/webmcp/).
Actual host discovery, annotation selection, and revocation still require
verification in ChatGPT's built-in browser; simulated API tests do not prove
host compatibility.

The repository-source dock link is removed; the professional GitHub profile
link remains. Link removal does not restrict repository access. Repository
visibility is managed separately in GitHub.

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

Failures that happen before the first token (for example exhausted OpenAI
credits) return a JSON `503`, `429` or `500` so the chat panel can show its
offline copy; only a failure after streaming has started breaks the stream.
Set `CHAT_ENABLED` to `false`, `0`, `off` or `no` (any case) to take the chat
offline. On Vercel a changed environment variable only applies to new
deployments, so redeploy after changing it.

Agents SDK tracing is off by default because it would store every visitor
question and answer in the OpenAI traces dashboard. Set `AGENT_TRACING=true` to
turn it on for debugging (and consider telling visitors).

## Deployment

Absolute URLs in metadata, the sitemap, robots, and JSON-LD are computed at
build time by `src/lib/site.ts`: `NEXT_PUBLIC_SITE_URL` when set, then Vercel's
`VERCEL_PROJECT_PRODUCTION_URL`, then `http://localhost:3000`. Set
`NEXT_PUBLIC_SITE_URL=https://milesdchu.com` in the Vercel Production
environment and redeploy after changing it or the domain, because the values
are baked into the build. After each production deploy run
`npm run smoke:live` (it defaults to `https://milesdchu.com`; pass another
origin as the first argument).

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
