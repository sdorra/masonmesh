import { describe, expect, it } from "vitest";
import { extensionPoint } from "./extensionPoint";

describe("test extension points", () => {
	it("should bind single extensions", () => {
		const foo = extensionPoint<number>().single("foo");

		foo.bind({
			extension: 42,
		});

		expect(foo.extensions()).toEqual([{ extension: 42 }]);
	});

	it("should bind multiple extensions", () => {
		const foo = extensionPoint<number>().multi("foo");

		foo.bind({
			extension: 42,
		});
		foo.bind({
			extension: 43,
		});

		expect(foo.extensions()).toEqual([{ extension: 42 }, { extension: 43 }]);
	});

	it("should allow only valid types", () => {
		const foo = extensionPoint<number>().multi("foo");

		// @ts-expect-error only number is allowed for foo
		foo.bind({ extension: "foo" });
		foo.bind({
			extension: 42,
		});
	});

	it("should allow only valid types for predicate params", () => {
		const foo = extensionPoint<number, { a: string }>().multi("foo");

		foo.bind({
			extension: 42,
			// @ts-expect-error only {a} is allowed as predicate param
			predicate: ({ b }) => typeof b === "string",
		});
		foo.bind({
			extension: 42,
			predicate: ({ a }) => typeof a === "string",
		});

		// without predicate is also allowed
		foo.bind({
			extension: 42,
		});
	});

	it("should throw an error if a single extension is bound twice", () => {
		const foo = extensionPoint<number>().single("foo");

		foo.bind({
			extension: 42,
		});

		expect(() =>
			foo.bind({
				extension: 42,
			}),
		).toThrow();
	});

	it("should ignore other bind calls with policy first", () => {
		const foo = extensionPoint<number>().single("foo", { policy: "first" });

		foo.bind({
			extension: 42,
		});
		foo.bind({
			extension: 43,
		});

		expect(foo.extensions()).toEqual([{ extension: 42 }]);
	});

	it("should overwrite first bind with policy last", () => {
		const foo = extensionPoint<number>().single("foo", { policy: "last" });

		foo.bind({
			extension: 42,
		});
		foo.bind({
			extension: 43,
		});

		expect(foo.extensions()).toEqual([{ extension: 43 }]);
	});

	it("should throw an error for an invalid policy", () => {
		expect(() =>
			// @ts-expect-error invalid policy
			extensionPoint<number>().single("foo", { policy: "invalid" }),
		).toThrow();
	});

	it("should throw an error if limit is reached", () => {
		const foo = extensionPoint<number>().multi("foo", { limit: 1 });

		foo.bind({
			extension: 42,
		});

		expect(() =>
			foo.bind({
				extension: 43,
			}),
		).toThrow();
	});

	it("should store plugin name with extension", () => {
		const foo = extensionPoint<number>().multi("foo");

		foo.bind({
			extension: 42,
			plugin: "bar",
		});

		expect(foo.extensions()).toEqual([{ extension: 42, plugin: "bar" }]);
	});

	it("should unbind all extensions from plugin", () => {
		const foo = extensionPoint<number>().multi("foo");

		foo.bind({
			extension: 42,
			plugin: "one",
		});
		foo.bind({
			extension: 43,
			plugin: "two",
		});

		foo.unbindAllFromPlugin("two");

		expect(foo.extensions()).toEqual([
			{
				extension: 42,
				plugin: "one",
			},
		]);
	});
});
