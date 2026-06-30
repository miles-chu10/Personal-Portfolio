# Personal Portfolio

Dark, editorial portfolio for Miles Chu. The site uses the compact information
architecture of `ambrosino.io`: a narrow centered column, timeline sections,
muted metadata, hairline dividers, metric-led proof points, and a fixed bottom
link dock.

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

## Content

Portfolio content lives in `src/data/portfolio.ts`. Edit the structured arrays
there to update the homepage sections without touching layout code.

Design rules live in `DESIGN.md`. Version acceptance gates and release notes
live in `CHECKPOINTS.md`.
