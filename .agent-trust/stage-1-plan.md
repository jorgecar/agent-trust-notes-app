# Stage 1 plan: One agent that checks itself

Status: waiting for a yes. Nothing below is applied. No file other than this plan was changed.
Repository: `jorgecar/agent-trust-notes-app`, branch `agent-trust/stage-1`. Skill version 0.3.0.

## Why stage 1

`.agent-trust/state.json` has stage 0 with gate `pending-settings`. The person ran `github-readback.mjs` for stage 0 and it printed `SETTINGS MATCH`, so the settings part is done. The remaining condition in the stage 0 notes is "the first labelled change appears after its merge", and the notes say the stage 1 pull request will be that change. Waiting for that merge before starting stage 1 would never end, so stage 1 proceeds. The stage 0 gate stays `pending-settings` in `state.json` until a labelled change is merged. This plan does not touch the stage 0 entry.

## Detected project

- TypeScript 6 (`typescript ^6.0.3`), ESM (`"type": "module"`), `strict` and `noUncheckedIndexedAccess` (`tsconfig.json`). Node >= 22 (`package.json` engines).
- Express 4 REST API (`src/app.ts`) with a plain browser UI in `public/` (`public/app.js`, `public/index.html`). npm as the package manager.
- Unit tests: Vitest (`test/notes.test.ts`). API/integration tests: Vitest with supertest (`test/app.test.ts`). Browser tests: Playwright (`e2e/notes.spec.ts`, `playwright.config.ts` starts the app with `webServer` on port 3100).
- Type check: `npm run typecheck` (`tsc --noEmit`). No linter, no formatter, no architecture rule tool.
- No lockfile: there is no `package-lock.json` and `.gitignore` does not exclude one.
- CI: only `.github/workflows/metrics.yml` (job `metrics`). No job named `check`.
- Instruction files: `AGENTS.md` (has the stage 0 "Agent trust" section) and `CLAUDE.md` containing `@AGENTS.md`.
- Remote: `origin` is `jorgecar/agent-trust-notes-app` on GitHub.
- Reference setup: `references/node-typescript.md`.

## Comparison with the requirements

| # | Requirement | Status | Evidence |
|---|---|---|---|
| 1 | One check command, exit 0 only if all pass, one name per check | missing | `package.json` scripts have `typecheck`, `test`, `e2e` but no `check`, and no `scripts/` folder |
| 2 | Covers types, lint and format, unit, integration, architecture, framework checks | partly met | Types (`typecheck`), unit and integration (`test`) exist. Lint, format and architecture rules are missing. Framework config validation: none applies (no Express config to validate), to be stated in the proof |
| 3 | Agent can drive the real app | met | `e2e/notes.spec.ts` plus `playwright.config.ts` `webServer` run the app in Chromium. `test/app.test.ts` also drives the API with supertest |
| 4 | Fast enough, run time written down | missing | Never measured. Will be measured in step 6 and written in the proof file |
| 5 | Lockfile committed, `npm ci` works | missing | `ls` shows no `package-lock.json` |
| 6 | Same command in CI as a job named `check` | missing | Only the `metrics` workflow exists |
| 7 | Agent cannot weaken it: instruction file names the command, says done only when it passes, lists the check files | missing | `AGENTS.md` has only the stage 0 labelling rules |
| 8 | Instruction file tells the agent to paste the summary lines as evidence | missing | same |

## 1. File changes

| File | Change | Requirement |
|---|---|---|
| `scripts/check.mjs` | New. The one check command, adapted from the reference: runs `typecheck`, `lint`, `deps`, `unit`, `e2e` by name, prints one `PASS` or `FAIL` line each with its time, then `CHECK PASS` or `CHECK FAIL (n of m)`, exits 0 only if all pass. `node scripts/check.mjs lint` runs one check. The project already splits tests into `test/` (unit and API) and `e2e/`, so `unit` runs `vitest run` and `e2e` runs `playwright test`. | 1, 2, 3 |
| `package.json` | Add scripts `check` (`node scripts/check.mjs`), `lint` (`eslint .`), `deps` (`depcruise src`). Add dev dependencies `eslint`, `typescript-eslint`, `@eslint/js`, `dependency-cruiser`. Keep every existing script and tool. | 1, 2 |
| `eslint.config.js` | New. `typescript-eslint` recommended config over `src`, `test`, `e2e`, `scripts`. Browser globals for `public/app.js`. No Prettier: the project has no formatter, so "format" is covered by lint rules only, and this is reported as a partial gap if no formatter rule is added. Decision for the person below. | 2 |
| `.dependency-cruiser.cjs` | New. Rule `domain-stays-pure`: `src/notes.ts` may not import `src/app.ts`, `src/server.ts` or `express`. A second rule: `src` may not import from `test` or `e2e`. | 2 |
| `package-lock.json` | New, from `npm install` run in step 5. Committed so CI can run `npm ci`. | 5 |
| `.github/workflows/check.yml` | New. Triggers: `pull_request` and `push` to `main`. One job named `check` on `ubuntu-latest`: `actions/checkout`, `actions/setup-node` (Node 22, `cache: npm`), `npm ci`, `npx playwright install --with-deps chromium`, `npm run check`. Latest major of each action, matching the versions in `metrics.yml` (checkout v7, setup-node v7), and I will confirm each runs on a supported runtime before writing. `permissions: contents: read`. | 6 |
| `AGENTS.md` | Add the "Stage 1: check your work" section from `templates/agents-section.md`: command `npm run check`, paste the `PASS`/`FAIL` lines and the final `CHECK PASS` line as evidence, and the protected list: `scripts/check.mjs`, `eslint.config.js`, `.dependency-cruiser.cjs`, `vitest.config.ts`, `playwright.config.ts`, `tsconfig.json`, `.github/workflows/check.yml`, `package-lock.json`. `CLAUDE.md` is unchanged (it already imports `AGENTS.md`). The stage 0 section stays as is. | 7, 8 |
| `.gitignore` | No change needed (`node_modules/`, `test-results/`, `playwright-report/` already ignored). | |

