// TODO we should provide hooks to make this unnecessary

const eventBus = new EventTarget();

export const dispatchPluginActivated = (pluginName: string) => {
	eventBus.dispatchEvent(
		new CustomEvent("plugin-activated", {
			detail: { pluginName },
		}),
	);
};

export const onPluginActivated = (callback: (pluginName: string) => void) => {
	eventBus.addEventListener("plugin-activated", (event) => {
		callback((event as CustomEvent).detail.pluginName);
	});
};
