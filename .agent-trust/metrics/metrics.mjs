// Pure metric formulas. No network. compute.mjs fetches the data, selftest.mjs checks these formulas.
// Definitions (the skill's adaptations, not DORA's own wording):
// - deployment: a pull request merged to main
// - failed change: a merged PR labelled hotfix, or a revert PR
// - incident: an issue labelled incident
// - rework: a merged PR whose title or body references an incident issue (#N), so an unplanned
//   deployment caused by an incident
// - agent work: a PR labelled agent, or a commit with a Co-Authored-By trailer that names an agent
// - churn: another author changes a file the PR touched within 7 days of its merge
export const DAY = 86400000;
export const AGENT_TRAILER = /^Co-Authored-By: .*(Claude|Codex|Cursor|Copilot|agent)/im;

export const median = (xs) => {
  if (xs.length === 0) return null;
  const s = [...xs].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};
const hours = (ms) => (ms === null ? null : Math.round((ms / 3600000) * 10) / 10);
const ratio = (a, b) => (b === 0 ? null : Math.round((a / b) * 1000) / 1000);
const refs = (text) => new Set([...(text ?? "").matchAll(/#(\d+)\b/g)].map((m) => Number(m[1])));

// input: { days, prs: [{ number, author, title, body, labels, createdAt, mergedAt, firstCommitAt,
//          reviews: [{ state, submittedAt }], commitMessages: [string], files: [string] }],
//          incidents: [{ number, body, createdAt, closedAt }], ciRuns: [{ conclusion }] }
// Times are epoch milliseconds.
export function computeMetrics({ days, prs, incidents, ciRuns }) {
  const incidentNumbers = new Set(incidents.map((i) => i.number));
  const merged = prs.map((p) => {
    const firstReview = p.reviews.length ? Math.min(...p.reviews.map((r) => r.submittedAt)) : null;
    const prRefs = refs(`${p.title}\n${p.body}`);
    return {
      ...p,
      leadTime: p.mergedAt - p.firstCommitAt,
      reviewWait: firstReview === null ? null : firstReview - p.createdAt,
      approvals: p.reviews.filter((r) => r.state === "APPROVED").length,
      agent: p.labels.includes("agent") || p.commitMessages.some((m) => AGENT_TRAILER.test(m)),
      failedChange: p.labels.includes("hotfix") || /^revert/i.test(p.title),
      rework: [...prRefs].some((n) => incidentNumbers.has(n)),
    };
  });
  for (const pr of merged) {
    pr.churn = merged.some(
      (o) => o.author !== pr.author && o.mergedAt > pr.mergedAt && o.mergedAt - pr.mergedAt <= 7 * DAY &&
        o.files.some((f) => pr.files.includes(f)),
    );
  }
  const mergedNumbers = new Set(merged.map((p) => p.number));
  const linked = incidents.filter((i) => [...refs(i.body)].some((n) => mergedNumbers.has(n)));
  const recovery = incidents.filter((i) => i.closedAt).map((i) => i.closedAt - i.createdAt);
  const split = (filter) => {
    const set = merged.filter(filter);
    return {
      merges: set.length,
      leadTimeHoursMedian: hours(median(set.map((p) => p.leadTime))),
      changeFailRate: ratio(set.filter((p) => p.failedChange).length, set.length),
      churnRate7d: ratio(set.filter((p) => p.churn).length, set.length),
    };
  };
  return {
    windowDays: days,
    outcome: {
      deploymentsPerWeek: Math.round((merged.length / days) * 7 * 10) / 10,
      leadTimeHoursMedian: hours(median(merged.map((p) => p.leadTime))),
      changeFailRate: ratio(merged.filter((p) => p.failedChange).length, merged.length),
      failedDeploymentRecoveryHoursMedian: hours(median(recovery)),
      reworkRate: ratio(merged.filter((p) => p.rework).length, merged.length),
    },
    trust: {
      reviewWaitHoursMedian: hours(median(merged.map((p) => p.reviewWait).filter((x) => x !== null))),
      approvalsPerPrMedian: median(merged.map((p) => p.approvals)),
      agentWorkShare: ratio(merged.filter((p) => p.agent).length, merged.length),
      churnRate7d: ratio(merged.filter((p) => p.churn).length, merged.length),
      ciPassRate: ratio(ciRuns.filter((r) => r.conclusion === "success").length, ciRuns.length),
      incidentsPerMergedPr: ratio(incidents.length, merged.length),
      incidentsLinkedToChangeShare: ratio(linked.length, incidents.length),
    },
    split: { agent: split((p) => p.agent), other: split((p) => !p.agent) },
    definitions: {
      deployment: "A pull request merged to main.",
      failedChange: "A merged PR labelled hotfix, or a revert PR.",
      rework: "A merged PR whose title or body references an incident issue (#N).",
      incident: "An issue labelled incident. Its body should reference the PR that caused it (#N).",
      agentWork: "A PR labelled agent, or a commit with a Co-Authored-By trailer that names an agent.",
      churn: "Another author changes a file the PR touched within 7 days of its merge.",
    },
  };
}
