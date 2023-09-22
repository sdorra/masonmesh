import { createModuleLoader } from "./moduleLoader";
import { loadScript } from "./scripts";

type Options = {
	modules: string[];
	loader?: (module: string) => Promise<void>;
	moduleNameTransform?: (module: string) => string;
	staticModules?: Record<string, unknown>;
	lazyModules?: Record<string, () => Promise<unknown>>;
	timeout?: number;
};

function toString(items: Iterable<string>) {
	const array = Array.from(items);

	if (array.length === 1) {
		return array[0];
	}

	return array.slice(0, -1).join(", ") + " and " + array.slice(-1);
}

export function loadModules(options: Options) {
	const moduleLoader = createModuleLoader();
	for (const [name, module] of Object.entries(options.staticModules || {})) {
		moduleLoader.defineStatic(name, module);
	}

	for (const [name, module] of Object.entries(options.lazyModules || {})) {
		moduleLoader.defineLazy(name, module);
	}

	const promise = new Promise<number>((resolve, reject) => {
		const loaded: string[] = [];
		const queued = new Map<string, string[]>();

		const timeout = options.timeout || 5000;
		const tid = setTimeout(() => {
			if (queued.size > 0) {
				const mods = toString(queued.keys());
				reject(`Failed to load modules ${mods}`);
			} else {
				// find modules that are not loaded
				const missing = options.modules.filter(
					(module) => !loaded.includes(module),
				);
				const mods = toString(missing);
				reject(`Failed to load modules ${mods}`);
			}
		}, timeout);

		function check() {
			const moduleCount = options.modules.length;
			if (loaded.length === moduleCount) {
				clearTimeout(tid);
				resolve(moduleCount);
			} else if (loaded.length + queued.size === moduleCount) {
				const mods = toString(queued.keys());
				const deps = new Set<string>();
				queued.forEach((missingDependencies) => {
					missingDependencies.forEach((dependency) => deps.add(dependency));
				});
				const missing = toString(deps);
				clearTimeout(tid);
				reject(
					`Failed to load modules ${mods}, because of missing dependencies ${missing}`,
				);
			}
		}

		moduleLoader.addListener("loaded", (mod) => {
			loaded.push(mod);
			check();
		});

		moduleLoader.addListener("queued", (mod, missingDependencies) => {
			queued.set(mod, missingDependencies);
			check();
		});
	});

	moduleLoader.assign();

	const moduleNameTransform =
		options.moduleNameTransform || ((module) => module);
	const loader = options.loader || loadScript;
	const pending = options.modules
		.map(moduleNameTransform)
		.map((m) => loader(m));

	return Promise.all([...pending, promise]).then(() => {
		return;
	});
}
