import { describe, expect, it } from "vitest";
import { extensionPoint } from "./extensionPoint";
import { AnyPlugin, createPluginRegistry } from "./plugin";

describe("test plugin registry", () => {
	it("should register plugin", () => {
		const registry = createPluginRegistry([]);
		registry.register({
			name: "test",
		});

		expect(registry.plugins()).toEqual([{ name: "test" }]);
	});

	it("should activate plugin", () => {
		const foo = extensionPoint<number>().single("foo");
		const registry = createPluginRegistry([foo]);

		registry.register({
			name: "test",
			onActivate: (binder) => {
				binder.bind("foo", 42);
			},
		});

		registry.activate("test");

		expect(foo.extensions()).toEqual([{ extension: 42, plugin: "test" }]);
	});

	it("should not activate plugin if it is already activated", () => {
		const registry = createPluginRegistry([]);

		registry.register({
			name: "test",
			onActivate: () => {},
		});

		registry.activate("test");

		expect(() => registry.activate("test")).toThrow();
	});

	it("should activate only specified plugin", () => {
		const foo = extensionPoint<number>().single("foo");
		const registry = createPluginRegistry([foo]);

		registry.register({
			name: "test",
			onActivate: (binder) => {
				binder.bind("foo", 42);
			},
		});

		registry.register({
			name: "test2",
			onActivate: (binder) => {
				binder.bind("foo", 43);
			},
		});

		registry.activate("test");

		expect(foo.extensions()).toEqual([{ extension: 42, plugin: "test" }]);
	});

	it("should activate all plugins", () => {
		const foo = extensionPoint<number>().multi("foo");
		const registry = createPluginRegistry([foo]);

		registry.register({
			name: "test",
			onActivate: (binder) => {
				binder.bind("foo", 42);
			},
		});

		registry.register({
			name: "test2",
			onActivate: (binder) => {
				binder.bind("foo", 43);
			},
		});

		registry.activate();

		expect(foo.extensions()).toEqual([
			{ extension: 42, plugin: "test" },
			{ extension: 43, plugin: "test2" },
		]);
	});

	it("should deactivate plugin", () => {
		const foo = extensionPoint<number>().single("foo");
		const registry = createPluginRegistry([foo]);

		registry.register({
			name: "test",
			onActivate: (binder) => {
				binder.bind("foo", 42);
			},
		});

		registry.activate("test");

		expect(foo.extensions()).toEqual([{ extension: 42, plugin: "test" }]);

		registry.deactivate("test");

		expect(foo.extensions()).toEqual([]);
	});

	it("should not deactivate plugin if it is not activated", () => {
		const registry = createPluginRegistry([]);

		registry.register({
			name: "test",
			onActivate: () => {},
		});

		expect(() => registry.deactivate("test")).toThrow();
	});

	it("should call onDeactivate", () => {
		const registry = createPluginRegistry([]);

		let deactivated = false;

		registry.register({
			name: "test",
			onDeactivate: () => {
				deactivated = true;
			},
		});
		registry.activate("test");
		registry.deactivate("test");

		expect(deactivated).toBe(true);
	});

	it("should deactivate only specified plugin", () => {
		const foo = extensionPoint<number>().multi("foo");
		const registry = createPluginRegistry([foo]);

		registry.register({
			name: "test",
			onActivate: (binder) => {
				binder.bind("foo", 42);
			},
		});

		registry.register({
			name: "test2",
			onActivate: (binder) => {
				binder.bind("foo", 43);
			},
		});

		registry.activate();

		expect(foo.extensions()).toEqual([
			{ extension: 42, plugin: "test" },
			{ extension: 43, plugin: "test2" },
		]);

		registry.deactivate("test");

		expect(foo.extensions()).toEqual([{ extension: 43, plugin: "test2" }]);
	});

	it("should deactivate all plugins", () => {
		const foo = extensionPoint<number>().multi("foo");
		const registry = createPluginRegistry([foo]);

		registry.register({
			name: "test",
			onActivate: (binder) => {
				binder.bind("foo", 42);
			},
		});

		registry.register({
			name: "test2",
			onActivate: (binder) => {
				binder.bind("foo", 43);
			},
		});

		registry.activate();

		expect(foo.extensions()).toEqual([
			{ extension: 42, plugin: "test" },
			{ extension: 43, plugin: "test2" },
		]);

		registry.deactivate();

		expect(foo.extensions()).toEqual([]);
	});

	it("should throw an error if plugin is not found", () => {
		const registry = createPluginRegistry([]);

		expect(() => registry.activate("test")).toThrow();
		expect(() => registry.deactivate("test")).toThrow();
	});

	it("should throw an error if plugin is already registered", () => {
		const registry = createPluginRegistry([]);

		registry.register({
			name: "test",
		});

		expect(() =>
			registry.register({
				name: "test",
			}),
		).toThrow();
	});

	it("should use a binder which only allows valid types", () => {
		const foo = extensionPoint<number>().single("foo", { policy: "first" });
		const registry = createPluginRegistry([foo]);

		registry.register({
			name: "test",
			onActivate: (binder) => {
				binder.bind("foo", 42);
				// @ts-expect-error only number is allowed for foo
				binder.bind("foo", "42");
				// @ts-expect-error bar does not exist
				expect(() => binder.bind("bar", "42")).toThrow(
					new Error("Extension point 'bar' not found."),
				);
			},
		});

		registry.activate("test");

		expect(foo.extensions()).toEqual([{ extension: 42, plugin: "test" }]);
	});

	it("should fire event if plugin is registered", () => {
		const pluginRegistry = createPluginRegistry([]);
		let registeredPlugin = "";
		pluginRegistry.addListener("register", (plugin) => {
			registeredPlugin = plugin.name;
		});

		pluginRegistry.register({
			name: "test",
		});

		expect(registeredPlugin).toBe("test");
	});

	it("should notify multiple listeners", () => {
		const pluginRegistry = createPluginRegistry([]);
		let registeredPlugin1 = "";
		let registeredPlugin2 = "";
		pluginRegistry.addListener("register", (plugin) => {
			registeredPlugin1 = plugin.name;
		});
		pluginRegistry.addListener("register", (plugin) => {
			registeredPlugin2 = plugin.name;
		});

		pluginRegistry.register({
			name: "test",
		});

		expect(registeredPlugin1).toBe("test");
		expect(registeredPlugin2).toBe("test");
	});

	it("should not notify removed listeners", () => {
		const pluginRegistry = createPluginRegistry([]);
		let registeredPlugin1 = "";
		let registeredPlugin2 = "";
		const listener1 = (plugin: AnyPlugin) => {
			registeredPlugin1 = plugin.name;
		};
		const listener2 = (plugin: AnyPlugin) => {
			registeredPlugin2 = plugin.name;
		};
		pluginRegistry.addListener("register", listener1);
		pluginRegistry.addListener("register", listener2);
		pluginRegistry.removeListener("register", listener1);

		pluginRegistry.register({
			name: "test",
		});

		expect(registeredPlugin1).toBe("");
		expect(registeredPlugin2).toBe("test");
	});

	it("should not notify listeners if no plugin is registered", () => {
		const pluginRegistry = createPluginRegistry([]);
		let registeredPlugin = "";
		pluginRegistry.addListener("register", (plugin) => {
			registeredPlugin = plugin.name;
		});

		expect(registeredPlugin).toBe("");
	});

	it("should fire event if plugin is activated", () => {
		const pluginRegistry = createPluginRegistry([]);

		let activatedPlugin = "";
		pluginRegistry.addListener("activate", (plugin) => {
			activatedPlugin = plugin.name;
		});

		pluginRegistry.register({
			name: "test",
		});
		pluginRegistry.activate("test");

		expect(activatedPlugin).toBe("test");
	});

	it("should fire event if plugin is deactivated", () => {
		const pluginRegistry = createPluginRegistry([]);

		let deactivatedPlugin = "";
		pluginRegistry.addListener("deactivate", (plugin) => {
			deactivatedPlugin = plugin.name;
		});

		pluginRegistry.register({
			name: "test",
		});
		pluginRegistry.activate("test");
		pluginRegistry.deactivate("test");

		expect(deactivatedPlugin).toBe("test");
	});

	it("should throw an error if event is invalid", () => {
		const pluginRegistry = createPluginRegistry([]);

		expect(() =>
			// @ts-expect-error invalid event
			pluginRegistry.addListener("invalid", () => {}),
		).toThrow();

		expect(() =>
			// @ts-expect-error invalid event
			pluginRegistry.removeListener("invalid", () => {}),
		).toThrow();
	});

	it("should do nothing if a non existing listener is removed", () => {
		const pluginRegistry = createPluginRegistry([]);

		expect(() =>
			pluginRegistry.removeListener("register", () => {}),
		).not.toThrow();
	});
});
