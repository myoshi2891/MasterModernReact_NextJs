const { test, expect } = require("@playwright/test");

test("shows the hero heading", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Welcome to paradise."
  );
});
