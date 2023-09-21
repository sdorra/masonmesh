import {
	createPluginRegistry,
	createResolver,
	extensionPoint,
} from "@masonmesh/core";

const colors = extensionPoint<string>().multi("colors");
const extensionPoints = [colors];

export const pluginRegistry = createPluginRegistry(extensionPoints);
export const resolver = createResolver(extensionPoints);
