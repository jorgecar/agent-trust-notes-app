import request from "supertest";
import { describe, expect, it } from "vitest";
import { createApp } from "../src/app.js";

describe("notes API", () => {
  it("creates, reads and deletes a note", async () => {
    const app = createApp();
    const created = await request(app).post("/api/notes").send({ author: "Ada", text: "hello" }).expect(201);
    await request(app).get(`/api/notes/${created.body.id}`).expect(200, created.body);
    await request(app).delete(`/api/notes/${created.body.id}`).expect(204);
    await request(app).get(`/api/notes/${created.body.id}`).expect(404);
  });

  it("returns 400 for invalid input", async () => {
    const res = await request(createApp()).post("/api/notes").send({ author: "Ada" }).expect(400);
    expect(res.body.error).toBe("text is required");
  });

  it("serves the UI", async () => {
    const res = await request(createApp()).get("/").expect(200);
    expect(res.text).toContain("Shared notes");
  });
});
