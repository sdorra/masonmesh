import { test, expect } from "@playwright/test";

test("plugin registered", async ({ page }) => {
	await page.goto("/");

	const plugin = await page
		.getByRole("list")
		.locator(":scope.plugins > li")
		.nth(0);
	expect(await plugin.textContent()).toBe("red (red plugin)");
});

test("extension bound", async ({ page }) => {
	await page.goto("/");

	const colors = await page
		.getByRole("list")
		.locator(":scope.colors > li")
		.nth(0);
	expect(await colors.textContent()).toBe("red");
});
