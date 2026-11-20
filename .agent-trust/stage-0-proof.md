# Stage 0 proof

## 1. Run the new setup

`node .agent-trust/metrics/selftest.mjs` printed `METRICS SELFTEST PASS`.
`node --check .agent-trust/metrics/compute.mjs` passed (syntax only).

## 2. Break one part on purpose

- Break: in `.agent-trust/metrics/metrics.mjs` line 38, changed the label `"hotfix"` to `"hotfx"`.
- Result: `FAIL  outcome.changeFailRate = 0.333 (expected 0.667)` then `METRICS SELFTEST FAIL (1)`. Only that metric failed.
- Restore: copied `metrics.mjs` back from the skill (byte-identical, checked with `cmp`). Re-run printed `METRICS SELFTEST PASS`.

## 3. Live run against GitHub

Skipped. The repository has no GitHub remote and there is no token, so `compute.mjs` cannot run against GitHub. Not done: the workflow has never run and the dashboard shows no data.

## 4. Gate

Not met. The gate needs the workflow to run on GitHub and the dashboard to show data. State: `pending-settings`.

## 5. Fresh-agent review

Done by a fresh agent that did not do the setup, using `agents/setup-reviewer.md`. Verdict: gate pending settings. No must-fix findings.

- Should fix, confirmed and fixed: CI pass rate reads only runs of a workflow named `check` (`compute.mjs` line 65), and none exists yet. Added to `.agent-trust/metrics.md`.
- Nit, fixed: stated the 30-day window (`compute.mjs` line 11) in `metrics.md`.
- Nit, noted for the person: the first Pages deploy may need approval of the `github-pages` environment.
- The reviewer repeated the `hotfx` break on a copy and got the same single failure, and found no weakened check and no changed GitHub setting.
