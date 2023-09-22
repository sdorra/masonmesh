import { describe, it, expect, beforeEach, vi } from "vitest";
import { loadModules } from "./loadModules";
import { loadScript } from "./scripts";

type DefineFn = () => void;

type FakeWindow = {
	define?: (name: string, deps: string[], fn: DefineFn) => void;
};

describe("loadModules tests", () => {
	const window: FakeWindow = {};

	beforeEach(() => {
		window.define = undefined;
		vi.stubGlobal("window", window);
	});

	it("should load a module", () => {
		const mods: string[] = [];

		loadModules({
			modules: ["foo"],
			loader: function (mod) {
				window.define?.(mod, [], () => {
					mods.push(mod);
				});
				return Promise.resolve();
			},
		});

		expect(mods).toEqual(["foo"]);
	});

	it("should load a module with static dependencies", () => {
		const mods: string[] = [];

		loadModules({
			modules: ["foo"],
			loader: function (mod) {
				window.define?.(mod, ["bar"], () => {
					mods.push(mod);
				});
				return Promise.resolve();
			},
			staticModules: {
				bar: "bar",
			},
		});

		expect(mods).toEqual(["foo"]);
	});

	it("should load a module with lazy dependencies", async () => {
		const mods: string[] = [];

		await loadModules({
			modules: ["foo"],
			loader: function (mod) {
				window.define?.(mod, ["bar"], () => {
					mods.push(mod);
				});
				return Promise.resolve();
			},
			lazyModules: {
				bar: async () => "bar",
			},
		});

		expect(mods).toEqual(["foo"]);
	});

	it("should throw an error if a dependency is not found", async () => {
		await expect(() =>
			loadModules({
				modules: ["foo"],
				loader: function (mod) {
					window.define?.(mod, ["bar"], () => {});
					return Promise.resolve();
				},
			}),
		).rejects.toThrowError(
			"Failed to load modules foo, because of missing dependencies bar",
		);
	});

	it("should contain dependency only once in the error message", async () => {
		await expect(() =>
			loadModules({
				modules: ["one", "two"],
				loader: function (mod) {
					window.define?.(mod, ["bar"], () => {});
					return Promise.resolve();
				},
			}),
		).rejects.toThrowError(
			"Failed to load modules one and two, because of missing dependencies bar",
		);
	});

	it("should contain all missing dependencies in the error message", async () => {
		await expect(() =>
			loadModules({
				modules: ["one", "two"],
				loader: function (mod) {
					window.define?.(mod, ["bar", "baz"], () => {});
					return Promise.resolve();
				},
			}),
		).rejects.toThrowError(
			"Failed to load modules one and two, because of missing dependencies bar and baz",
		);
	});

	it("should use loadScript as default loader", () => {
		vi.mock("./scripts", () => ({
			loadScript: vi.fn(),
		}));

		loadModules({
			modules: ["foo"],
		});

		expect(loadScript).toBeCalledWith("foo");
	});

	it("should return a promise", () => {
		const promise = loadModules({
			modules: ["foo"],
		});

		expect(promise).toBeInstanceOf(Promise);
	});

	it("should resolve promise when all modules are loaded", async () => {
		const promise = loadModules({
			modules: ["foo"],
			loader: function (mod) {
				window.define?.(mod, [], () => {});
				return Promise.resolve();
			},
		});
		await expect(promise).resolves.toBeUndefined();
	});

	it("should reject promise when a module is not loaded", async () => {
		const promise = loadModules({
			modules: ["foo"],
			loader: function () {
				return Promise.resolve();
			},
			timeout: 100,
		});

		await expect(promise).rejects.toThrowError("Failed to load modules foo");
	});

	it("should reject promise when a module could not be loaded", async () => {
		const promise = loadModules({
			modules: ["foo"],
			loader: function (mod) {
				return Promise.reject("Failed to load script " + mod);
			},
		});

		await expect(promise).rejects.toThrowError("Failed to load script foo");
	});

	it("should reject promise when a dependency is missing and the timeout is reached", async () => {
		const promise = loadModules({
			modules: ["foo", "bar"],
			loader: function (mod) {
				if (mod === "foo") {
					window.define?.(mod, ["bar", "baz"], () => {});
				}
				return Promise.resolve();
			},
			timeout: 100,
		});

		await expect(promise).rejects.toThrowError("Failed to load modules foo");
	});
});
