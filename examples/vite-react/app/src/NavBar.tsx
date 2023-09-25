import { ExtensionPoint } from "@masonmesh/react";
import { NavLink, useLocation } from "react-router-dom";

export function NavBar() {
	const location = useLocation();

	return (
		<nav className="navbar">
			<ul>
				<li>
					<NavLink to="/">Dashboard</NavLink>
				</li>
				<ExtensionPoint
					id="root.navbar.items"
					props={{ location: location.pathname }}
				/>
				<li>
					<NavLink to="/about">About</NavLink>
				</li>
			</ul>
		</nav>
	);
}
