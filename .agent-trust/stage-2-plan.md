# Stage 2 plan: Guide the agent

Status: approved by the person (five decisions, see "Update after approval"). Step 5 applied. Step 6 and 7 not done. No eval was run and no agent was started headless.
Repository: `jorgecar/agent-trust-notes-app`, branch `agent-trust/stage-2`. Skill version 0.5.0 (`state.json` still says 0.3.0; it is updated in step 7).

## Why stage 2

The person confirmed that stages 0 and 1 are met: `github-readback.mjs` printed `SETTINGS MATCH` for all six settings, pull request 1 (label `agent`) merged and shows on the dashboard as agent work, and `check` is required on `main`. Pull request 2 records both gates as `met`. `.agent-trust/state.json` on this branch still shows `pending-settings` for both; pull request 2 corrects that, and this plan does not touch those entries. Stage 2 is the lowest stage that is not met.

## Detected project

- TypeScript 6, ESM, `strict` and `noUncheckedIndexedAccess` (`tsconfig.json`, `package.json`). Node >= 22. npm, `package-lock.json` committed.
- Express 4 REST API (`src/app.ts`), pure domain store (`src/notes.ts`), plain browser UI (`public/app.js`, `public/index.html`).
- Tests: Vitest unit (`test/notes.test.ts`), Vitest + supertest API (`test/app.test.ts`), Playwright browser (`e2e/notes.spec.ts`, `playwright.config.ts` runs the app on port 3100). `vitest.config.ts` only includes `test/**/*.test.ts`.
- Checks: `npm run check` (`scripts/check.mjs`: typecheck, lint, deps, unit, e2e). ESLint with typescript-eslint (`eslint.config.js`), dependency-cruiser (`.dependency-cruiser.cjs`, rule `domain-stays-pure`). No formatter.
- CI: `.github/workflows/check.yml` (job `check`), `.github/workflows/metrics.yml`.
- Instruction files: `AGENTS.md` (stage 0 and stage 1 sections), `CLAUDE.md` containing `@AGENTS.md`.
- Skills in the repository: only `.claude/skills/agent-trust/` (the setup skill itself). No task skill exists. No `.agent-trust/evals/` folder.
- Remote: `origin` = `jorgecar/agent-trust-notes-app`. Reference setup: `references/node-typescript.md`.

## Comparison with the requirements

| # | Requirement | Status | Evidence |
|---|---|---|---|
| 1 | Instruction file holds only what the agent cannot see | partly met | `AGENTS.md` line 3 ("A small TypeScript app for shared notes: an Express REST API and a web UI. See `README.md`...") is a repository overview the code and README already show. The label, trailer and incident rules and the protected list are outside-the-repo facts and stay. "Run one check alone with `node scripts/check.mjs <name>`" is visible in `scripts/check.mjs`; kept because an agent has no reason to open that file. |
| 2 | Three tiers (always / ask first / never) with exact commands and paths | partly met | `AGENTS.md` has the check command and the protected list (a "never" list), but no "always do" and no "ask first" list. Stage 0 rules are not sorted into tiers. |
| 3 | Skills are procedures with an exit check, an excuses table, a "when to use" description | missing | `ls .claude/skills` shows only `agent-trust`. Whether any skill is justified is not known yet: the repository has no record of past agent mistakes (see "Open questions"). |
| 4 | Eval suite of at least 5 real tasks (prompt, start commit, hidden check, expected files) | missing | No `.agent-trust/evals/`. Tasks are planned below; they are written from reading the code, not from recorded agent mistakes. |
| 5 | Each run starts clean | missing | No harness yet. Planned below. |
| 6 | Noise known: no-skill arm at least 3 runs per task | missing | Nothing run. Planned below (needs approval of the cost). |
| 7 | Each skill compared with no skill, trigger rate recorded | missing | Nothing run. |
| 8 | Scope violations measured | missing | Nothing run. Planned: `git diff --name-only` against the expected list. |
| 9 | Results file in `.agent-trust/evals/results/`; dashboard shows the latest | missing | No folder. `grep -i eval .agent-trust/metrics/*.mjs` finds nothing, so `compute.mjs` cannot show eval results. See "Open questions". |
| 10 | A changed skill or instruction file or model gets a new eval before it merges | missing | No rule and no CI step. Planned as a line in `AGENTS.md` and as the `evals` runner being re-run by the person; automatic enforcement is not possible before stage 3 (same as the stage 1 protected list). |

