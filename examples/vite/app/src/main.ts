import "./styles.css";
import { loadModules } from "@masonmesh/host";
import { resolver, pluginRegistry } from "./plugins";
import * as api from "./api";

const plugins: string[] = await fetch("/plugins.json").then((response) =>
	response.json(),
);

// TODO what should happen, if one of the following errors occur?:
// - script not found
// - script throws an error
// - module throws an error
// - dependency not found
//
// We have to choose between:
// - reject the promise with an error message
// - continue and log the error
// - lets the user decide and pass an error handler

await loadModules({
	modules: plugins,
	moduleNameTransform: (module) => `/plugins/plugin-${module}.js`,
	staticModules: {
		"@masonmesh/example-vite": api,
	},
});

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

app.innerHTML = `${renderColors()}${renderPlugins()}`;
