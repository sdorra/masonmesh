import { viteStaticCopy } from "vite-plugin-static-copy";
import generateFile from "vite-plugin-generate-file";

import packageJson from "./package.json";

import path from "path";
import { defineConfig } from "vite";

// TODO use a better way to get the plugin names
const plugins = Object.keys(packageJson.dependencies)
	.filter((d) => d.startsWith("@masonmesh/example-vite-plugin-"))
	.map((d) => d.replace("@masonmesh/example-vite-plugin-", ""));

// TODO use a better way to get the plugin paths
const targets = plugins.map((plugin) => ({
	src: path.resolve(
		__dirname,
		`node_modules/@masonmesh/example-vite-plugin-${plugin}/dist/example-vite-plugin-${plugin}.amd.js`,
	),
	dest: "plugins",
	rename: `plugin-${plugin}.js`,
}));

export default defineConfig({
	plugins: [
		viteStaticCopy({
			targets,
		}),
		generateFile([
			{
				type: "json",
				output: "./plugins.json",
				data: plugins,
			},
		]),
	],
});
