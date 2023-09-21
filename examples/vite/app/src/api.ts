import { dispatchPluginActivated } from "./events";
import { pluginRegistry } from "./plugins";

type DefinePlugin = typeof pluginRegistry.register;

// TODO we should provide hooks to make this easier
export const definePlugin: DefinePlugin = (plugin) => {
	pluginRegistry.register(plugin);
	pluginRegistry.activate(plugin.name);
	dispatchPluginActivated(plugin.name);
};
