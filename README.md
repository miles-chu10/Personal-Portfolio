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

The homepage chat control in the bottom dock calls this route from
`src/components/PortfolioChat.tsx`. The route validates JSON bodies, caps
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
