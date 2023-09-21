import "./styles.css";
import { loadModules } from "@masonmesh/host";
import { resolver, pluginRegistry } from "./plugins";
import * as api from "./api";

const plugins: string[] = await fetch("/plugins.json").then((response) =>
	response.json(),
);

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