No existing test, rule or workflow is removed, skipped or loosened. The existing `typecheck`, `test` and `e2e` scripts are kept.

## 2. GitHub settings

Applied by a person, never by me. The standard stage 1 setting makes the `check` job required before a merge to the default branch. Generated by `github-plan.mjs` for `jorgecar/agent-trust-notes-app`.

Order matters: apply the ruleset only after the `check` job has run once on the stage 1 pull request, so the status name exists. Then merge that pull request, with the `agent` label on it (stage 0 gate).

<!-- The block below is what `node scripts/github-plan.mjs jorgecar/agent-trust-notes-app 1 --out .agent-trust/stage-1-plan.md` appends. I did not run the script in this run, so the command is written by hand in the same format. -->

## GitHub settings for stage 1, for a person to apply

Run each command with an account that administers jorgecar/agent-trust-notes-app. Then run github-readback.mjs.

### Ruleset: the check job must pass before a merge to main

```bash
gh api -X POST repos/jorgecar/agent-trust-notes-app/rulesets --silent --input - <<'JSON'
{
  "name": "agent-trust: required check",
  "target": "branch",
  "enforcement": "active",
  "conditions": { "ref_name": { "include": ["~DEFAULT_BRANCH"], "exclude": [] } },
  "rules": [
    { "type": "required_status_checks",
      "parameters": { "strict_required_status_checks_policy": false,
                      "required_status_checks": [{ "context": "check" }] } }
  ]
}
JSON
```

Requirements met: 6 (the `check` job is enforced), 7 (the agent cannot merge past a failing check).

## 3. Proof (step 6)

Written to `.agent-trust/stage-1-proof.md`.

1. Run `npm ci` from the new lockfile, then `npm run check`. It must end with `CHECK PASS`. Record per-check times and the total (requirement 4).
2. One break per check, each restored and re-run to pass:
   - `typecheck`: assign a string to a number-typed variable in `src/notes.ts`.
   - `lint`: add an unused variable or an `any` that the rule set forbids in `src/app.ts`.
   - `deps`: import `express` in `src/notes.ts`.
   - `unit`: change the trim in `NoteStore.create` so `test/notes.test.ts` fails.
   - `e2e`: in `public/app.js`, render note text with `innerHTML` instead of `textContent`, then the `<img onerror>` test must fail (the reference's break).
   - Each break must fail only its own check. Where a break also trips another check (the `innerHTML` one may trip lint), I will say so and choose a cleaner break.
3. Run one check alone with `node scripts/check.mjs lint` to prove requirement 1.
4. Prove that `check.mjs` itself fails: make a check command exit 1 and confirm `CHECK FAIL` and exit code 1.
5. CI: push is not allowed in this run, so the `check` job's first run happens on the pull request. I will record "CI run pending: no push by the agent". A person must confirm the job is named `check` in the run list.
6. A fresh agent reviews with `agents/setup-reviewer.md`. Verdict and findings appended to the proof file.

## Open decisions for the person (one yes or no each)

1. Should I add a formatter (Prettier) so the "lint and format" requirement is fully met? My recommendation: no, use ESLint only and record the formatter as not done, since the project has none and the skill says to add a tool only when no existing one covers the need. It does not cover format today, so this is a real gap, and I lean toward yes with Prettier in check-only mode if you want it complete.
2. Is the protected-file list above right, especially `package-lock.json` and `tsconfig.json`?

## Not met after this plan (to report in the hand-over)

- Stage 0 gate remains `pending-settings` until a labelled change is merged.
- CI run of `check` and the ruleset cannot be proven by me (no push, no token).
- Requirement 2 "framework checks": none exist for this stack.
