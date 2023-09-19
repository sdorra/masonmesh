import { describe, expect, it } from "vitest";
import { extensionPoint } from "./extensionPoint";
import { createPluginRegistry } from "./plugin";

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
});
