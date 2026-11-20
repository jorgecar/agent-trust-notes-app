# Evals

This folder holds the public side of the stage 2 evals: the task list (`tasks.md`), the candidate skills and the results. The hidden checks, the reference solutions and the runner live in the private repository `jorgecar/agent-trust-notes-app-evals`. The agent under test never gets a copy of it.

## How a run works

For each task, arm and repeat the runner:

1. Clones this repository at the start commit into a new folder outside any repository and runs `npm ci`.
2. Removes `.claude/skills/agent-trust/` from the copy. For a skill arm only, copies `candidate-skills/<name>/` into `.claude/skills/<name>/` of the copy.
3. Runs the agent headless with the fixed model `claude-sonnet-5-5` and the task prompt, and saves the output and the cost.
4. After the agent exits, runs the hidden check, counts changed files that are not in the task's expected list, and checks whether the skill was loaded.
5. Reruns infrastructure failures (timeouts, API errors). They do not count as fails.

## Arms and order

First pass: the `none` arm only, 6 tasks x 3 repeats = 18 runs. It gives the real cost per run and the noise. The skill arms (`api-change`, `ui-change` in `candidate-skills/`) run only after the person approves their cost.

## Results

One file per eval run in `results/`, named `YYYY-MM-DD-<model>.json`, with: date, model ID, harness version, skill version, start commit, pass rate per arm, noise, trigger rate, scope violations and cost. The dashboard shows the latest.

## Candidate skills

The two skills in `candidate-skills/` are hypotheses. A skill whose delta against no skill is not larger than the noise is deleted, and the deletion is recorded in the stage 2 proof file.
