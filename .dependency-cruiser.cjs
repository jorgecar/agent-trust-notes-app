/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    {
      name: "domain-stays-pure",
      severity: "error",
      from: { path: "^src/notes\\.ts$" },
      to: { path: "^(src/app\\.ts|src/server\\.ts|node_modules/express)" },
    },
    {
      name: "src-not-from-tests",
      severity: "error",
      from: { path: "^src" },
      to: { path: "^(test|e2e)/" },
    },
  ],
  options: { tsConfig: { fileName: "tsconfig.json" }, doNotFollow: { path: "node_modules" } },
};
