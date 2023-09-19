/* eslint-disable @typescript-eslint/no-explicit-any */

import { ExtensionPoint } from "./extensionPoint";
import { GetKey, createBinder, Binder } from "./binder";

export type Plugin<TBinder> = {
	name: string;
	description?: string;
	version?: string;
	onActivate?: (binder: TBinder) => void;
	onDeactivate?: () => void;
};

export function createPluginRegistry<
	TExtensionPointArray extends Array<ExtensionPoint<any, any, any>>,
	TExtensionPoints extends TExtensionPointArray[number],
	TKeys = GetKey<TExtensionPoints>,
	TBinder = Binder<TExtensionPoints, TKeys>,
>(extensionPoints: TExtensionPointArray) {
	const plugins = Array<Plugin<TBinder>>();

	return {
		plugins: () => [...plugins],

		register: function (plugin: Plugin<TBinder>) {
			plugins.push(plugin);
		},

		activate: function (plugin?: string) {
			function activatePlugin(plugin: Plugin<TBinder>) {
				if (plugin.onActivate) {
					// TODO can we get rid of the any here?
					const binder: any = createBinder(extensionPoints, plugin.name);
					plugin.onActivate(binder);
				}
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
			function deactivatePlugin(plugin: Plugin<TBinder>) {
				if (plugin.onDeactivate) {
					plugin.onDeactivate();
				}
				// remove extensions from the extension points
				extensionPoints.forEach((ep) => ep.unbindAllFromPlugin(plugin.name));
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
