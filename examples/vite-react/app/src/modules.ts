import * as React from "react";
import { loadModules } from "@masonmesh/host";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function modules() {
	await loadModules({
		modules: [],
		moduleNameTransform: (module) => `/plugins/plugin-${module}.js`,
		staticModules: {
			react: React,
		},
	});
}

async function fakeModules() {}

// TODO: does it make sense to move the hook to @masonmesh/react?
export function useModules() {
	const [isLoading, setIsLoading] = React.useState(true);
	const [error, setError] = React.useState<string | null>(null);
	React.useEffect(() => {
		// TODO replace with modules()
		fakeModules()
			.catch(setError)
			.finally(() => setIsLoading(false));
	}, []);

	return { isLoading, error };
}
