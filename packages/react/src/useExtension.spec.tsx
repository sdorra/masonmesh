import { it, describe, expect } from "vitest";
import { useExtension } from "./useExtension";
import { extensionPoint } from "@masonmesh/core";
import { render, screen } from "@testing-library/react";
import { ResolverProvider } from "./useResolver";
import React from "react";

const foo = extensionPoint<string>().single("foo");
foo.bind({
	extension: "bar",
});

const bar = extensionPoint<string>().multi("bar");
bar.bind({
	extension: "one",
});
bar.bind({
	extension: "two",
});

const extensionPoints = [foo, bar];

declare module "./types" {
	interface Register {
		extensionPoints: typeof extensionPoints;
	}
}

describe("useExtension", () => {
	function renderWithProvider(children: React.ReactNode) {
		render(
			<ResolverProvider extensionPoints={extensionPoints}>
				{children}
			</ResolverProvider>,
		);
	}

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
