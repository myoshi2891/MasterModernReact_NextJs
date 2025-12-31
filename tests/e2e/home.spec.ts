import { test, expect, type ConsoleMessage } from "@playwright/test";

test("shows the hero heading", async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on("console", (msg: ConsoleMessage) => {
    if (msg.type() === "error") consoleErrors.push(msg.text());
  });

  await page.goto("/");
  await page.waitForLoadState("networkidle");

  const heading = page.getByRole("heading", { level: 1 });
  await expect(heading).toBeVisible();
  await expect(heading).toHaveText(/welcome to paradise/i);
  await expect(page.getByRole("main")).toBeVisible();

  expect(consoleErrors).toHaveLength(0);
});