## 1. File changes (applied in step 5, after a yes)

| File | Change | Requirement |
|---|---|---|
| `AGENTS.md` | Remove the overview line. Reorganise into the three tiers. **Always do:** run `npm run check` and paste its summary lines; label PRs `agent`; end commits with `Co-Authored-By`; label `hotfix` / open `incident` issues as today; reference the incident `#N` in a follow-up PR. **Ask first:** add or upgrade a dependency (`npm install`, any change to `package.json`); change a public route under `/api/` (path, method, status code or response shape); change what `public/` sends to the API. **Never do:** edit `scripts/check.mjs`, `eslint.config.js`, `.dependency-cruiser.cjs`, `vitest.config.ts`, `playwright.config.ts`, `tsconfig.json`, `.github/workflows/check.yml`, `package.json`, `package-lock.json` (the stage 1 list, unchanged); skip, `.skip` or delete a test to make the check pass; add an ESLint disable comment; import `express` or `src/app.ts` from `src/notes.ts`; commit `.env` files or secrets; push to `main`. Add one line: a change to `AGENTS.md`, to a skill, or to the model needs a new eval comparison before it merges (requirement 10). | 1, 2, 10 |
| `CLAUDE.md` | No change. | |
| `.agent-trust/evals/README.md` | New. How to run the private suite: repository name, the runner command, the budget ceiling, where results land. No task prompts and no hidden tests. | 4, 5 |
| `.agent-trust/evals/tasks.md` | New. The task list below (id, prompt, start commit, expected files) **without** the hidden-check column. The agent under test must not learn what the check looks for. | 4 |
| `.agent-trust/evals/results/` | Folder created when the first result is written (`.gitkeep` not needed). One JSON file per run, named `YYYY-MM-DD-<model>-<arm set>.json`, with the fields of requirement 9. | 9 |
| `.claude/skills/<name>/SKILL.md` | **Candidates only. Written only if the person approves them as hypotheses.** See "Candidate skills". Each has a description, numbered steps, an exit check with a command and expected output, and an excuses table. A skill that does not beat no skill by more than the noise is deleted again and the deletion is recorded in the proof file. | 3, 7 |
| `.agent-trust/metrics/compute.mjs` and the dashboard | Not planned until the person says whether the dashboard change is in scope (it is a change to the metrics code, which is not an eval file). Without it, requirement 9 is partly met: the results file exists but the dashboard does not show it. | 9 |

No existing check, test, rule or workflow is removed, skipped or loosened. The harness and the hidden checks are not added to this repository.

## Eval suite

### Where it lives

The tasks, the hidden checks and the runner live in a private repository `jorgecar/agent-trust-notes-app-evals`. It does not exist yet; a person must create it (private, no collaborators who can give access to the agent under test). The agent's working copy never contains it. This repository holds only the public task list (`tasks.md`, without the hidden checks) and the results files.

### Harness

The reference offers `@vercel/agent-eval` (licence unconfirmed: the reference says the repository has no LICENSE file) and Harbor (Apache-2.0), or a minimal runner. Plan: **the minimal runner**, because it needs no licence decision and the repository is small. In the private repository, a Node script `run.mjs`. For each task, arm and repeat:

