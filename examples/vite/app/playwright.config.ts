import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
	testDir: "spec",
	fullyParallel: true,
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
		command: "pnpm run dev",
		url: "http://127.0.0.1:5173",
	},
});
