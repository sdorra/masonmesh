/* eslint-disable @typescript-eslint/no-explicit-any */

import { ExtensionPoint, GetKey } from "./extensionPoint";
import { createBinder, Binder } from "./binder";

export type Plugin<TBinder> = {
	name: string;
	description?: string;
	version?: string;
	onActivate?: (binder: TBinder) => void;
	onDeactivate?: () => void;
};

type RegisteredPlugin<TBinder> = Plugin<TBinder> & { activated: boolean };

export function createPluginRegistry<
	TExtensionPointArray extends Array<ExtensionPoint<any, any, any, any>>,
	TExtensionPoints extends TExtensionPointArray[number],
	TKeys = GetKey<TExtensionPoints>,
	TBinder = Binder<TExtensionPoints, TKeys>,
>(extensionPoints: TExtensionPointArray) {
	const plugins = Array<RegisteredPlugin<TBinder>>();

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
			plugins.push({ ...plugin, activated: false });
		},

		activate: function (plugin?: string) {
			function activatePlugin(plugin: RegisteredPlugin<TBinder>) {
				if (plugin.activated) {
					throw new Error(`Plugin '${plugin.name}' is already activated.`);
				}
				if (plugin.onActivate) {
					// TODO can we get rid of the any here?
					const binder: any = createBinder(extensionPoints, plugin.name);
					plugin.onActivate(binder);
				}
				plugin.activated = true;
			}

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
	};
}
