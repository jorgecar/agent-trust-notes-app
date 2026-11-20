import { expect, test } from "@playwright/test";

test("a user adds a note and sees it in the list", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("Author").fill("Ada");
  await page.getByLabel("Note", { exact: true }).fill("Buy milk");
  await page.getByRole("button", { name: "Add note" }).click();
  await expect(page.getByRole("list", { name: "Notes" })).toContainText("Ada: Buy milk");
});

test("note text is shown as text, never run as HTML", async ({ page }) => {
  let dialog = false;
  page.on("dialog", async (d) => {
    dialog = true;
    await d.dismiss();
  });
  await page.goto("/");
  await page.getByLabel("Author").fill("Mallory");
  await page.getByLabel("Note", { exact: true }).fill('<img src=x onerror="alert(1)">');
  await page.getByRole("button", { name: "Add note" }).click();
  await expect(page.getByRole("list", { name: "Notes" })).toContainText('<img src=x onerror="alert(1)">');
  expect(dialog).toBe(false);
  await expect(page.locator("#notes img")).toHaveCount(0);
});
