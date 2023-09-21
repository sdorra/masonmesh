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
});
