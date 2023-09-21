import { describe, it, expect, beforeEach, vi } from "vitest";
import { createModuleLoader } from "./moduleLoader";

describe("moduleLoader tests", () => {
	let loader: ReturnType<typeof createModuleLoader>;

	beforeEach(() => {
		loader = createModuleLoader();
	});

	it("should load and execute a module without dependencies", async () => {
		let run = false;
		await loader.define("foo", [], () => {
			run = true;
		});

		expect(run).toBe(true);
	});

	it("should load and execute an anonymous module without dependencies", async () => {
		let run = false;
		await loader.define(() => {
			run = true;
		});

		expect(run).toBe(true);
	});

	it("should execute the dependencies before the module", async () => {
		const order: string[] = [];

		await loader.define("one", ["two"], () => {
			order.push("one");
		});

		await loader.define("two", [], () => {
			order.push("two");
		});

		expect(order).toEqual(["two", "one"]);
	});

	it("should execute anonymous module with dependencies", async () => {
		const order: string[] = [];

		await loader.define(["two"], () => {
			order.push("one");
		});

		await loader.define("two", [], () => {
			order.push("two");
		});

		expect(order).toEqual(["two", "one"]);
	});

	it("should handle multiple dependencies", async () => {
		const order: string[] = [];

		await loader.define("one", ["two", "three"], () => {
			order.push("one");
		});

		await loader.define("two", [], () => {
			order.push("two");
		});

		await loader.define("three", [], () => {
			order.push("three");
		});

		expect(order).toEqual(["two", "three", "one"]);
	});

	it("should handle dependencies with dependencies", async () => {
		const order: string[] = [];

		await loader.define("one", ["two"], () => {
			order.push("one");
		});

		await loader.define("two", ["three"], () => {
			order.push("two");
		});

		await loader.define("three", [], () => {
			order.push("three");
		});

		expect(order).toEqual(["three", "two", "one"]);
	});

	it("should handle static defined dependencies", async () => {
		let result = "";

		loader.defineStatic("one", "1 + ");

		await loader.define("two", ["one"], (one) => {
			result = one + "2 = 3";
		});

		expect(result).toEqual("1 + 2 = 3");
	});

	it("should correctly resolve dependencies", async () => {
		let result = "";

		await loader.define("one", ["two", "three"], (two, three) => {
			result = two + "1" + three;
		});

		await loader.define("two", ["three"], (three) => {
			return three + "2";
		});

		await loader.define("three", [], () => {
			return "3";
		});

		expect(result).toEqual("3213");
	});

	it("should assing define to window", async () => {
		const window = vi.fn();
		vi.stubGlobal("window", window);

		loader.assign();

		expect(window).toHaveProperty("define", loader.define);
	});

	it("should not load the lazy module", async () => {
		let run = false;

		await loader.defineLazy("foo", async () => {
			run = true;
		});

		await loader.define("bar", [], () => {
			return "3";
		});

		expect(run).toBe(false);
	});

	it("should load the lazy module when it is needed", async () => {
		let run = false;

		await loader.defineLazy("foo", async () => {
			run = true;
		});

		await loader.define("bar", ["foo"], () => {
			return "3";
		});

		expect(run).toBe(true);
	});

	it("should return empty stats", () => {
		expect(loader.stats()).toEqual({
			modules: 0,
			lazyModules: 0,
			queued: 0,
			defined: 0,
		});
	});

	it("should increase module count for static modules", () => {
		loader.defineStatic("foo", "bar");

		expect(loader.stats()).toEqual({
			modules: 1,
			lazyModules: 0,
			queued: 0,
			defined: 0,
		});
	});

	it("should increase module count for lazy modules", () => {
		loader.defineLazy("foo", async () => {});

		expect(loader.stats()).toEqual({
			modules: 0,
			lazyModules: 1,
			queued: 0,
			defined: 0,
		});
	});

	it("should increase module count for defined modules", () => {
		loader.define("foo", [], () => {});

		expect(loader.stats()).toEqual({
			modules: 1,
			lazyModules: 0,
			queued: 0,
			defined: 1,
		});
	});

	it("should increase module count for queued modules", () => {
		loader.define("foo", ["bar"], () => {});

		expect(loader.stats()).toEqual({
			modules: 0,
			lazyModules: 0,
			queued: 1,
			defined: 1,
		});
	});

	it("should reutrn return queued modules", () => {
		loader.define("foo", ["bar"], () => {});

		expect(loader.queuedModules()).toEqual(["foo"]);
	});
});
