import { it, describe, expect, afterEach } from "vitest";
import { useExtension } from "./useExtension";
import { cleanup, screen } from "@testing-library/react";
import React from "react";
import { renderWithProvider } from "./test-ext";

describe("useExtension", () => {
	afterEach(cleanup);

	it("should render extension", () => {
		const Foo = () => {
			const extension = useExtension("foo");
			return <h1>{extension}</h1>;
		};

		renderWithProvider(<Foo />);

		expect(screen.getByRole("heading")).toHaveTextContent("bar");
	});

	it("should render multiple extensions", () => {
		const Bar = () => {
			const extensions = useExtension("bar");
			return (
				<ul>
					{extensions.map((extension) => (
						<li key={extension}>{extension}</li>
					))}
				</ul>
			);
		};

		renderWithProvider(<Bar />);

		const list = screen.getByRole("list");
		expect(list).toHaveTextContent("one");
		expect(list).toHaveTextContent("two");
	});
});
