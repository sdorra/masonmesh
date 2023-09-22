import { AnyExtensionPoint, GetKey } from "./extensionPoint";
import { createBinder, Binder } from "./binder";

export type Plugin<TBinder> = {
	name: string;
	description?: string;
	version?: string;
	onActivate?: (binder: TBinder) => void;
	onDeactivate?: () => void;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyPlugin = Plugin<any>;

type RegisteredPlugin<TBinder> = Plugin<TBinder> & { activated: boolean };

const events = ["activate", "deactivate", "register"] as const;
type Events = (typeof events)[number];

type Options = {
	autoActivate?: boolean;
};

const defaultOptions: Options = {
	autoActivate: false,
};

export function createPluginRegistry<
	TExtensionPointArray extends Array<AnyExtensionPoint>,
	TExtensionPoints = TExtensionPointArray[number],
	TKeys = GetKey<TExtensionPoints>,
	TBinder = Binder<TExtensionPoints, TKeys>,
>(extensionPoints: TExtensionPointArray, options = defaultOptions) {
	const plugins = Array<RegisteredPlugin<TBinder>>();
	const listeners = new Map<Events, Array<(plugin: Plugin<TBinder>) => void>>();

	function fireEvent(event: Events, plugin: Plugin<TBinder>) {
		const eventListeners = listeners.get(event);
		eventListeners?.forEach((listener) => listener(plugin));
	}

	function activatePlugin(plugin: RegisteredPlugin<TBinder>) {
		if (plugin.activated) {
			throw new Error(`Plugin '${plugin.name}' is already activated.`);
		}
		if (plugin.onActivate) {
			// TODO can we get rid of the type cast here?
			const binder = createBinder(extensionPoints, plugin.name) as TBinder;
			plugin.onActivate(binder);
		}
		plugin.activated = true;
		fireEvent("activate", plugin);
	}

	return {
		plugins: () => {
			return plugins.map((p) => {
				// eslint-disable-next-line @typescript-eslint/no-unused-vars
				const { activated, ...plugin } = p;
				return plugin;
			});
		},

		register: function (plugin: Plugin<TBinder>) {
			if (plugins.find((p) => p.name === plugin.name)) {
				throw new Error(`Plugin '${plugin.name}' already registered.`);
			}
			const registeredPlugin = { ...plugin, activated: false };
			plugins.push(registeredPlugin);
			fireEvent("register", plugin);
			if (options.autoActivate) {
				activatePlugin(registeredPlugin);
			}
		},

		activate: function (plugin?: string) {
			if (plugin) {
				const pluginToActivate = plugins.find((p) => p.name === plugin);
				if (!pluginToActivate) {
					throw new Error(`Plugin '${plugin}' not found.`);
				}
				activatePlugin(pluginToActivate);
			} else {
				plugins.forEach(activatePlugin);
			}
		},

		deactivate: function (plugin?: string) {
			function deactivatePlugin(plugin: RegisteredPlugin<TBinder>) {
				if (!plugin.activated) {
					throw new Error(`Plugin '${plugin.name}' is not activated.`);
				}
				if (plugin.onDeactivate) {
					plugin.onDeactivate();
				}
				// remove extensions from the extension points
				extensionPoints.forEach((ep) => ep.unbindAllFromPlugin(plugin.name));
				plugin.activated = false;
				fireEvent("deactivate", plugin);
			}

			if (plugin) {
				const pluginToDeactivate = plugins.find((p) => p.name === plugin);
				if (!pluginToDeactivate) {
					throw new Error(`Plugin '${plugin}' not found.`);
				}
				deactivatePlugin(pluginToDeactivate);
			} else {
				plugins.forEach(deactivatePlugin);
			}
		},

		addListener: function (
			event: Events,
			listener: (plugin: Plugin<TBinder>) => void,
		) {
			if (!events.includes(event)) {
				throw new Error(`Invalid event '${event}'.`);
			}
			if (!listeners.has(event)) {
				listeners.set(event, []);
			}
			const eventListeners = listeners.get(event)!;
			eventListeners.push(listener);
		},

		removeListener: function (
			event: Events,
			listener: (plugin: Plugin<TBinder>) => void,
		) {
			if (!events.includes(event)) {
				throw new Error(`Invalid event '${event}'.`);
			}
			if (!listeners.has(event)) {
				return;
			}
			const eventListeners = listeners.get(event)!;
			const index = eventListeners.indexOf(listener);
			if (index >= 0) {
				eventListeners.splice(index, 1);
			}
		},
	};
}
