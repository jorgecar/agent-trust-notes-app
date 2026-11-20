import { spawnSync } from "node:child_process";
const checks = [
  ["typecheck", "npm", ["run", "--silent", "typecheck"]],
  ["lint", "npm", ["run", "--silent", "lint"]],
  ["deps", "npm", ["run", "--silent", "deps"]],
  ["unit", "npm", ["run", "--silent", "test"]],
  ["e2e", "npm", ["run", "--silent", "e2e"]],
];
const only = process.argv.slice(2);
const unknown = only.filter((n) => !checks.some(([name]) => name === n));
if (unknown.length > 0) {
  console.log(`CHECK FAIL (unknown check: ${unknown.join(", ")})`);
  process.exit(1);
}
const results = [];
for (const [name, cmd, args] of checks) {
  if (only.length > 0 && !only.includes(name)) continue;
  const start = Date.now();
  const run = spawnSync(cmd, args, { encoding: "utf8", shell: process.platform === "win32" });
  const ok = run.status === 0;
  results.push({ name, ok, seconds: ((Date.now() - start) / 1000).toFixed(1) });
  if (!ok) process.stdout.write(`\n--- ${name} output ---\n${run.stdout}${run.stderr}\n`);
}
for (const r of results) console.log(`${r.ok ? "PASS" : "FAIL"}  ${r.name.padEnd(10)} ${r.seconds}s`);
const failed = results.filter((r) => !r.ok).length;
console.log(failed === 0 ? "CHECK PASS" : `CHECK FAIL (${failed} of ${results.length})`);
process.exit(failed === 0 ? 0 : 1);
