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

		registry.activate();

		expect(foo.extensions()).toEqual([{ extension: 42, plugin: "test" }]);
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

		registry.activate();

		expect(foo.extensions()).toEqual([{ extension: 42, plugin: "test" }]);
	});
});