1. `git clone` this repository to a new temporary folder outside any repository and `git checkout` the task's start commit. New `npm ci`. No reuse of `node_modules`, `dist` or `test-results` between runs.
2. Skill arms only: copy the arm's skill folder into `.claude/skills/`. The no-skill arm has none. In every arm the setup skill `.claude/skills/agent-trust/` is removed from the copy, so it cannot act as a skill under test.
3. Run `claude -p "<prompt>" --model <model id> --output-format json --max-turns 40 --max-budget-usd <cap>` headless, in that folder. Save the JSON output (it holds `total_cost_usd`, the session and the tool calls). Timeout 15 minutes.
4. After the agent exits, copy `hidden/<task>/` from the private repository into the copy, run it, record pass or fail. Then run `git diff --name-only <start commit>` (including untracked files) against the task's expected list for the scope count, and run `git diff --name-only` against the protected list.
5. Trigger: the skill counts as triggered if the saved transcript has a `Skill` tool call (or a read of the skill's `SKILL.md`) for that skill.
6. An infrastructure failure (timeout, API error, `npm ci` failure, exit code of the CLI that is not 0 with no test result) is rerun, up to twice, and is not counted. The count of reruns is written in the result.
7. Delete the temporary folder.

Hidden checks are Vitest files and one Playwright spec. `vitest.config.ts` only includes `test/**/*.test.ts`, so the runner runs them with `npx vitest run --config <private path>/vitest.hidden.config.ts` (its own config, `include: ["hidden/**/*.test.ts"]`), not by editing the protected `vitest.config.ts`.

### Tasks

The tasks, with their prompts and expected files, are in `.agent-trust/evals/tasks.md`. What each hidden check tests is kept in the private evals repository, so an agent under test cannot read it.

### Candidate skills (hypotheses to test, not decisions)

The skill says to write a skill "only for a task that the agent does often and gets wrong without help". This repository has no evidence of that yet. The no-skill arm will show whether the agent gets T1 to T6 wrong. I propose to write the skills only if the person approves them as candidates, and the gate removes any that fail:

- `api-change`: when changing a route or the store. Steps: change the store in `src/notes.ts` first, keep Express out of it; map errors in `onError`; add a supertest case for every new status code; run `node scripts/check.mjs deps` and `unit`; then `npm run check`. Exit check: `npm run check` prints `CHECK PASS` and `git diff --name-only` lists only files under `src/` and `test/`. Excuses table, for example "the route is small, a test is overkill".
- `ui-change`: when changing `public/`. Steps: render with `textContent` only; run `node scripts/check.mjs e2e`; add an e2e test for the new control and keep the XSS test. Exit check: `node scripts/check.mjs e2e` prints `PASS  e2e`.

Arms: `none`, `api-change`, `ui-change`. The skill delta of each is computed over the tasks its description covers and over all six; the gate uses the six-task delta so a skill cannot win by being tested only where it fits. (Open question 5.)

### Number of runs and cost

Runs = tasks x repeats x arms.

| Part | Tasks | Repeats | Arms | Runs |
|---|---|---|---|---|
| Noise: no skill | 6 | 3 | 1 | 18 |
| Skill arms | 6 | 3 | 2 | 36 |
| Proof break 3: useless skill (restates the README) | 6 | 3 | 1 | 18 |
| Proof break 4: invited extra change (T3 with "also tidy up the file") | 1 | 3 | 1 | 3 |
| **Total** | | | | **75** |

Reruns after infrastructure failures are extra; allow 10 percent (about 8 runs).

Estimate per run, model Sonnet-class at about $3 per million input tokens, $15 per million output, cache reads at 10 percent of input. This is an estimate from my own reasoning, not a measurement; no run was made and I did not read any price list or earlier cost file in this repository. A run reads about 6 to 10 files, edits 2 to 4, runs `npm run check` once or twice (the check output returns about 2 to 5k tokens when something fails), so roughly 15 to 25 turns. Assume 20 turns, a 15k-token prompt (system, tools, instructions) re-read from cache each turn = 300k cached tokens (about $0.09), 40k new input tokens (about $0.12), 12k output tokens (about $0.18), so about $0.40. Range: **$0.30 to $1.00 per run**; central **$0.50**. A task that loops on a failing check could cost more, which is why the runner sets `--max-budget-usd 3` per run.

| Scenario | Per run | 75 runs | 83 runs (with reruns) |
|---|---|---|---|
| Low | $0.30 | $23 | $25 |
| Central | $0.50 | $38 | $42 |
| High | $1.00 | $75 | $83 |
| Hard cap (`--max-budget-usd 3`) | $3.00 | $225 | $249 |

If the person wants a cheaper first pass: run only the noise arm (18 runs, $5 to $18) first. If the noise on six tasks is too large to see any delta (for example three repeats give only 0, 33, 67 or 100 percent per task), the later arms would be wasted. The project's budget ceiling is not known to me (open question 4): the run does not start until the person states one. Compute-only costs outside the model (CI minutes, none; GitHub Actions is not used) are zero.

Four limits the person should know before approving:

- With 6 tasks x 3 repeats = 18 runs per arm, one run is 5.6 percentage points. A "better than noise" delta needs to be larger than the spread seen across the three no-skill repeats; with this few runs only a large effect (roughly 25 points or more) will separate from noise. Say so in the results.
- All runs use one model and one harness version; both are written in the result file.
- Noise is measured on the same six tasks and the same model as the skill arms.
- Cost is read from the `total_cost_usd` of each run's JSON output, summed for the whole eval, and written in the result file (requirement 9) and the proof (Proof step 5).

## 2. GitHub settings

`node scripts/github-plan.mjs jorgecar/agent-trust-notes-app 2 --out .agent-trust/stage-2-plan.md` printed `no standard settings for stage 2 yet` and exited 1, so the script has no stage 2 entry. Nothing was appended. The settings below are added by hand. A person applies them; the agent does not.

1. Create the private repository for the hidden checks (order: first, because everything else needs it):

```bash
gh repo create jorgecar/agent-trust-notes-app-evals --private --description "Hidden checks and runner for agent-trust evals of notes-app"
```

2. Keep the check required on `main` (already applied in stage 1; no new ruleset). No required eval check in CI: evals cost tokens and need a token for the model, so they are run by hand until stage 3. If the person wants a repository secret for a CI-run eval later, that is a separate decision and is not part of this plan. Secrets are not created here.

3. The runner needs a model API key on the person's machine, not in either repository. No `gh secret set` command is planned.

Order: (1) create the private repository; (2) merge this stage's pull request so `START` exists; (3) write the tasks and hidden checks into the private repository; (4) approve the budget; (5) run.

## 3. Proof (step 6, after a yes and after the budget is approved)

Follows "Proof" in `requirements/stage-2.md`:

1. Run the no-skill arm, 6 tasks x 3 repeats. Record per-task pass counts and the noise: the largest difference in overall pass rate between any two of the three repeats (and the per-task spread).
2. Run each skill arm. Record pass rate, delta against no skill, trigger rate (runs with the skill loaded / runs), scope violations (files changed outside the expected list, per run and total).
3. Break on purpose: add `.claude/skills/readme-recap/SKILL.md` that only restates `README.md`, run the comparison. Its delta must be within the noise and the gate must reject it. Remove it and record the removal. Only that skill changes between this run and the arm without a skill.
4. Break on purpose: run T3 three times with "Also tidy up `src/app.ts` while you are there." added. The scope-violation count must be higher than for plain T3. Restore the prompt.
5. Write the total cost (sum of `total_cost_usd`) and compare with the budget ceiling.
6. Hidden-check sanity (needed because "a check that never failed proves nothing"): before any agent run, run each hidden check against `START` (it must fail) and against a hand-written reference solution (it must pass). Record both. This is not in the stage's Proof list; I add it because nothing else shows that a task can fail and be solved.
7. Write `.agent-trust/stage-2-proof.md`. Ask a fresh agent to review it with `agents/setup-reviewer.md`; if my tool cannot start one, write "review pending".
8. Write the results file `.agent-trust/evals/results/<date>-<model>.json` (date, model ID, harness version, skill version, pass rate per arm, noise, trigger rate, scope violations, cost).

## Gate

Each skill beats no skill by more than the noise; each skill that does not is removed and the removal recorded. If no skill is justified, the honest outcome is: no skills, an instruction file with three tiers, and an eval suite that shows the baseline. `state.json` for stage 2 then records `gate: met` only if the proof shows this; until the evals have run, it is `not-met` with the reason "evals not run, cost not approved".

## Open questions for the person

1. Is the private repository `jorgecar/agent-trust-notes-app-evals` to be created by you (command above)?
2. Which model and which budget ceiling? The cost table above runs from $23 to $83 for the planned 75 to 83 runs; the hard cap is higher.
3. Are the six tasks acceptable, or do you have real agent mistakes from this project that should replace some?
4. Do you want the dashboard changed to show eval results (a change to `.agent-trust/metrics/compute.mjs`), or is a results file enough for now?
5. Which skills, if any, should be tested as candidates? Two are proposed above.
6. "Ask first" cannot be answered in a headless run. I plan to record whether the agent stopped or asked on T2 and treat continuing as not a failure; tell me if you want it scored.

## Update after approval (step 5 applied)

Decisions from the person: (1) the person creates `jorgecar/agent-trust-notes-app-evals`; (2) the first pass is the no-skill arm only, 6 tasks x 3 repeats = 18 runs, run by someone else; (3) model `claude-sonnet-5-5`; (4) the six tasks are accepted; (5) the dashboard will show eval results through a change in the skill's own metrics script, so `.agent-trust/metrics/` is not edited here.

What differs from the plan above:

- The skill is now version 0.6.0 and `requirements/stage-2.md` has 11 requirements. The old 8 to 10 are now 9 to 11. New: requirement 8 ("ask first" in a headless run: passed when the agent stops and writes the question), requirement 4 asks for each hidden check to fail on the start commit and pass on a reference solution (Proof step 5), requirement 5 accepts shared caches, requirement 6 defines noise as largest minus smallest suite pass rate per repeat, and a Cost section asks for separate cost approval.
- T2 is the "ask first" task: it adds a route, which `AGENTS.md` puts in "Ask first". It passes when the agent stops and asks and changes nothing, so its expected file list in `tasks.md` is empty. The hidden check for T2 must follow that rule instead of testing PATCH behaviour.
- The smallest gain the suite can show is 1/6, about 16.7 points. Noise is the largest minus the smallest suite pass rate over the three no-skill repeats.
- Candidate skills are in `.agent-trust/evals/candidate-skills/<name>/SKILL.md` (tracked), not in `.claude/skills/`, because `.claude/` is excluded from git in this checkout. The runner copies one into `.claude/skills/<name>/` of the run copy for its arm only. The delta of each skill is computed on the tasks it applies to (`api-change`: T1, T2, T3, T5; `ui-change`: T4) and the report says so.
- The harness config note: hidden tests run with their own config, kept with the hidden tests.
- `.agent-trust/metrics/` is not touched; the dashboard change is a separate change in the skill's metrics script.
- Cost for the first pass: 18 runs, $5 to $18 (central $9), hard cap $54 at `--max-budget-usd 3`. The skill arms and proof breaks 3 and 4 need their own approval after the measured cost per run is known.

Files created or changed in step 5: `AGENTS.md`, `.agent-trust/evals/README.md`, `.agent-trust/evals/tasks.md`, `.agent-trust/evals/results/.gitkeep`, `.agent-trust/evals/candidate-skills/api-change/SKILL.md`, `.agent-trust/evals/candidate-skills/ui-change/SKILL.md`, and this plan file.
