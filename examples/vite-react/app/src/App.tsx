import { useExtension } from "@masonmesh/react";
import { Outlet, RouterProvider, createBrowserRouter } from "react-router-dom";
import { NavBar } from "./NavBar";
import { Dashboard } from "./Dashboard";
import { About } from "./About";

function RootLayout() {
	return (
		<>
			<header>
				<NavBar />
			</header>
			<main>
				<Outlet />
			</main>
			<footer>Footer</footer>
		</>
	);
}

export function App() {
	const routes = useExtension("root.routes");
	const router = createBrowserRouter([
		{
			path: "/",
			element: <RootLayout />,
			children: [
				{
					element: <Dashboard />,
					index: true,
				},
				...routes,
				{
					path: "/about",
					element: <About />
				}
			],
		},
	]);
	return <RouterProvider router={router} />;
}
