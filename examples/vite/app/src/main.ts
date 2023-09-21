import "./styles.css";
// TODO use named export
import createModuleLoader from "@masonmesh/host";
import { resolver, pluginRegistry } from "./plugins";
import * as api from "./api";

const moduleLoader = createModuleLoader();
// TODO how to throw an error if all plugins are loaded
// but a dependency is still missing?
moduleLoader.defineStatic("@masonmesh/example-vite", api);

// TODO can we do this in the host package?
// if not we should document this
declare global {
	interface Window {
		define: typeof moduleLoader.define;
	}
}

// TODO can we do this in the host package?
window.define = moduleLoader.define;

// TODO this should be more dynamic
const plugins = ["plugin-red"];

// TODO we should have a way in the host package for this
plugins.forEach((plugin) => {
	const script = document.createElement("script");
	script.async = true;
	script.src = `/plugins/${plugin}.js`;
	document.body.appendChild(script);
	document.body.removeChild(script);
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

// TODO is this such a common use case that we should provide a option for this?
pluginRegistry.addListener("register", (plugin) => {
	pluginRegistry.activate(plugin.name);
});

pluginRegistry.addListener("activate", (plugin) => {
	console.log(`Plugin activated: ${plugin.name}`);

	app.innerHTML = renderPlugins() + renderColors();
});
