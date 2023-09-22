declare global {
	interface Window {
		define: ReturnType<typeof createModuleLoader>["define"];
	}
}

type Factory = (...args: unknown[]) => unknown;

type Module = {
	dependencies: string[];
	fn: Factory;
};

const events = ["define", "loaded", "queued"] as const;
type Events = (typeof events)[number];
type Listener = (module: string) => void;

type QueuedListener = (module: string, missingDependencies: string[]) => void;

export function createModuleLoader() {
	let anonymousModuleId = 0;

	const modules = new Map<string, unknown>();
	const lazyModules = new Map<string, () => Promise<unknown>>();
	const queue = new Map<string, Module>();
	const queuedListeners: Array<QueuedListener> = [];
	const listeners = new Map<Events, Array<Listener>>();

	function fireEvent(event: Exclude<Events, "queued">, module: string) {
		const eventListeners = listeners.get(event);
		eventListeners?.forEach((listener) => listener(module));
	}

	function fireQueuedEvent(module: string, missingDependencies: string[]) {
		queuedListeners.forEach((listener) =>
			listener(module, missingDependencies),
		);
	}

	function findMissingDependencies(module: Module) {
		const missingDependencies = [];
		for (const dependency of module.dependencies) {
			if (!modules.has(dependency) && !lazyModules.has(dependency)) {
				missingDependencies.push(dependency);
			}
		}

		return missingDependencies;
	}

	function allDependenciesAvailable(module: Module) {
		return findMissingDependencies(module).length === 0;
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
					// this should never happen,
					// because we check for missing dependencies before defining a module
					throw new Error(`Module ${dependency} not found`);
				}
			}
		}
		modules.set(name, module.fn(...resolvedDependecies));
		fireEvent("loaded", name);
	}

	async function resolveAndDefineModule(name: string, module: Module) {
		const missingDependencies = findMissingDependencies(module);
		if (missingDependencies.length === 0) {
			defineModule(name, module);
		} else {
			queue.set(name, module);
			fireQueuedEvent(name, missingDependencies);
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

		fireEvent("define", name);

		await resolveAndDefineModule(name, { dependencies, fn });
		await handleQueue();
	}

	function defineStatic(name: string, module: unknown) {
		modules.set(name, module);
	}

	function defineLazy(name: string, lazyModule: () => Promise<unknown>) {
		lazyModules.set(name, lazyModule);
	}

	function assign() {
		window.define = define;
	}

	function isQueuedListener(
		event: Events,
		listener: Listener | QueuedListener,
	): listener is QueuedListener {
		return typeof listener === "function" && event === "queued";
	}

	function addListener(event: "queued", listener: QueuedListener): void;
	function addListener(event: Events, listener: Listener): void;

	function addListener(event: Events, listener: Listener | QueuedListener) {
		if (isQueuedListener(event, listener)) {
			queuedListeners.push(listener);
		} else {
			const eventListeners = listeners.get(event) || [];
			eventListeners.push(listener);
			listeners.set(event, eventListeners);
		}
	}

	function removeListener(event: "queued", listener: QueuedListener): void;
	function removeListener(event: Events, listener: Listener): void;
	function removeListener(event: Events, listener: Listener | QueuedListener) {
		if (isQueuedListener(event, listener)) {
			const index = queuedListeners.indexOf(listener);
			if (index > -1) {
				queuedListeners.splice(index, 1);
			}
		} else {
			const eventListeners = listeners.get(event);
			if (!eventListeners) {
				return;
			}
			const index = eventListeners.indexOf(listener);
			if (index > -1) {
				eventListeners.splice(index, 1);
			}
		}
	}

	return {
		assign,
		define,
		defineStatic,
		defineLazy,
		addListener,
		removeListener,
	};
}
