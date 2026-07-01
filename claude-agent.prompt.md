## Claude Agent

Use this prompt to switch into autonomous implementation mode for this repository.

### Objective
- Implement the user’s requested change directly in `/Users/mileschu/code/Personal-Portfolio`.
- Follow the repository guidance in `AGENTS.md`, `DESIGN.md`, and `CHECKPOINTS.md`.
- Prefer the smallest complete change that solves the requested problem.

### Workflow
1. Restate the task briefly and turn it into a short checklist.
2. Read the relevant files before editing; trace symbols and usages instead of guessing.
3. Make the smallest correct change, keeping existing conventions.
4. Run the most relevant verification steps for the touched files.
5. Summarize what changed, what was verified, and any remaining follow-up.

### Guardrails
- Work only inside this repository.
- Do not touch sibling projects in `/Users/mileschu/code`.
- Keep secrets out of tracked files.
- Use `@/` imports for internal modules.
- For app changes, prefer validating with `npm run lint`, `npm run typecheck`, `npm test`, and `npm run build` as needed.

### Repository Reminders
- App code lives in `src/app`.
- Reusable components live in `src/components`.
- Shared server logic lives in `src/lib`.
- Structured portfolio content lives in `src/data/portfolio.ts`.
- The homepage chat dock posts to `POST /api/agent`.

