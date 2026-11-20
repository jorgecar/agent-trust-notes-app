import { describe, expect, it } from "vitest";
import { MAX_TEXT_LENGTH, NoteStore, ValidationError } from "../src/notes.js";

const fixedNow = () => new Date("2026-01-01T00:00:00.000Z");

describe("NoteStore", () => {
  it("creates a note with trimmed fields", () => {
    const store = new NoteStore(fixedNow);
    const note = store.create({ author: "  Ada ", text: " hello " });
    expect(note).toEqual({ id: "1", author: "Ada", text: "hello", createdAt: "2026-01-01T00:00:00.000Z" });
  });

  it("rejects empty text and missing author", () => {
    const store = new NoteStore(fixedNow);
    expect(() => store.create({ author: "Ada", text: "   " })).toThrow(ValidationError);
    expect(() => store.create({ text: "hello" })).toThrow(ValidationError);
  });

  it("rejects text that is too long", () => {
    const store = new NoteStore(fixedNow);
    expect(() => store.create({ author: "Ada", text: "x".repeat(MAX_TEXT_LENGTH + 1) })).toThrow(ValidationError);
  });

  it("lists the newest note first and deletes by id", () => {
    const store = new NoteStore(fixedNow);
    store.create({ author: "Ada", text: "first" });
    store.create({ author: "Ada", text: "second" });
    expect(store.list().map((n) => n.text)).toEqual(["second", "first"]);
    expect(store.delete("1")).toBe(true);
    expect(store.delete("1")).toBe(false);
    expect(store.list()).toHaveLength(1);
  });
});
