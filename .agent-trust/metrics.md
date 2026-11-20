# Metrics

`.agent-trust/metrics/compute.mjs` computes these from git and the GitHub API. A scheduled workflow (`.github/workflows/metrics.yml`) runs it every day and publishes the dashboard with GitHub Pages. Every metric is shown for all work, and split into agent work and other work. The formulas are in `.agent-trust/metrics/metrics.mjs`; `selftest.mjs` checks them.

## Adaptations of this project

- **Deployment:** a pull request merged to `main`. The app has no production deployment, so a merge is the closest event.
- **Failed change:** a merged pull request labelled `hotfix`, or a revert pull request.
- **Incident:** an issue labelled `incident`. Its body should reference the pull request that caused it (`#N`).
- **Rework:** a merged pull request whose title or body references an incident issue (`#N`), meaning an unplanned deployment caused by an incident.
- **Agent work:** a pull request labelled `agent`, or a commit with a `Co-Authored-By` trailer that names an agent.
- **Churn:** another author changes a file the pull request touched within 7 days of its merge.

## Outcome layer: the five DORA metrics

| Metric | How it is computed |
|---|---|
| Lead time for changes | Median time from the first commit of a merged pull request to its merge. |
| Deployment frequency | Merged pull requests per week over the window. |
| Failed deployment recovery time | Median time from creation to closing of incident issues. |
| Change fail rate | Share of merged pull requests that are failed changes. |
| Rework rate | Share of merged pull requests that are rework. |

## Trust layer

| Metric | How it is computed |
|---|---|
| Churn within 7 days | Share of merged pull requests that have churn. |
| Review wait time | Median time from opening a pull request to its first review. |
| Approvals per change | Median number of approving reviews per merged pull request. |
| Share of labelled agent work | Share of merged pull requests that are agent work. |
| CI pass rate | Share of completed runs of the workflow named `check` that ended in success. It shows no data until a `check` workflow exists (stage 1). |
| Incidents linked to a change | Incidents per merged pull request, and the share of incidents that reference a merged pull request. |

## Gate

All metrics cover the last 30 days (`METRICS_DAYS`, default 30).

The dashboard updates by itself and shows the core metrics, plus the last month if history exists. It starts empty: the repository has one commit and no GitHub remote yet.
