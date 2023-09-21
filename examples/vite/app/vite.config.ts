import { viteStaticCopy } from "vite-plugin-static-copy";

import path from "path";
import { defineConfig } from "vite";

const pluginRed = path.resolve(
	__dirname,
	"node_modules/@masonmesh/example-vite-plugin-red/dist/example-vite-plugin-red.amd.js",
);

export default defineConfig({
	plugins: [
		viteStaticCopy({
			targets: [
				{
					src: pluginRed,
					dest: "plugins",
					rename: "plugin-red.js",
				},
			],
		}),
	],
});
