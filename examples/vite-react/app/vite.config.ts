import packageJson from "./package.json";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { viteStaticCopy } from "vite-plugin-static-copy";
import generateFile from "vite-plugin-generate-file";
import path from "path";
import fs from "fs";

const pluginFiles = Object.keys(packageJson.dependencies)
	.filter((d) => d.startsWith("@masonmesh/") && d.includes("plugin"))
	.map((d) => {
		const directory = path.join(__dirname, "node_modules", d);
		const content = fs.readFileSync(
			path.join(directory, "package.json"),
			"utf-8",
		);
		const packageJson = JSON.parse(content);

		const plugin = {
			name: packageJson.masonmesh.name,
			bundle: path.resolve(path.join(directory, packageJson.masonmesh.bundle)),
			stylesheet: undefined,
		};

		if (packageJson.masonmesh.stylesheet) {
			plugin.stylesheet = path.resolve(
				path.join(directory, packageJson.masonmesh.stylesheet),
			);
		}

		return plugin;
	});

const targets = pluginFiles.flatMap((plugin) => {
	const files = [
		{
			src: plugin.bundle,
			dest: "plugins",
			rename: `plugin-${plugin.name}.js`,
		},
	];

	if (plugin.stylesheet) {
		files.push({
			src: plugin.stylesheet,
			dest: "plugins",
			rename: `plugin-${plugin.name}.css`,
		});
	}

	return files;
});

const plugins = {};
for (const plugin of pluginFiles) {
	plugins[plugin.name] = {
		bundle: `./plugins/plugin-${plugin.name}.js`,
		stylesheet: plugin.stylesheet
			? `./plugins/plugin-${plugin.name}.css`
			: undefined,
	};
}

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
