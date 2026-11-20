---
name: ui-change
description: Use when you change the web page in public/ (public/app.js, public/index.html), for example to add a button, a field or a new way to show notes.
---

# Change the web page

1. Build every element with `document.createElement` and set note text with `textContent`. Never use `innerHTML`, `insertAdjacentHTML` or `outerHTML` with note data.
2. Give each new control an accessible name (a label or a button text) so a browser test can find it by role.
3. Use the existing API as it is. If the page needs a route that does not exist, stop and ask in your final message.
4. Add an e2e test in `e2e/notes.spec.ts` for the new control. Keep the existing test "note text is shown as text, never run as HTML" unchanged.
5. Run `node scripts/check.mjs e2e` while you work.
6. Exit check: run `npm run check`. Expected: a final `CHECK PASS`, including `PASS  e2e`. Then run `git diff --name-only`. Expected: only files under `public/`, `e2e/` (and `src/` only if you were told to). Paste both outputs.

## Excuses

| Excuse | Rebuttal |
|---|---|
| `innerHTML` is shorter for a list item with a button. | It runs note text as HTML. The existing e2e test fails on it, and so does a real user's note. Use `createElement`. |
| The e2e test is slow, the unit tests are enough. | Unit tests do not open the page. Only `e2e` shows whether the control works. |
| I will add the e2e test later. | A control without a test is not done. Add it now. |
| The test for HTML text blocks me. | It is protecting users. Change your code, not the test. |
