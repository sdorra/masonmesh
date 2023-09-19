import { describe, expect, it } from "vitest";
import { createBinder } from "./binder";
import { extensionPoint } from "./extensionPoint";

describe("test binder", () => {
	it("should allow only valid keys", () => {
		const binder = createBinder([extensionPoint<number>().multi("foo")]);

		binder.bind("foo", 42);
		// @ts-expect-error bar is not a valid key
		expect(() => binder.bind("bar", 42)).toThrow();
	});

	it("should allow only valid types for bind", () => {
		const binder = createBinder([
			extensionPoint<string>().multi("foo"),
			extensionPoint<number>().multi("bar"),
		]);

		// @ts-expect-error only string is allowed for foo
		binder.bind("foo", 42);
		binder.bind("foo", "42");

		// @ts-expect-error only number is allowed for bar
		binder.bind("bar", "42");
		binder.bind("bar", 42);
	});

	it("should pass plugin name to extension", () => {
		const foo = extensionPoint<string>().multi("foo");
		createBinder([foo], "bar").bind("foo", "bar");

		expect(foo.extensions()).toEqual([
			{
				extension: "bar",
				plugin: "bar",
			},
		]);
	});
});
