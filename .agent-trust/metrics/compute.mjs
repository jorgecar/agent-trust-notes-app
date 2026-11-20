// Stage 0 metrics: reads the GitHub API, computes the metrics with metrics.mjs,
// and writes metrics.json and index.html. Read-only on GitHub.
// Usage: GITHUB_TOKEN=... GITHUB_REPOSITORY=owner/repo node compute.mjs [outDir]
// Copy compute.mjs and metrics.mjs together. selftest.mjs checks the formulas.
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { computeMetrics } from "./metrics.mjs";

const repo = process.env.GITHUB_REPOSITORY;
const token = process.env.GITHUB_TOKEN;
const outDir = process.argv[2] ?? "metrics-site";
const days = Number(process.env.METRICS_DAYS ?? 30);
const since = new Date(Date.now() - days * 86400000);
if (!repo || !token) {
  console.error("GITHUB_REPOSITORY and GITHUB_TOKEN are required");
  process.exit(2);
}

async function api(path) {
  const res = await fetch(`https://api.github.com${path}`, {
    headers: { authorization: `Bearer ${token}`, accept: "application/vnd.github+json" },
  });
  if (!res.ok) throw new Error(`${res.status} ${path}`);
  return res.json();
}
async function all(path, key) {
  const items = [];
  for (let page = 1; page <= 10; page++) {
    const sep = path.includes("?") ? "&" : "?";
    const data = await api(`${path}${sep}per_page=100&page=${page}`);
    const list = key ? data[key] : data;
    items.push(...list);
    if (list.length < 100) break;
  }
  return items;
}
const ms = (d) => new Date(d).getTime();

const pulls = (await all(`/repos/${repo}/pulls?state=closed&base=main&sort=updated&direction=desc`))
  .filter((p) => p.merged_at && new Date(p.merged_at) >= since);
const prs = [];
for (const p of pulls) {
  const [reviews, commits, files] = await Promise.all([
    all(`/repos/${repo}/pulls/${p.number}/reviews`),
    all(`/repos/${repo}/pulls/${p.number}/commits`),
    all(`/repos/${repo}/pulls/${p.number}/files`),
  ]);
  prs.push({
    number: p.number,
    author: p.user.login,
    title: p.title,
    body: p.body ?? "",
    labels: p.labels.map((l) => l.name),
    createdAt: ms(p.created_at),
    mergedAt: ms(p.merged_at),
    firstCommitAt: Math.min(...commits.map((c) => ms(c.commit.author.date))),
    reviews: reviews.map((r) => ({ state: r.state, submittedAt: ms(r.submitted_at) })),
    commitMessages: commits.map((c) => c.commit.message),
    files: files.map((f) => f.filename),
  });
}
const incidents = (await all(`/repos/${repo}/issues?state=all&labels=incident&since=${since.toISOString()}`))
  .filter((i) => !i.pull_request)
  .map((i) => ({ number: i.number, body: i.body ?? "", createdAt: ms(i.created_at), closedAt: i.closed_at ? ms(i.closed_at) : null }));
const ciRuns = (await all(`/repos/${repo}/actions/runs?branch=main&created=>=${since.toISOString().slice(0, 10)}`, "workflow_runs"))
  .filter((r) => r.name === "check" && r.status === "completed")
  .map((r) => ({ conclusion: r.conclusion }));

// Stage 2: the latest eval results file, if the repository has one.
const evalsDir = process.env.EVALS_RESULTS_DIR ?? ".agent-trust/evals/results";
let evals = null;
if (existsSync(evalsDir)) {
  const files = readdirSync(evalsDir).filter((f) => f.endsWith(".json")).sort();
  if (files.length > 0) {
    const latest = JSON.parse(readFileSync(`${evalsDir}/${files[files.length - 1]}`, "utf8"));
    const pick = ["date", "model", "harnessVersion", "arm", "suitePassRate", "noise", "smallestDetectableGain", "triggerRate", "scopeViolations", "totalCostUsd"];
    evals = Object.fromEntries(pick.filter((k) => k in latest).map((k) => [k, typeof latest[k] === "object" ? JSON.stringify(latest[k]) : latest[k]]));
    evals.file = files[files.length - 1];
  }
}

const metrics = { repository: repo, generatedAt: new Date().toISOString(), ...computeMetrics({ days, prs, incidents, ciRuns }), evals };
mkdirSync(outDir, { recursive: true });
writeFileSync(`${outDir}/metrics.json`, JSON.stringify(metrics, null, 2));
const esc = (v) => String(v ?? "no data").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
const rows = (obj) => Object.entries(obj).map(([k, v]) => `<tr><th>${esc(k)}</th><td>${esc(v)}</td></tr>`).join("");
writeFileSync(`${outDir}/index.html`, `<!doctype html><meta charset="utf-8"><title>Agent trust metrics</title>
<style>body{font-family:system-ui;max-width:44rem;margin:2rem auto;padding:0 1rem}table{border-collapse:collapse;width:100%;margin-bottom:1.5rem}th,td{text-align:left;border-bottom:1px solid #ddd;padding:.3rem}</style>
<h1>Agent trust metrics</h1><p>${esc(repo)}, last ${days} days, generated ${esc(metrics.generatedAt)}.</p>
<h2>Outcome layer (DORA)</h2><table>${rows(metrics.outcome)}</table>
<h2>Trust layer</h2><table>${rows(metrics.trust)}</table>
<h2>Agent work</h2><table>${rows(metrics.split.agent)}</table>
<h2>Other work</h2><table>${rows(metrics.split.other)}</table>
${evals ? `<h2>Latest eval run</h2><table>${rows(evals)}</table>` : "<h2>Latest eval run</h2><p>No eval results yet.</p>"}
<h2>Definitions</h2><table>${rows(metrics.definitions)}</table>`);
console.log(JSON.stringify(metrics.outcome), JSON.stringify(metrics.trust));
