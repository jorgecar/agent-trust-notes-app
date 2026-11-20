import path from "node:path";
import { fileURLToPath } from "node:url";
import express, { type ErrorRequestHandler } from "express";
import { NoteStore, ValidationError } from "./notes.js";

const publicDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../public");

export function createApp(store: NoteStore = new NoteStore()) {
  const app = express();
  app.use(express.json({ limit: "16kb" }));

  app.get("/api/notes", (_req, res) => {
    res.json(store.list());
  });

  app.get("/api/notes/:id", (req, res) => {
    const note = store.get(req.params.id);
    if (!note) {
      res.status(404).json({ error: "note not found" });
      return;
    }
    res.json(note);
  });

  app.post("/api/notes", (req, res) => {
    const note = store.create(req.body ?? {});
    res.status(201).json(note);
  });

  app.delete("/api/notes/:id", (req, res) => {
    if (!store.delete(req.params.id)) {
      res.status(404).json({ error: "note not found" });
      return;
    }
    res.status(204).end();
  });

  app.use(express.static(publicDir));

  const onError: ErrorRequestHandler = (err, _req, res, _next) => {
    if (err instanceof ValidationError) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.status(500).json({ error: "internal error" });
  };
  app.use(onError);

  return app;
}
