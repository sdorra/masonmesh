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

		activate: function () {
			plugins.forEach((plugin) => {
				if (plugin.onActivate) {
					const binder = createBinder(extensionPoints, plugin.name);
					// TODO can we get rid of the any cast?
					plugin.onActivate(binder as any);
				}
			});
		},
	};
}
