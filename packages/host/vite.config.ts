/// <reference types="vitest" />
import path from "path";
import { defineConfig } from "vite";

export default defineConfig({
	publicDir: path.resolve(__dirname, "e2e", "modules"),
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
		},
	},
	test: {
		exclude: ["e2e"],
	},
});
