export interface Note {
  id: string;
  author: string;
  text: string;
  createdAt: string;
}

export const MAX_TEXT_LENGTH = 2000;
export const MAX_AUTHOR_LENGTH = 80;

export class ValidationError extends Error {}

export class NoteStore {
  private readonly notes = new Map<string, Note>();
  private nextId = 1;

  constructor(private readonly now: () => Date = () => new Date()) {}

  create(input: { author?: unknown; text?: unknown }): Note {
    const text = typeof input.text === "string" ? input.text.trim() : "";
    const author = typeof input.author === "string" ? input.author.trim() : "";
    if (text.length === 0) throw new ValidationError("text is required");
    if (text.length > MAX_TEXT_LENGTH) throw new ValidationError(`text is longer than ${MAX_TEXT_LENGTH} characters`);
    if (author.length === 0) throw new ValidationError("author is required");
    if (author.length > MAX_AUTHOR_LENGTH) throw new ValidationError(`author is longer than ${MAX_AUTHOR_LENGTH} characters`);
    const note: Note = { id: String(this.nextId++), author, text, createdAt: this.now().toISOString() };
    this.notes.set(note.id, note);
    return note;
  }

  list(): Note[] {
    return [...this.notes.values()].sort((a, b) => b.createdAt.localeCompare(a.createdAt) || Number(b.id) - Number(a.id));
  }

  get(id: string): Note | undefined {
    return this.notes.get(id);
  }

  delete(id: string): boolean {
    return this.notes.delete(id);
  }
}
