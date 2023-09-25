import path from "path";
import { defineConfig } from "vite";
import packageJson from "./package.json";

export default defineConfig({
	build: {
		lib: {
			entry: path.resolve(__dirname, "src/index.tsx"),
			name: "plugin-movies",
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore i don't know why vite does not export a type for amd
			formats: ["amd"],
		},
		rollupOptions: {
			external: [
				"react/jsx-runtime",
				...Object.keys(packageJson.peerDependencies || {}),
			],
		},
	},
});
