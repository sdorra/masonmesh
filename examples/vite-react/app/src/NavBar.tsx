import { ExtensionPoint } from "@masonmesh/react";
import { Link, useLocation } from "react-router-dom";

export function NavBar() {
	const location = useLocation();

	return (
		<nav>
			<ul>
				<li>
					<Link to="/">Dashboard</Link>
				</li>
				<ExtensionPoint
					id="root.navbar.items"
					props={{ location: location.pathname }}
				/>
				<li>
					<Link to="/about">About</Link>
				</li>
			</ul>
		</nav>
	);
}
