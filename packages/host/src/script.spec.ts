/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, beforeEach, vi } from "vitest";
import { loadScript } from "./scripts";

describe("loadScript tests", () => {
	const body = {
		appendChild: vi.fn(),
		removeChild: vi.fn(),
	};

	type Script = {
		onload?: () => void;
		onerror?: () => void;
	};

	let script: Script = {};

	const document = {
		createElement: (el: string) => {
			script = {};
			if (el !== "script") {
				throw new Error(`Unexpected element ${el}`);
			}
			return script;
		},
		body,
	};

	beforeEach(() => {
		vi.resetAllMocks();

		vi.stubGlobal("document", document);
	});

	it("should assign specified src to script", () => {
		vi.stubGlobal("document", document);
		loadScript("/foo.js");

		expect(script).toHaveProperty("src", "/foo.js");
	});

	it("should specify async attribute", () => {
		loadScript("/foo.js");

		expect(script).toHaveProperty("async", true);
	});

	it("should append and remove script to body", () => {
		loadScript("/foo.js");

		expect(body.appendChild).toHaveBeenCalledWith(script);
		expect(body.removeChild).toHaveBeenCalledWith(script);
	});

	it("should return promise", () => {
		const promise = loadScript("/foo.js");

		expect(promise).toBeInstanceOf(Promise);
	});

	it("should resolve promise when script is loaded", async () => {
		const promise = loadScript("/foo.js");

		script.onload?.();

		await expect(promise).resolves.toBeUndefined();
	});

	it("should reject promise when script load fails", async () => {
		const promise = loadScript("/foo.js");

		script.onerror?.();

		await expect(promise).rejects.toThrowError("Failed to load script /foo.js");
	});
});
