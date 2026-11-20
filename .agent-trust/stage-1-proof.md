# Stage 1 proof

Date: 2026-11-20. Skill version 0.3.0. Node v22.23.5, npm 10.9.9, macOS. Plan: `.agent-trust/stage-1-plan.md` (approved).

## Passing run

`npm ci` from the committed `package-lock.json` (after deleting `node_modules`) succeeded, so requirement 5 holds.

`npm run check`, clean run after `npm ci`:

```
PASS  typecheck  1.7s
PASS  lint       3.8s
PASS  deps       2.1s
PASS  unit       2.4s
PASS  e2e        4.6s
CHECK PASS
```

Run time (requirement 4): 14.8 s wall time on a cold run after `npm ci`; 7.6 s to 8 s on warm runs (checks add up to about 6 s). Fast enough to run on every task. CI time is not measured (no push).

## Breaks, one per check

Each break was made alone, `npm run check` was run, the file was restored from a copy, and the full check was run again to pass. Only the broken check failed in every case.

| Check | Break | Result |
|---|---|---|
| typecheck | Appended `export const bad: number = "x";` to `src/notes.ts` | `FAIL typecheck`; `src/notes.ts(43,14): error TS2322: Type 'string' is not assignable to type 'number'.`; `CHECK FAIL (1 of 5)`; the other four PASS |
| lint | Appended `export const loose: any = 1;` to `src/app.ts` | `FAIL lint`; `51:21 error Unexpected any. Specify a different type @typescript-eslint/no-explicit-any`; `CHECK FAIL (1 of 5)`; the other four PASS |
| deps | Appended `import express from "express"; export const e = express;` to `src/notes.ts` | `FAIL deps`; `error domain-stays-pure: src/notes.ts → node_modules/express/index.js`; `CHECK FAIL (1 of 5)`; the other four PASS |
| unit | In `src/notes.ts`, `input.text.trim()` became `input.text` | `FAIL unit`; `AssertionError: expected { id: '1', author: 'Ada', …(2) } to deeply equal …` and `expected function to throw an error, but it didn't`; `CHECK FAIL (1 of 5)`; the other four PASS |
| e2e | In `public/app.js`, rendered the note text with `insertAdjacentHTML` instead of a text node | `FAIL e2e`; `Expected substring: "<img src=x onerror=\"alert(1)\">"` / `Received string: "Mallory: Ada: Buy milk"` in the "never run as HTML" test; `CHECK FAIL (1 of 5)`; the other four PASS. The reference's `innerHTML` break was adapted to the markup of this file. |

## The check command itself

- Exit code on failure: with the typecheck break, `node scripts/check.mjs typecheck` exited 1. (In the first loop of breaks, the exit code was lost by a pipe in my shell function; the e2e break run directly printed `exit=1`, and this run covers the rest.)
- Single check: `node scripts/check.mjs lint` printed `PASS lint` and `CHECK PASS`, exit 0.
- Unknown name: `node scripts/check.mjs nope` printed `CHECK FAIL (unknown check: nope)`, exit 1. This is an addition to the reference script, so a typo cannot pass with zero checks run.
- After every break, the file was restored and `npm run check` ended with `CHECK PASS`. `git status` shows no change to `src/` or `public/`.

## Gaps and notes

- Format: the project has no formatter, so format is not checked. The person decided on ESLint only. Requirement 2 is partly met for that reason. No framework config check applies: Express has no config file to validate.
- CI run pending: no push by the agent. The `check` job in `.github/workflows/check.yml` has not run on GitHub. It uses the action versions of `metrics.yml` (checkout v7, setup-node v7), which the person checked on 2026-11-20. The e2e step needs `npx playwright install --with-deps chromium`, which was not tried here. A person must confirm the job is named `check` in the first run.
- The ruleset (required status check `check`) is a GitHub setting for a person to apply, after the first run of the job. It is in `.agent-trust/stage-1-plan.md`.
- Deviations from the plan: `globals` was added as a dev dependency (needed for ESLint environments). `eslint.config.js` ignores `.claude/` and `.agent-trust/` (vendored skill and metrics scripts) and allows unused arguments that start with `_` (Express error handlers need four arguments; `src/app.ts` already has `_next`). No source file was changed.
- No existing test, rule or workflow was removed, skipped or weakened. No GitHub setting was changed.

Integration tests: the supertest API tests in `test/app.test.ts` run inside the `unit` check (`vitest run`). They have no separate name.

## Fresh review

Reviewed by a fresh agent (general-purpose, with `agents/setup-reviewer.md`). It edited nothing and ran `npm run check` once: all five PASS, exit 0, about 8.5 s.

Verdict: **gate pending settings**.

| # | Requirement | Verdict |
|---|---|---|
| 1 | One check command | met |
| 2 | Covers every kind of check | partly met (no format; integration runs inside `unit`) |
| 3 | Drive the real app | met |
| 4 | Run time written down | met |
| 5 | Lockfile and `npm ci` | partly met (lockfile exists but is not committed yet; `npm ci` not rerun by the reviewer) |
| 6 | CI job `check` | partly met (never run on GitHub) |
| 7 | Agent cannot weaken it | partly met (see finding 1) |
| 8 | Evidence rule | met |

Findings:
1. should fix: `package.json` is not in the protected list, and it holds the script bodies, so an agent could make a check a no-op. Not applied: the person approved the list "as planned". Left for the person to decide (proposal: add `package.json` to the list).
2. should fix: new files are untracked. The person commits them (no commit by the agent).
3. should fix (settings): `check` has never run on GitHub, and the ruleset is not applied. The person opens the pull request, confirms the job name, applies the ruleset, then runs the read-back.
4. nit: integration and format are not named checks. Recorded above.
5. nit: `AGENTS.md` itself is not protected. Stage 3 enforces the list.
6. nit: exit-code evidence on failure is partial. Covered by the typecheck, unknown-name and e2e runs above.
