import { describe, it, expect, afterEach, beforeAll, afterAll } from "vitest";
import { renderWithProvider } from "./test-ext";
import React from "react";
import { screen, cleanup, render } from "@testing-library/react";
import { useResolver } from "./useResolver";

describe("useResolver tests", () => {
	const consoleError = console.error;

	beforeAll(() => {
		// suppress console.error
		console.error = () => {};
	});

	afterAll(() => {
		// restore console.error
		console.error = consoleError;
	});

	afterEach(cleanup);

	function Foo() {
		const resolver = useResolver();
		return <h1>{resolver.resolve("foo")}</h1>;
	}

	it("should return resolver", () => {
		renderWithProvider(<Foo />);

		expect(screen.getByRole("heading")).toHaveTextContent("bar");
	});

	it("should throw an error without provider", () => {
		expect(() => render(<Foo />)).toThrow();
	});
});
