import { useExtension } from "@masonmesh/react";
import { RouterProvider, createBrowserRouter } from "react-router-dom";

export function App() {
	const routes = useExtension("root.routes");
	const router = createBrowserRouter([
		{
			path: "/",
			element: <div>Home</div>,
		},
		...routes,
	]);
	return <RouterProvider router={router} />;
}
