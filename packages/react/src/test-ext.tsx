import { extensionPoint } from "@masonmesh/core";
import { render } from "@testing-library/react";
import React, { ReactNode } from "react";
import { ResolverProvider } from "./useResolver";

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

const baz = extensionPoint<string, string>().single("baz");

const list = extensionPoint<() => ReactNode>().multi("list");
list.bind({
	extension: () => <li>One</li>,
});
list.bind({
	extension: () => <li>Two</li>,
});
list.bind({
	extension: () => <li>Three</li>,
});

const quotes = extensionPoint<() => ReactNode>().multi("quotes");
quotes.bind({
	extension: () => <p>One</p>,
});
quotes.bind({
	extension: () => <p>Two</p>,
});
quotes.bind({
	extension: () => <p>Three</p>,
});

const deleteButton = extensionPoint<
	() => ReactNode,
	{ isAdmin: boolean }
>().single("delete.button");

deleteButton.bind({
	extension: () => <button>Delete</button>,
	predicate: ({ isAdmin }) => isAdmin,
});

const title =
	extensionPoint<(props: { text: string }) => ReactNode>().single("title");

title.bind({
	extension: ({ text }) => <h1>{text}</h1>,
});

const emptySingle = extensionPoint<React.FC>().single("empty.single");
const emptyMulti = extensionPoint<React.FC>().multi("empty.multi");

export const extensionPoints = [
	foo,
	bar,
	baz,
	list,
	quotes,
	deleteButton,
	title,
	emptySingle,
	emptyMulti,
];

declare module "./types" {
	interface Register {
		extensionPoints: typeof extensionPoints;
	}
}

export function renderWithProvider(children: React.ReactNode) {
	render(
		<ResolverProvider extensionPoints={extensionPoints}>
			{children}
		</ResolverProvider>,
	);
}
