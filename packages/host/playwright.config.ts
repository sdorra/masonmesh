import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
	testDir: "e2e",
	fullyParallel: true,
	// reporter: "html",
	retries: 1,
	use: {
		baseURL: "http://127.0.0.1:5173",
		trace: "on-first-retry",
	},
	projects: [
		{
			name: "chromium",
			use: { ...devices["Desktop Chrome"] },
		},
	],
	webServer: {
		command: "pnpm vite",
		url: "http://127.0.0.1:5173",
	},
});
