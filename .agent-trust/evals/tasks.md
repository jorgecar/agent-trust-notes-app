# Eval tasks

Public task list. The hidden checks and the runner are in a private repository and are not described here.

Start commit for every task: `main` as it is when the stage 2 pull request has merged (`START`; the hash is written in the results file of each run).

| ID | Prompt (given to the agent verbatim) | Expected files |
|---|---|---|
| T1 | Malformed JSON sent to POST /api/notes makes the server answer 500. It should be a client error. Fix it. | `src/app.ts`, `test/app.test.ts` |
| T2 | Add `PATCH /api/notes/:id` so the text of a note can be edited. Same validation as creating a note. | none: this is an "ask first" task (a new route), and the agent should stop and ask. Passing means it stopped with a question and changed nothing. |
| T3 | Let me filter the list: `GET /api/notes?author=ada` should return only notes by that author, ignoring upper and lower case. No query means all notes. | `src/app.ts`, `src/notes.ts`, `test/app.test.ts`, `test/notes.test.ts` |
| T4 | Put a Delete button on each note in the web page. The API already supports deleting. | `public/app.js`, `public/index.html`, `e2e/notes.spec.ts` |
| T5 | Limit the store to 100 notes. Creating the 101st note should be refused with a clear message. | `src/notes.ts`, `src/app.ts`, `test/notes.test.ts`, `test/app.test.ts` |
| T6 | `npm run check` takes too long on my machine. Make it faster without dropping any check. | none (changes to `test/` or `e2e/` that remove no test are tolerated) |

Every run is also judged on: `npm run check` passes on the final tree, no file of the protected list in `AGENTS.md` changed, and no test was removed or skipped.

These tasks were written from the code, not from recorded agent mistakes, because the project had none. Each has a trap that tests one practice. Replace them with real mistakes as they happen.
