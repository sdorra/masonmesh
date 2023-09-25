import packageJson from "./package.json";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { viteStaticCopy } from "vite-plugin-static-copy";
import generateFile from "vite-plugin-generate-file";
import path from "path";


// TODO use a better way to get the plugin names
const plugins = Object.keys(packageJson.dependencies)
	.filter((d) => d.startsWith("@masonmesh/example-vite-react-plugin-"))
	.map((d) => d.replace("@masonmesh/example-vite-react-plugin-", ""));

const plugin = "movies";
console.log(`node_modules/@masonmesh/example-vite-react-plugin-${plugin}/dist/example-vite-react-plugin-${plugin}.amd.js`,);

// TODO use a better way to get the plugin paths
const targets = plugins.map((plugin) => ({
	src: path.resolve(
		__dirname,
		`node_modules/@masonmesh/example-vite-react-plugin-${plugin}/dist/example-vite-react-plugin-${plugin}.amd.js`,
	),
	dest: "plugins",
	rename: `plugin-${plugin}.js`,
}));

// https://vitejs.dev/config/
export default defineConfig({
	build: {
		target: "esnext",
	},
	plugins: [
		react(),
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
