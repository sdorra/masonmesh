import { describe, expect, it } from "vitest";
import { extensionPoint } from "./extensionPoint";
import { createResolver } from "./resolver";

describe("test resolver", () => {
	it("should allow only valid keys", () => {
		const ep = extensionPoint<string>().single("foo");
		const resolver = createResolver([ep]);

		// @ts-expect-error should not allow invalid keys
		expect(() => resolver.resolve("bar")).toThrow();
		resolver.resolve("foo");
	});

	it("should only allow predicates if the extension point supports them", () => {
		const foo = extensionPoint<string>().single("foo");
		const bar = extensionPoint<string, string>().single("bar");
		const resolver = createResolver([foo, bar]);

		// @ts-expect-error should not allow predicates
		resolver.resolve("foo", "bar");
		resolver.resolve("bar", "foo");
	});

	it("should return an array if the extension point is multi", () => {
		const ep = extensionPoint<string>().multi("foo");
		const resolver = createResolver([ep]);

		let result = resolver.resolve("foo");
		expect(result).toEqual([]);

		ep.bind({
			extension: "bar",
		});

		result = resolver.resolve("foo");

		expect(result).toEqual(["bar"]);
	});

	it("should return null if no extension is bind to a single extension point", () => {
		const ep = extensionPoint<string>().single("foo");
		const resolver = createResolver([ep]);

		const result = resolver.resolve("foo");

		expect(result).toBeNull();
	});

	it("should return the extension", () => {
		const ep = extensionPoint<string>().single("foo");
		const resolver = createResolver([ep]);

		ep.bind({
			extension: "bar",
		});

		const result = resolver.resolve("foo");

		expect(result).toBe("bar");
	});

	it("should return the extension if the predicate matches", () => {
		const ep = extensionPoint<string, string>().multi("foo");
		const resolver = createResolver([ep]);

		ep.bind({
			extension: "k",
			predicate: (param) => param === "k",
		});

		ep.bind({
			extension: "bar",
			predicate: (param) => param === "p",
		});

		const result = resolver.resolve("foo", "p");
		expect(result).toEqual(["bar"]);
	});
});
