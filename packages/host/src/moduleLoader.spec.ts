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

	it("should fire define event when module is defined", () => {
		const listener = vi.fn();
		loader.addListener("define", listener);

		loader.define("foo", [], () => {});

		expect(listener).toHaveBeenCalledWith("foo");
	});

	it("should fire loaded event when module is loaded", () => {
		const listener = vi.fn();
		loader.addListener("loaded", listener);

		loader.define("foo", [], () => {});

		expect(listener).toHaveBeenCalledWith("foo");
	});

	it("should not fire loaded event when module is queued", () => {
		const listener = vi.fn();
		loader.addListener("loaded", listener);

		loader.define("foo", ["bar"], () => {});

		expect(listener).not.toHaveBeenCalled();
	});

	it("should fire queued event with missing dependencies", () => {
		const listener = vi.fn();
		loader.addListener("queued", listener);

		loader.define("foo", ["bar"], () => {});

		expect(listener).toHaveBeenCalledWith("foo", ["bar"]);
	});

	it("should notify listener after it is removed", () => {
		const queuedListener = vi.fn();
		loader.addListener("queued", queuedListener);
		loader.removeListener("queued", queuedListener);

		const definedListener = vi.fn();
		loader.addListener("define", definedListener);
		loader.removeListener("define", definedListener);

		loader.define("foo", ["bar"], () => {});

		expect(queuedListener).not.toHaveBeenCalled();
		expect(definedListener).not.toHaveBeenCalled();
	});

	it("should not fail when removing non existing listener", () => {
		const definedListener = vi.fn();
		loader.removeListener("define", definedListener);
	});
});
