import { describe, it, expect, afterEach } from "vitest";
import { renderWithProvider } from "./test-ext";
import React from "react";
import { ExtensionPoint } from "./ExtensionPoint";
import { screen, cleanup } from "@testing-library/react";

describe("ExtensionPoint", () => {
	afterEach(cleanup);

	it("should render title", () => {
		renderWithProvider(
			<ExtensionPoint id="title" props={{ text: "Awesome" }} />,
		);

		expect(screen.getByRole("heading")).toHaveTextContent("Awesome");
	});

	it("should render extension with matching predicate", () => {
		renderWithProvider(
			<ExtensionPoint id="delete.button" predicateParam={{ isAdmin: true }} />,
		);

		expect(screen.getByRole("button")).toHaveTextContent("Delete");
	});

	it("should not render extension with non-matching predicate", () => {
		renderWithProvider(
			<ExtensionPoint id="delete.button" predicateParam={{ isAdmin: false }} />,
		);

		expect(screen.queryByRole("button")).not.toBeInTheDocument();
	});

	it("should render multi extension", () => {
		renderWithProvider(
			<ul>
				<ExtensionPoint id="list" />
			</ul>,
		);

		const list = screen.getByRole("list");
		expect(list).toHaveTextContent("One");
		expect(list).toHaveTextContent("Two");
		expect(list).toHaveTextContent("Three");
	});

	it("should render fallback if no extension is bound to single", () => {
		renderWithProvider(
			<ExtensionPoint id="empty.single">
				<h1>Fallback</h1>
			</ExtensionPoint>,
		);

		expect(screen.getByRole("heading")).toHaveTextContent("Fallback");
	});

	it("should render fallback if no extension is bound to multi", () => {
		renderWithProvider(
			<ExtensionPoint id="empty.multi">
				<h1>Fallback</h1>
			</ExtensionPoint>,
		);

		expect(screen.getByRole("heading")).toHaveTextContent("Fallback");
	});
});
