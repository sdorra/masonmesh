import { definePlugin } from "@masonmesh/example-vite-react";
import { MoviesRoot } from "./MoviesRoot";
import { MoviesCountWidget } from "./MoviesCountWidget";
import { NavLink } from "react-router-dom";
import "./styles.css";

export default definePlugin({
	name: "movies",
	description: "Movies Plugin",
	onActivate: (binder) => {
		binder.bind("root.routes", {
			path: "/movies",
			element: <MoviesRoot />,
		});
		binder.bind("dashboard.widgets", MoviesCountWidget);
		binder.bind("root.navbar.items", () => (
			<NavLink to="/movies">Movies</NavLink>
		));
	},
});
