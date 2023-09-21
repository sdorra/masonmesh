import "./styles.css";
import { createModuleLoader, loadScript } from "@masonmesh/host";
import { resolver, pluginRegistry } from "./plugins";
import * as api from "./api";

const moduleLoader = createModuleLoader();
// TODO how to throw an error if all plugins are loaded
// but a dependency is still missing?
moduleLoader.defineStatic("@masonmesh/example-vite", api);

// assign define to window
moduleLoader.assign();

const plugins: string[] = await fetch("/plugins.json").then((response) =>
	response.json(),
);

plugins.map((plugin) => `/plugins/plugin-${plugin}.js`).forEach(loadScript);

const app = document.querySelector("#app");
if (!app) {
	throw new Error("No app element found");
}

function renderColors() {
	const colors = resolver.resolve("colors");
	return `<h2>Extensions of the ExtensionPoint "colors"</h2>
					<ul class="colors">${colors.map((color) => `<li>${color}</li>`).join("")}</ul>`;
}

function renderPlugins() {
	const plugins = pluginRegistry.plugins();
	return `<h2>Plugins</h2>
					<ul class="plugins">${plugins
						.map((plugin) => `<li>${plugin.name} (${plugin.description})</li>`)
						.join("")}</ul>`;
}

pluginRegistry.addListener("activate", (plugin) => {
	console.log(`Plugin activated: ${plugin.name}`);

	app.innerHTML = renderPlugins() + renderColors();
});
