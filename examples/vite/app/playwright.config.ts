import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
	testDir: "spec",
	fullyParallel: true,
	use: {
		baseURL: "http://localhost:5173",
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
		url: "http://localhost:5173",
	},
});
