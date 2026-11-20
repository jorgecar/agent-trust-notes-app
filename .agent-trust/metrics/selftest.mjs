// Checks the metric formulas on fixed data with known answers. No network.
// Usage: node selftest.mjs   (exit 0 and "METRICS SELFTEST PASS" when every value matches)
import { DAY, computeMetrics } from "./metrics.mjs";

const t0 = Date.UTC(2026, 0, 1);
const h = 3600000;
const pr = (o) => ({ title: "", body: "", labels: [], reviews: [], commitMessages: [], files: [], ...o });
const data = {
  days: 7,
  prs: [
    pr({ number: 1, author: "ana", createdAt: t0, firstCommitAt: t0, mergedAt: t0 + 2 * h,
      reviews: [{ state: "APPROVED", submittedAt: t0 + 1 * h }], files: ["a.ts"],
      commitMessages: ["Add a\n\nCo-Authored-By: Claude <noreply@anthropic.com>"] }),
    pr({ number: 2, author: "bo", createdAt: t0 + DAY, firstCommitAt: t0 + DAY, mergedAt: t0 + DAY + 4 * h,
      title: "Fix crash", body: "Fixes #10", labels: ["hotfix"], files: ["a.ts"],
      reviews: [{ state: "APPROVED", submittedAt: t0 + DAY + 3 * h }] }),
    pr({ number: 3, author: "ana", createdAt: t0 + 2 * DAY, firstCommitAt: t0 + 2 * DAY, mergedAt: t0 + 2 * DAY + 6 * h,
      title: "Revert \"Add b\"", files: ["b.ts"], labels: ["agent"] }),
  ],
  incidents: [
    { number: 10, body: "Caused by #1", createdAt: t0 + DAY, closedAt: t0 + DAY + 5 * h },
    { number: 11, body: "Cause unknown", createdAt: t0 + 3 * DAY, closedAt: null },
  ],
  ciRuns: [{ conclusion: "success" }, { conclusion: "failure" }, { conclusion: "success" }, { conclusion: "success" }],
};

const expected = {
  "outcome.deploymentsPerWeek": 3,
  "outcome.leadTimeHoursMedian": 4,
  "outcome.changeFailRate": 0.667,
  "outcome.failedDeploymentRecoveryHoursMedian": 5,
  "outcome.reworkRate": 0.333,
  "trust.reviewWaitHoursMedian": 2,
  "trust.approvalsPerPrMedian": 1,
  "trust.agentWorkShare": 0.667,
  "trust.churnRate7d": 0.333,
  "trust.ciPassRate": 0.75,
  "trust.incidentsPerMergedPr": 0.667,
  "trust.incidentsLinkedToChangeShare": 0.5,
  "split.agent.merges": 2,
  "split.other.merges": 1,
};

const m = computeMetrics(data);
let failed = 0;
for (const [path, want] of Object.entries(expected)) {
  const got = path.split(".").reduce((o, k) => o?.[k], m);
  const ok = got === want;
  if (!ok) failed++;
  console.log(`${ok ? "OK  " : "FAIL"}  ${path} = ${got}${ok ? "" : ` (expected ${want})`}`);
}
console.log(failed === 0 ? "METRICS SELFTEST PASS" : `METRICS SELFTEST FAIL (${failed})`);
process.exit(failed === 0 ? 0 : 1);
