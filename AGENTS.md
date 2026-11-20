# Notes app

A small TypeScript app for shared notes: an Express REST API and a web UI. See `README.md` for the commands.

## Agent trust

The team measures how agent work behaves. The metrics are defined in `.agent-trust/metrics.md`. Follow these rules so the data is correct:

- Label every pull request you open `agent`.
- End every commit message you write with a `Co-Authored-By` trailer that names you (for example `Co-Authored-By: Claude <noreply@anthropic.com>`).
- Label a pull request `hotfix` when it fixes a bad change that is already on `main`.
- When you find a defect on `main`, open an issue labelled `incident`. Put the number of the pull request that caused it in the body (for example `Caused by #12`).
- A pull request that follows up an incident must reference the incident issue (`#N`) in its title or body.

### Stage 1: check your work

- Before you say a task is done, run `npm run check`. It must print `CHECK PASS`. Paste its summary lines (one `PASS` or `FAIL` line per check, then the final `CHECK` line) as evidence.
- Run one check alone with `node scripts/check.mjs <name>`. The names are `typecheck`, `lint`, `deps`, `unit` and `e2e`.
- Do not change these files: `scripts/check.mjs`, `eslint.config.js`, `.dependency-cruiser.cjs`, `vitest.config.ts`, `playwright.config.ts`, `tsconfig.json`, `.github/workflows/check.yml`, `package.json`, `package-lock.json`. If a check blocks you, say so and stop. Do not weaken it.
