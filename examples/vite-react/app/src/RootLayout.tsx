import { Outlet } from "react-router-dom";
import { NavBar } from "./NavBar";

export function RootLayout() {
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
