---
name: api-change
description: Use when you change an Express route in src/app.ts or the note store in src/notes.ts, for example to add a filter, fix an error status, or add a rule to the store.
---

# Change the API

1. Put the rule in `src/notes.ts` (the store). It must not import `express`, `src/app.ts` or `src/server.ts`.
2. Map errors to HTTP status codes only in `onError` or in the route in `src/app.ts`. A client mistake is a 4xx, never a 500.
3. If the change adds, removes or renames a route, or changes a status code or response shape of an existing route, stop and ask in your final message before you change anything.
4. Add a supertest case to `test/app.test.ts` for every new status code, and a unit case to `test/notes.test.ts` for every new store rule. Do not edit or remove existing tests.
5. Run `node scripts/check.mjs deps` and `node scripts/check.mjs unit` while you work.
6. Exit check: run `npm run check`. Expected: one `PASS` line per check and a final `CHECK PASS`. Then run `git diff --name-only`. Expected: only files under `src/` and `test/`. Paste both outputs.

## Excuses

| Excuse | Rebuttal |
|---|---|
| The change is small, a test is overkill. | An untested status code is the bug the next task will report. Add the case. |
| It is faster to check the limit in the route. | The `deps` check and the store tests only cover the store. Rules in the route are missed by them. |
| The check is slow, I will run it once at the end. | Run the single check that fits (step 5) as you go, then the full check once. Skipping the final run is not allowed. |
| A test fails because of my change, so the test is wrong. | Tests are not changed to make a check pass. Fix the code, or say you are blocked. |
