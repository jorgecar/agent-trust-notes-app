## Agent trust

The team measures how agent work behaves. The metrics are defined in `.agent-trust/metrics.md`.

### Always do

- Before you say a task is done, run `npm run check`. It must print `CHECK PASS`. Paste its summary lines (one `PASS` or `FAIL` line per check, then the final `CHECK` line) as evidence.
- Run one check alone with `node scripts/check.mjs <name>`. The names are `typecheck`, `lint`, `deps`, `unit` and `e2e`.
- Label every pull request you open `agent`.
- End every commit message you write with a `Co-Authored-By` trailer that names you (for example `Co-Authored-By: Claude <noreply@anthropic.com>`).
- Label a pull request `hotfix` when it fixes a bad change that is already on `main`.
- When you find a defect on `main`, open an issue labelled `incident`. Put the number of the pull request that caused it in the body (for example `Caused by #12`).
- A pull request that follows up an incident must reference the incident issue (`#N`) in its title or body.

### Ask first

Stop, write the question in your final message, and make no change for these:

- Adding, removing or upgrading a dependency (any change to `package.json` or `package-lock.json`).
- Adding, removing or renaming a route under `/api/`, even when the task asks for it: a person confirms the API design first.
- Changing the status code or the response shape of an existing route, unless the task asks for exactly that change.

### Never do

- Change these files: `scripts/check.mjs`, `eslint.config.js`, `.dependency-cruiser.cjs`, `vitest.config.ts`, `playwright.config.ts`, `tsconfig.json`, `.github/workflows/check.yml`, `package.json`, `package-lock.json`. If a check blocks you, say so and stop. Do not weaken it.
- Skip, delete or `.skip` a test, or add an ESLint disable comment, to make a check pass.
- Import `express`, `src/app.ts` or `src/server.ts` from `src/notes.ts`.
- Commit `.env` files or secrets.
- Push to `main`.

### Changing this file, a skill or the model

A change to this file, to a skill under `.claude/skills/`, or to the model needs a new eval comparison (see `.agent-trust/evals/README.md`) before it merges.
