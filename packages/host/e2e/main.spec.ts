import { test, expect, Page } from "@playwright/test";

async function expectSuccess(
	page: Page,
	testName: string,
	expectedContent: string,
) {
	await page.goto(`/?test=${testName}`);
	const app = await page.locator("css=.success");
	await expect(await app.textContent()).toBe(expectedContent);
}

async function expectError(
	page: Page,
	testName: string,
	expectedContent: string,
) {
	await page.goto(`/?test=${testName}`);
	const app = await page.locator("css=.error");
	await expect(await app.textContent()).toBe(expectedContent);
}

test("test simple", async ({ page }) => {
	await expectSuccess(page, "simple", "Executed module foo");
});

test("test script-not-found", async ({ page }) => {
	await expectError(
		page,
		"script-not-found",
		"Error: Failed to load script /404.js",
	);
});

test("test dependency not found", async ({ page }) => {
	await expectError(
		page,
		"dependency-not-found",
		"Error: Failed to load modules bar, because of missing dependencies foo",
	);
});

test("test parsing-error", async ({ page }) => {
	await expectError(
		page,
		"parsing-error",
		"Error: Failed to load modules parsing-error",
	);
});

test("test exec-error", async ({ page }) => {
	await expectError(
		page,
		"exec-error",
		"Error: Failed to load modules exec-error",
	);
});
