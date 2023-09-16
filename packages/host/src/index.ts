type Factory = (...args: unknown[]) => unknown;

type Module = {
	dependencies: string[];
	fn: Factory;
};

export default function () {
	let anonymousModuleId = 0;

	const modules = new Map<string, unknown>();
	const lazyModules = new Map<string, () => Promise<unknown>>();
	const queue = new Map<string, Module>();

	function allDependenciesAvailable(module: Module) {
		for (const dependency of module.dependencies) {
			if (!modules.has(dependency) && !lazyModules.has(dependency)) {
				return false;
			}
		}

		return true;
	}

	async function defineModule(name: string, module: Module) {
		const resolvedDependecies = [];
		for (const dependency of module.dependencies) {
			if (modules.has(dependency)) {
				resolvedDependecies.push(modules.get(dependency));
			} else {
				const lazyModule = lazyModules.get(dependency);
				if (lazyModule) {
					await lazyModule();
					resolvedDependecies.push();
				} else {
					throw new Error(`Module ${dependency} not found`);
				}
			}
		}
		modules.set(name, module.fn(...resolvedDependecies));
	}

	async function resolveAndDefineModule(name: string, module: Module) {
		if (allDependenciesAvailable(module)) {
			defineModule(name, module);
		} else {
			queue.set(name, module);
		}
	}

	async function handleQueue() {
		if (queue.size === 0) {
			return;
		}

		const resolvable = Array.from(queue.entries()).filter((e) =>
			allDependenciesAvailable(e[1]),
		);

		if (resolvable.length > 0) {
			for (const [name, module] of resolvable) {
				await defineModule(name, module);
				queue.delete(name);
			}

			await handleQueue();
		}
	}

	// named module with dependencies
	async function define(
		name: string,
		dependencies: string[],
		factory: Factory,
	): Promise<void>;

	// anonymous module with dependencies
	async function define(
		dependencies: string[],
		factory: Factory,
	): Promise<void>;

	// anonymous module without dependencies
	async function define(factory: Factory): Promise<void>;

	// implementation
	async function define(
		first: string | string[] | Factory,
		second?: string[] | Factory,
		third?: Factory,
	): Promise<void> {
		// check if first argument is name
		let name: string;
		let dependencies: string[];
		let fn: Factory;
		// handle named module
		if (typeof first === "string") {
			name = first;
			dependencies = second as string[];
			fn = third as Factory;
			// handle anonymous module with dependencies
		} else if (Array.isArray(first)) {
			name = `anonymous-${anonymousModuleId++}`;
			dependencies = first as string[];
			fn = second as Factory;
		} else {
			name = `anonymous-${anonymousModuleId++}`;
			dependencies = [];
			fn = first;
		}

		await resolveAndDefineModule(name, { dependencies, fn });
		await handleQueue();
	}

	function defineStatic(name: string, module: unknown) {
		modules.set(name, module);
	}

	function defineLazy(name: string, lazyModule: () => Promise<unknown>) {
		lazyModules.set(name, lazyModule);
	}

	return {
		define,
		defineStatic,
		defineLazy,
	};
}
