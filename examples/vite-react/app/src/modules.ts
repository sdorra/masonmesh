import * as React from "react";
import * as ReactRouterDom from "react-router-dom";
import * as JsxRuntime from "react/jsx-runtime";
import { loadModules } from "@masonmesh/host";
import * as PluginApi from "./plugin-api";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function modules() {
	const plugins = await fetch("/plugins.json").then((r) => r.json());
	await loadModules({
		modules: plugins,
		moduleNameTransform: (module) => `/plugins/plugin-${module}.js`,
		staticModules: {
			react: React,
			"react/jsx-runtime": JsxRuntime,
			"react-router-dom": ReactRouterDom,
			"@masonmesh/example-vite-react": PluginApi,
		},
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
