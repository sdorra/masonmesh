import { cleanup, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { useComponentExtension } from "./useComponentExtension";
import { renderWithProvider } from "./test-ext";

describe("useComponentExtension", () => {
	afterEach(cleanup);

	it("should return single extension", () => {
		const Extension = () => {
			const Title = useComponentExtension("title", {
				props: {
					text: "Hello World",
				},
			});

			if (!Title) {
				return null;
			}
			return <Title />;
		};

		renderWithProvider(<Extension />);

		expect(screen.getByRole("heading")).toHaveTextContent("Hello World");
	});

	it("should return null for empty single extension", () => {
		const Extension = () => {
			const Empty = useComponentExtension("empty.single");

			console.log("empty", Empty);

			if (!Empty) {
				return <h1>Empty</h1>;
			}
			return <Empty />;
		};

		renderWithProvider(<Extension />);

		expect(screen.getByRole("heading")).toHaveTextContent("Empty");
	});

	it("should return multi extension", () => {
		const Extension = () => {
			const list = useComponentExtension("list");
			return (
				<ul>
					{list.map((Item, i) => (
						<Item key={i} />
					))}
				</ul>
			);
		};

		renderWithProvider(<Extension />);

		const list = screen.getByRole("list");
		expect(list).toHaveTextContent("One");
		expect(list).toHaveTextContent("Two");
		expect(list).toHaveTextContent("Three");
	});

	it("should return empty array for empty multi extension", () => {
		const Extension = () => {
			const list = useComponentExtension("empty.multi");
			return <h1>Length: {list.length}</h1>;
		};

		renderWithProvider(<Extension />);

		expect(screen.queryByRole("heading")).toHaveTextContent("Length: 0");
	});

	it("should render extension with matching predicate", () => {
		const Extension = () => {
			const DeleteButton = useComponentExtension("delete.button", {
				predicateParam: {
					isAdmin: true,
				},
			});

			if (!DeleteButton) {
				return null;
			}
			return <DeleteButton />;
		};

		renderWithProvider(<Extension />);

		expect(screen.getByRole("button")).toHaveTextContent("Delete");
	});

	it("should not render extension with non-matching predicate", () => {
		const Extension = () => {
			const DeleteButton = useComponentExtension("delete.button", {
				predicateParam: {
					isAdmin: false,
				},
			});

			if (!DeleteButton) {
				return null;
			}
			return <DeleteButton />;
		};

		renderWithProvider(<Extension />);

		expect(screen.queryByRole("button")).not.toBeInTheDocument();
	});
});
