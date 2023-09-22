import { test, expect } from "@playwright/test";

test("test-simple", async ({ page }) => {
	await page.goto("/?test=simple");
	const app = await page.$("#app");
	expect(app?.innerText()).toBe("Executed module foo");
});
