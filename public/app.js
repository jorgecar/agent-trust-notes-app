// Renders notes with textContent only, so note text is never parsed as HTML.
const list = document.getElementById("notes");
const form = document.getElementById("note-form");
const error = document.getElementById("error");

async function load() {
  const res = await fetch("/api/notes");
  const notes = await res.json();
  list.replaceChildren(
    ...notes.map((note) => {
      const item = document.createElement("li");
      item.dataset.id = note.id;
      const who = document.createElement("strong");
      who.textContent = note.author;
      item.append(who, document.createTextNode(`: ${note.text}`));
      return item;
    }),
  );
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  error.textContent = "";
  const data = Object.fromEntries(new FormData(form));
  const res = await fetch("/api/notes", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    error.textContent = (await res.json()).error;
    return;
  }
  form.reset();
  await load();
});

load();
