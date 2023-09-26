import * as React from "react";
import * as ReactRouterDom from "react-router-dom";
import * as JsxRuntime from "react/jsx-runtime";
import { loadModules } from "@masonmesh/host";
import * as PluginApi from "./plugin-api";

type Plugins = Record<string, {
	bundle: string;
	stylesheet?: string | undefined;
}>;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function modules() {
	const plugins: Plugins = await fetch("/plugins.json").then((r) => r.json());
	await loadModules({
		modules: Object.keys(plugins),
		moduleNameTransform: (module) => plugins[module].bundle,
		staticModules: {
			react: React,
			"react/jsx-runtime": JsxRuntime,
			"react-router-dom": ReactRouterDom,
			"@masonmesh/example-vite-react": PluginApi,
		},
	});

	// TODO add stylesheet loading to loadModules or expose a new function
	// TODO the stylesheet should be removed when the plugin is unloaded
	Object.values(plugins).forEach((plugin) => {
		if (plugin.stylesheet) {
			const link = document.createElement("link");
			link.rel = "stylesheet";
			link.href = plugin.stylesheet;
			document.head.appendChild(link);
		}
	});
}

// TODO: does it make sense to move the hook to @masonmesh/react?
export function useModules() {
	const [isLoading, setIsLoading] = React.useState(true);
	const [error, setError] = React.useState<string | null>(null);
	React.useEffect(() => {
		// TODO replace with modules()
		modules()
			.catch(setError)
			.finally(() => setIsLoading(false));
	}, []);

	return { isLoading, error };
}
